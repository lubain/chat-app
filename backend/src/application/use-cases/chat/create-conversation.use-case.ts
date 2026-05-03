import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { Conversation } from "../../../domain/entities/conversation.entity";
import {
  IConversationRepository,
  CONVERSATION_REPOSITORY,
} from "../../../domain/repositories/conversation.repository.interface";
import {
  IUserRepository,
  USER_REPOSITORY,
} from "../../../domain/repositories/user.repository.interface";
import {
  CreateConversationDto,
  ConversationResponseDto,
} from "../../dtos/conversation.dto";

@Injectable()
export class CreateConversationUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepo: IConversationRepository,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository
  ) {}

  async execute(
    userId: string,
    dto: CreateConversationDto
  ): Promise<ConversationResponseDto> {
    if (userId === dto.targetUserId) {
      throw new BadRequestException("Cannot create conversation with yourself");
    }

    const targetUser = await this.userRepo.findById(dto.targetUserId);
    if (!targetUser) throw new NotFoundException("User not found");

    const existing = await this.conversationRepo.findByParticipants(
      userId,
      dto.targetUserId
    );
    if (existing) {
      return {
        id: existing.id,
        participant: {
          id: targetUser.id,
          name: targetUser.name,
          avatarUrl: targetUser.avatarUrl,
          status: targetUser.status,
        },
        lastMessage: null,
        unreadCount: 0,
        updatedAt: existing.updatedAt,
      };
    }

    const conversation = new Conversation(
      uuidv4(),
      [userId, dto.targetUserId],
      null,
      new Date(),
      new Date()
    );

    const saved = await this.conversationRepo.save(conversation);

    return {
      id: saved.id,
      participant: {
        id: targetUser.id,
        name: targetUser.name,
        avatarUrl: targetUser.avatarUrl,
        status: targetUser.status,
      },
      lastMessage: null,
      unreadCount: 0,
      updatedAt: saved.updatedAt,
    };
  }
}
