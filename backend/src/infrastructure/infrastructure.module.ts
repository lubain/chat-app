import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { UserOrmEntity } from "./database/entities/user.orm-entity";
import { ConversationOrmEntity } from "./database/entities/conversation.orm-entity";
import { MessageOrmEntity } from "./database/entities/message.orm-entity";
import { UserRepository } from "./database/repositories/user.repository";
import { ConversationRepository } from "./database/repositories/conversation.repository";
import { MessageRepository } from "./database/repositories/message.repository";
import { RedisPresenceService } from "./redis/redis-presence.service";
import { USER_REPOSITORY } from "../domain/repositories/user.repository.interface";
import { CONVERSATION_REPOSITORY } from "../domain/repositories/conversation.repository.interface";
import { MESSAGE_REPOSITORY } from "../domain/repositories/message.repository.interface";
import { PRESENCE_SERVICE } from "../application/ports/presence.service.interface";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserOrmEntity,
      ConversationOrmEntity,
      MessageOrmEntity,
    ]),
  ],
  providers: [
    { provide: USER_REPOSITORY, useClass: UserRepository },
    { provide: CONVERSATION_REPOSITORY, useClass: ConversationRepository },
    { provide: MESSAGE_REPOSITORY, useClass: MessageRepository },
    { provide: PRESENCE_SERVICE, useClass: RedisPresenceService },
  ],
  exports: [
    USER_REPOSITORY,
    CONVERSATION_REPOSITORY,
    MESSAGE_REPOSITORY,
    PRESENCE_SERVICE,
  ],
})
export class InfrastructureModule {}
