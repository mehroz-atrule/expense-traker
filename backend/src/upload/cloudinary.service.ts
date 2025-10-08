import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

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

  async uploadBuffer(buffer: Buffer, folder = 'expenses'): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
        if (error || !result) return reject(error);
        resolve(result);
      });
      Readable.from(buffer).pipe(stream);
    });
  }

  async deleteByUrl(url: string): Promise<{ result: string }> {
    const publicId = this.extractPublicId(url);
    if (!publicId) {
      return { result: 'not_found' };
    }
    return cloudinary.uploader.destroy(publicId);
  }

  private extractPublicId(url: string): string | null {
    try {
      // Example: https://res.cloudinary.com/<cloud>/image/upload/v1699999999/expenses/abc123.jpg
      const pathname = new URL(url).pathname; // /<type>/upload/v.../expenses/abc123.jpg
      const segments = pathname.split('/');
      // public id is everything after the version segment, without extension
      const versionIdx = segments.findIndex((s) => s.startsWith('v') && /^v\d+$/i.test(s));
      const publicIdWithExt = segments.slice(versionIdx + 1).join('/');
      const withoutExt = publicIdWithExt.replace(/\.[^/.]+$/, '');
      return withoutExt || null;
    } catch {
      return null;
    }
  }
}
