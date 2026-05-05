import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryService {
  private readonly cloudName: string;
  private readonly uploadPreset: string;

  constructor(private readonly config: ConfigService) {
    this.cloudName = config.get<string>('CLOUDINARY_CLOUD_NAME', '');
    this.uploadPreset = config.get<string>('CLOUDINARY_UPLOAD_PRESET', '');
  }

  async uploadAvatar(base64Data: string, userId: string): Promise<string> {
    if (!this.cloudName || !this.uploadPreset) {
      throw new BadRequestException('Cloudinary not configured');
    }

    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

    const params = new URLSearchParams({
      file: base64Data,
      upload_preset: this.uploadPreset,
      public_id: `chat-app/avatars/${userId}`,
      overwrite: 'true',
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new BadRequestException(`Upload failed: ${err}`);
    }

    const data = await response.json() as { secure_url: string };
    return data.secure_url;
  }
}
