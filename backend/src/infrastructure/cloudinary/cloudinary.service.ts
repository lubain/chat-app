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
      this.logger.warn("⚠️  Cloudinary not fully configured");
    }
  }

  async upload(base64Data: string, publicId: string): Promise<string> {
    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      throw new BadRequestException(
        "Cloudinary is not configured on this server."
      );
    }

    const timestamp = Math.round(Date.now() / 1000).toString();

    const paramsToSign = [
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
      overwrite: "true",
    });

    this.logger.log(`Uploading image (public_id: ${publicId})...`);

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
    this.logger.log(`Uploaded: ${data.secure_url}`);
    return data.secure_url;
  }

  uploadAvatar(base64Data: string, userId: string): Promise<string> {
    const publicId = `avatar_${userId.replace(/-/g, "")}`;
    return this.upload(base64Data, publicId);
  }

  uploadMessageImage(base64Data: string, messageId: string): Promise<string> {
    const publicId = `msg_${messageId.replace(/-/g, "")}`;
    return this.upload(base64Data, publicId);
  }
}
