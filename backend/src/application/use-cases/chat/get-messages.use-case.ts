import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import {
  IConversationRepository,
  CONVERSATION_REPOSITORY,
} from "../../../domain/repositories/conversation.repository.interface";
import {
  IMessageRepository,
  MESSAGE_REPOSITORY,
} from "../../../domain/repositories/message.repository.interface";
import { MessageResponseDto } from "../../dtos/message.dto";

@Injectable()
export class GetMessagesUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepo: IConversationRepository,
    @Inject(MESSAGE_REPOSITORY) private readonly messageRepo: IMessageRepository
  ) {}

  async execute(
    userId: string,
    conversationId: string,
    limit = 50,
    before?: string
  ): Promise<MessageResponseDto[]> {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) throw new NotFoundException("Conversation not found");
    if (!conversation.hasParticipant(userId))
      throw new ForbiddenException("Access denied");

    const beforeDate = before ? new Date(before) : undefined;
    const messages = await this.messageRepo.findByConversationId(
      conversationId,
      limit,
      beforeDate
    );

    return messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      content: m.content,
      status: m.status,
      messageType: m.messageType,
      imageUrl: m.imageUrl,
      createdAt: m.createdAt,
    }));
  }
}
