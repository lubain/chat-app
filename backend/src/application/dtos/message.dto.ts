import { IsString, IsUUID, MinLength, MaxLength } from "class-validator";

export class SendMessageDto {
  @IsUUID()
  conversationId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  content: string;
}

export class MessageResponseDto {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: string;
  createdAt: Date;
}

export class GetMessagesDto {
  @IsUUID()
  conversationId: string;

  limit?: number;
  before?: string; // ISO date string for cursor-based pagination
}

export class MarkAsReadDto {
  @IsUUID()
  conversationId: string;
}
