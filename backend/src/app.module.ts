import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserOrmEntity } from "./infrastructure/database/entities/user.orm-entity";
import { ConversationOrmEntity } from "./infrastructure/database/entities/conversation.orm-entity";
import { MessageOrmEntity } from "./infrastructure/database/entities/message.orm-entity";
import { PresentationModule } from "./presentation/presentation.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get("NODE_ENV") === "production";
        return {
          type: "postgres",
          host: config.get("DB_HOST", "localhost"),
          port: config.get<number>("DB_PORT", 5432),
          username: config.get("DB_USER", "postgres"),
          password: config.get("DB_PASSWORD", "postgres"),
          database: config.get("DB_NAME", "chat_db"),
          // SSL obligatoire pour Neon en production
          ssl: isProd ? { rejectUnauthorized: false } : false,
          entities: [UserOrmEntity, ConversationOrmEntity, MessageOrmEntity],
          // synchronize uniquement en dev — migrations en prod
          synchronize: !isProd,
          logging: !isProd,
        };
      },
    }),

    PresentationModule,
  ],
})
export class AppModule {}
