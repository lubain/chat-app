import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { IPresenceService } from "../../application/ports/presence.service.interface";

@Injectable()
export class RedisPresenceService implements IPresenceService, OnModuleDestroy {
  private readonly client: Redis;
  private readonly ONLINE_TTL = 300;
  private readonly PREFIX = "presence:";

  constructor(private readonly config: ConfigService) {
    const isProd = config.get("NODE_ENV") === "production";

    this.client = new Redis({
      host: config.get("REDIS_HOST", "localhost"),
      port: config.get<number>("REDIS_PORT", 6379),
      password: config.get("REDIS_PASSWORD"),
      // TLS obligatoire pour Upstash en production
      tls: isProd ? {} : undefined,
      lazyConnect: true,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  async setOnline(userId: string, socketId: string): Promise<void> {
    const key = this.key(userId);
    await this.client.sadd(key, socketId);
    await this.client.expire(key, this.ONLINE_TTL);
  }

  async setOffline(userId: string, socketId: string): Promise<void> {
    const key = this.key(userId);
    await this.client.srem(key, socketId);
  }

  async isOnline(userId: string): Promise<boolean> {
    const count = await this.client.scard(this.key(userId));
    return count > 0;
  }

  async getSocketIds(userId: string): Promise<string[]> {
    return this.client.smembers(this.key(userId));
  }

  async getOnlineUsers(userIds: string[]): Promise<string[]> {
    if (!userIds.length) return [];
    const pipeline = this.client.pipeline();
    for (const id of userIds) pipeline.scard(this.key(id));
    const results = await pipeline.exec();
    return userIds.filter((_, i) => {
      const count = results?.[i]?.[1] as number;
      return count > 0;
    });
  }

  private key(userId: string): string {
    return `${this.PREFIX}${userId}`;
  }
}
