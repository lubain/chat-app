import { IsUUID } from "class-validator";

export class CreateConversationDto {
  @IsUUID()
  targetUserId: string;
}

export class ConversationResponseDto {
  id: string;
  participant: {
    id: string;
    name: string;
    avatarUrl: string;
    status: string;
  };
  lastMessage: {
    content: string;
    createdAt: Date;
    senderId: string;
  } | null;
  unreadCount: number;
  updatedAt: Date;
}
