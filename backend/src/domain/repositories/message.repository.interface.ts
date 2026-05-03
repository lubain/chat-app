import { Message } from "../entities/message.entity";

export interface IMessageRepository {
  findById(id: string): Promise<Message | null>;
  findByConversationId(
    conversationId: string,
    limit?: number,
    before?: Date
  ): Promise<Message[]>;
  save(message: Message): Promise<Message>;
  update(message: Message): Promise<Message>;
  markConversationAsRead(conversationId: string, userId: string): Promise<void>;
  countUnread(conversationId: string, userId: string): Promise<number>;
}

export const MESSAGE_REPOSITORY = Symbol("IMessageRepository");
