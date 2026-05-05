import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(private readonly config: ConfigService) {
    this.cloudName = config.get<string>("CLOUDINARY_CLOUD_NAME", "");
    this.apiKey = config.get<string>("CLOUDINARY_API_KEY", "");
    this.apiSecret = config.get<string>("CLOUDINARY_API_SECRET", "");

    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      this.logger.warn(
        "⚠️  Cloudinary not fully configured (CLOUD_NAME / API_KEY / API_SECRET)"
      );
    }
  }

  async uploadAvatar(base64Data: string, userId: string): Promise<string> {
    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      throw new BadRequestException(
        "Avatar upload not available: Cloudinary is not configured."
      );
    }

    const timestamp = Math.round(Date.now() / 1000).toString();
    const publicId = `avatar_${userId.replace(/-/g, "")}`;
    const folder = "chat-app-avatars";

    // Signature HMAC-SHA1 sur les paramètres triés alphabétiquement
    const paramsToSign = [
      `folder=${folder}`,
      `overwrite=true`,
      `public_id=${publicId}`,
      `timestamp=${timestamp}`,
    ]
      .sort()
      .join("&");

    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + this.apiSecret)
      .digest("hex");

    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    const body = new URLSearchParams({
      file: base64Data,
      api_key: this.apiKey,
      timestamp,
      signature,
      public_id: publicId,
      folder,
      overwrite: "true",
    });

    this.logger.log(`Uploading avatar (signed) for user ${userId}...`);

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
    } catch (err) {
      this.logger.error("Network error reaching Cloudinary", err);
      throw new BadRequestException("Could not reach Cloudinary.");
    }

    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`Cloudinary error ${response.status}: ${errText}`);
      throw new BadRequestException(
        `Upload failed (${response.status}): ${errText}`
      );
    }

    const data = (await response.json()) as { secure_url: string };
    this.logger.log(`Avatar uploaded: ${data.secure_url}`);
    return data.secure_url;
  }
}
