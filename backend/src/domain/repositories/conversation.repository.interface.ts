import { Conversation } from "../entities/conversation.entity";

export interface IConversationRepository {
  findById(id: string): Promise<Conversation | null>;
  findByParticipants(
    userAId: string,
    userBId: string
  ): Promise<Conversation | null>;
  findAllByUserId(userId: string): Promise<Conversation[]>;
  save(conversation: Conversation): Promise<Conversation>;
  update(conversation: Conversation): Promise<Conversation>;
}

export const CONVERSATION_REPOSITORY = Symbol("IConversationRepository");
