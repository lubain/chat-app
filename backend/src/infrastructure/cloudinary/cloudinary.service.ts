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
      this.logger.warn(
        "⚠️  Cloudinary not configured — CLOUDINARY_CLOUD_NAME or CLOUDINARY_UPLOAD_PRESET missing"
      );
    }
  }

  async uploadAvatar(base64Data: string, userId: string): Promise<string> {
    if (!this.cloudName || !this.uploadPreset) {
      throw new BadRequestException(
        "Avatar upload not available: Cloudinary is not configured on this server."
      );
    }

    this.logger.log(`Uploading avatar for user ${userId} to Cloudinary...`);

    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

    // Use FormData-style multipart — handles large base64 better than URLSearchParams
    const body = new URLSearchParams();
    body.append("file", base64Data);
    body.append("upload_preset", this.uploadPreset);
    body.append("public_id", `chat-app/avatars/${userId}`);
    body.append("overwrite", "true");
    body.append("invalidate", "true"); // purge CDN cache for same public_id
    body.append("transformation", "w_200,h_200,c_fill,g_face,q_auto,f_webp"); // resize + optimize

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
    } catch (networkErr) {
      this.logger.error("Network error reaching Cloudinary", networkErr);
      throw new BadRequestException(
        "Could not reach Cloudinary. Check network."
      );
    }

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`Cloudinary error ${response.status}: ${errText}`);
      throw new BadRequestException(
        `Cloudinary upload failed (${response.status}): ${errText}`
      );
    }

    const data = (await response.json()) as {
      secure_url: string;
      public_id: string;
    };
    this.logger.log(`Avatar uploaded: ${data.secure_url}`);
    return data.secure_url;
  }
}
