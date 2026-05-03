import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import {
  Message,
  MessageStatus,
} from "../../../domain/entities/message.entity";
import {
  IMessageRepository,
  MESSAGE_REPOSITORY,
} from "../../../domain/repositories/message.repository.interface";
import {
  IConversationRepository,
  CONVERSATION_REPOSITORY,
} from "../../../domain/repositories/conversation.repository.interface";
import { SendMessageDto, MessageResponseDto } from "../../dtos/message.dto";

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: IConversationRepository
  ) {}

  async execute(
    senderId: string,
    dto: SendMessageDto
  ): Promise<MessageResponseDto> {
    const conversation = await this.conversationRepository.findById(
      dto.conversationId
    );
    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    if (!conversation.hasParticipant(senderId)) {
      throw new ForbiddenException(
        "You are not a participant of this conversation"
      );
    }

    const message = new Message(
      uuidv4(),
      dto.conversationId,
      senderId,
      dto.content.trim(),
      MessageStatus.SENT,
      new Date(),
      new Date()
    );

    const saved = await this.messageRepository.save(message);

    conversation.updateLastMessage(saved.id);
    await this.conversationRepository.update(conversation);

    return {
      id: saved.id,
      conversationId: saved.conversationId,
      senderId: saved.senderId,
      content: saved.content,
      status: saved.status,
      createdAt: saved.createdAt,
    };
  }
}
