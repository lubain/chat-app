import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { ApplicationModule } from "../application/application.module";
import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { AuthController } from "./controllers/auth.controller";
import { ConversationController } from "./controllers/conversation.controller";
import { UsersController } from "./controllers/users.controller";
import { ChatGateway } from "./gateways/chat.gateway";
import { JwtStrategy } from "../shared/config/jwt.strategy";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    ApplicationModule,
    InfrastructureModule,
  ],
  providers: [JwtStrategy, ChatGateway],
  controllers: [AuthController, ConversationController, UsersController],
})
export class PresentationModule {}
