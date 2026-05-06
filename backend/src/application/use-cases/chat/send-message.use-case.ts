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
  MessageType,
} from "../../../domain/entities/message.entity";
import {
  IMessageRepository,
  MESSAGE_REPOSITORY,
} from "../../../domain/repositories/message.repository.interface";
import {
  IConversationRepository,
  CONVERSATION_REPOSITORY,
} from "../../../domain/repositories/conversation.repository.interface";
import { MessageResponseDto } from "../../dtos/message.dto";

interface SendMessageInput {
  conversationId: string;
  senderId: string;
  content?: string;
  messageType?: MessageType;
  imageUrl?: string | null;
}

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: IConversationRepository
  ) {}

  async execute(input: SendMessageInput): Promise<MessageResponseDto> {
    const conversation = await this.conversationRepository.findById(
      input.conversationId
    );
    if (!conversation) throw new NotFoundException("Conversation not found");
    if (!conversation.hasParticipant(input.senderId)) {
      throw new ForbiddenException(
        "You are not a participant of this conversation"
      );
    }

    const type = input.messageType ?? MessageType.TEXT;
    const content =
      type === MessageType.IMAGE ? "📷 Image" : input.content?.trim() ?? "";

    const message = new Message(
      uuidv4(),
      input.conversationId,
      input.senderId,
      content,
      MessageStatus.SENT,
      new Date(),
      new Date(),
      type,
      input.imageUrl ?? null
    );

    const saved = await this.messageRepository.save(message);
    conversation.updateLastMessage(saved.id);
    await this.conversationRepository.update(conversation);

    return this.toDto(saved);
  }

  private toDto(m: Message): MessageResponseDto {
    return {
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      content: m.content,
      status: m.status,
      messageType: m.messageType,
      imageUrl: m.imageUrl,
      createdAt: m.createdAt,
    };
  }
}
