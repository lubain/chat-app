import {
  IsString,
  IsUUID,
  IsOptional,
  MinLength,
  MaxLength,
} from "class-validator";

export class SendMessageDto {
  @IsUUID()
  conversationId: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  content?: string;
}

export class SendImageMessageDto {
  @IsUUID()
  conversationId: string;

  @IsString()
  base64: string;
}

export class MessageResponseDto {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: string;
  messageType: string;
  imageUrl: string | null;
  createdAt: Date;
}

export class GetMessagesDto {
  @IsUUID()
  conversationId: string;
  limit?: number;
  before?: string;
}

export class MarkAsReadDto {
  @IsUUID()
  conversationId: string;
}
