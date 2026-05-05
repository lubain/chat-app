import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly cloudName: string;
  private readonly uploadPreset: string;

  constructor(private readonly config: ConfigService) {
    this.cloudName = config.get<string>("CLOUDINARY_CLOUD_NAME", "");
    this.uploadPreset = config.get<string>("CLOUDINARY_UPLOAD_PRESET", "");

    if (!this.cloudName || !this.uploadPreset) {
      this.logger.warn("⚠️  Cloudinary not configured");
    }
  }

  async uploadAvatar(base64Data: string, _userId: string): Promise<string> {
    if (!this.cloudName || !this.uploadPreset) {
      throw new BadRequestException(
        "Avatar upload not available: Cloudinary is not configured."
      );
    }

    this.logger.log(`Uploading avatar...`);

    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

    // Unsigned upload — only file + upload_preset (minimal params, no slash issues)
    const body = new URLSearchParams();
    body.append("file", base64Data);
    body.append("upload_preset", this.uploadPreset);

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
    } catch (networkErr) {
      this.logger.error("Network error reaching Cloudinary", networkErr);
      throw new BadRequestException("Could not reach Cloudinary.");
    }

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`Cloudinary error ${response.status}: ${errText}`);
      throw new BadRequestException(
        `Cloudinary upload failed (${response.status}): ${errText}`
      );
    }

    const data = (await response.json()) as { secure_url: string };
    this.logger.log(`Avatar uploaded: ${data.secure_url}`);
    return data.secure_url;
  }
}
