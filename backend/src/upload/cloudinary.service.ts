
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import util from 'node:util';

@Injectable()
export class CloudinaryService {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  private async uploadWithRetry(
    buffer: Buffer,
    folder: string,
    attempt = 1,
    maxAttempts = 3
  ): Promise<UploadApiResponse> {
    try {
      return await new Promise((resolve, reject) => {
        const uploadTimeout = setTimeout(() => {
          reject(new Error('Upload timeout after 30 seconds'));
        }, 30000); // 30 second timeout

        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true,
            timeout: 25000, // 25 second Cloudinary API timeout
            quality: 'auto:good', // Optimize quality
            fetch_format: 'auto', // Auto-optimize format
            flags: 'attachment', // Preserve original filename
          },
          (error, result) => {
            clearTimeout(uploadTimeout);
            if (error || !result) {
              const errMsg = error instanceof Error ? error : (() => {
                try {
                  return new Error(JSON.stringify(error));
                } catch {
                  return new Error(util.inspect(error, { depth: null }));
                }
              })();
              return reject(errMsg);
            }
            resolve(result);
          }
        );

        // Handle stream errors
        stream.on('error', (error) => {
          clearTimeout(uploadTimeout);
          reject(new Error(`Stream error: ${error.message}`));
        });

        const readStream = Readable.from(buffer);
        readStream.on('error', (error) => {
          clearTimeout(uploadTimeout);
          reject(new Error(`Read stream error: ${error.message}`));
        });

        readStream.pipe(stream);
      });
    } catch (error) {
      if (attempt < maxAttempts) {
        // Exponential backoff delay
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.uploadWithRetry(buffer, folder, attempt + 1, maxAttempts);
      }
      throw error;
    }
  }

  async uploadBuffer(
    buffer: Buffer,
    folder = 'expenses',
  ): Promise<UploadApiResponse> {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      throw new Error('Invalid or empty buffer');
    }

    try {
      // Optimize buffer size if it's an image
      if (buffer.length > 1024 * 1024) { // If larger than 1MB
        // You might want to add image compression here
        // For now, we'll just warn about large files
        console.warn(`Large file detected: ${(buffer.length / (1024 * 1024)).toFixed(2)}MB`);
      }

      return await this.uploadWithRetry(buffer, folder);
    } catch (error) {
      console.error('Upload failed after retries:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }


  async deleteByUrl(url: string): Promise<{ result: string }> {
    const publicId = this.extractPublicId(url);
    if (!publicId) return { result: 'not_found' };
    return cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  }

  private extractPublicId(url: string): string | null {
    try {
      const pathname = new URL(url).pathname;
      const segments = pathname.split('/');
      const versionIdx = segments.findIndex((s) => s.startsWith('v') && /^v\d+$/i.test(s));
      if (versionIdx === -1) return null;
      return segments.slice(versionIdx + 1).join('/').replace(/\.[^/.]+$/, '') || null;
    } catch {
      return null;
    }
  }
}
