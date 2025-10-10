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
    if (!buffer) throw new Error('Buffer is empty');
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
    if (!publicId) return { result: 'not_found' };
    return cloudinary.uploader.destroy(publicId);
  }

  private extractPublicId(url: string): string | null {
    try {
      const pathname = new URL(url).pathname;
      const segments = pathname.split('/');
      const versionIdx = segments.findIndex((s) => s.startsWith('v') && /^v\d+$/i.test(s));
      if (versionIdx === -1) return null;
      const publicIdWithExt = segments.slice(versionIdx + 1).join('/');
      return publicIdWithExt.replace(/\.[^/.]+$/, '') || null;
    } catch {
      return null;
    }
  }
}
