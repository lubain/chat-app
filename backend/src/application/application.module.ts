import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { UserOrmEntity } from "../infrastructure/database/entities/user.orm-entity";

// Auth use cases
import { RegisterUserUseCase } from "./use-cases/auth/register-user.use-case";
import { LoginUserUseCase } from "./use-cases/auth/login-user.use-case";
import { LogoutUserUseCase } from "./use-cases/auth/logout-user.use-case";

// Chat use cases
import { SendMessageUseCase } from "./use-cases/chat/send-message.use-case";
import { GetConversationsUseCase } from "./use-cases/chat/get-conversations.use-case";
import { GetMessagesUseCase } from "./use-cases/chat/get-messages.use-case";
import { CreateConversationUseCase } from "./use-cases/chat/create-conversation.use-case";

// User use cases
import { GetUsersUseCase } from "./use-cases/user/get-users.use-case";

@Module({
  imports: [
    InfrastructureModule,
    TypeOrmModule.forFeature([UserOrmEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET", "changeme-secret"),
        signOptions: { expiresIn: config.get("JWT_EXPIRES_IN", "7d") },
      }),
    }),
  ],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    LogoutUserUseCase,
    SendMessageUseCase,
    GetConversationsUseCase,
    GetMessagesUseCase,
    CreateConversationUseCase,
    GetUsersUseCase,
  ],
  exports: [
    JwtModule,
    RegisterUserUseCase,
    LoginUserUseCase,
    LogoutUserUseCase,
    SendMessageUseCase,
    GetConversationsUseCase,
    GetMessagesUseCase,
    CreateConversationUseCase,
    GetUsersUseCase,
  ],
})
export class ApplicationModule {}
