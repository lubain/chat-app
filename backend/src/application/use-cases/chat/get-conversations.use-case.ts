import { Injectable, Inject } from "@nestjs/common";
import {
  IConversationRepository,
  CONVERSATION_REPOSITORY,
} from "../../../domain/repositories/conversation.repository.interface";
import {
  IUserRepository,
  USER_REPOSITORY,
} from "../../../domain/repositories/user.repository.interface";
import {
  IMessageRepository,
  MESSAGE_REPOSITORY,
} from "../../../domain/repositories/message.repository.interface";
import {
  IPresenceService,
  PRESENCE_SERVICE,
} from "../../ports/presence.service.interface";
import { ConversationResponseDto } from "../../dtos/conversation.dto";

@Injectable()
export class GetConversationsUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepo: IConversationRepository,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepo: IMessageRepository,
    @Inject(PRESENCE_SERVICE) private readonly presenceService: IPresenceService
  ) {}

  async execute(userId: string): Promise<ConversationResponseDto[]> {
    const conversations = await this.conversationRepo.findAllByUserId(userId);

    const results = await Promise.all(
      conversations.map(async (conv) => {
        const otherId = conv.getOtherParticipant(userId);
        if (!otherId) return null;

        const [otherUser, unreadCount, isOnline] = await Promise.all([
          this.userRepo.findById(otherId),
          this.messageRepo.countUnread(conv.id, userId),
          this.presenceService.isOnline(otherId),
        ]);

        if (!otherUser) return null;

        let lastMessage = null;
        if (conv.lastMessageId) {
          const msg = await this.messageRepo.findById(conv.lastMessageId);
          if (msg) {
            lastMessage = {
              content: msg.content,
              createdAt: msg.createdAt,
              senderId: msg.senderId,
            };
          }
        }

        return {
          id: conv.id,
          participant: {
            id: otherUser.id,
            name: otherUser.name,
            avatarUrl: otherUser.avatarUrl,
            status: isOnline ? "online" : "offline",
          },
          lastMessage,
          unreadCount,
          updatedAt: conv.updatedAt,
        } satisfies ConversationResponseDto;
      })
    );

    return results.filter(Boolean) as ConversationResponseDto[];
  }
}
