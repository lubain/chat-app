import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { CurrentUser, JwtPayload } from "../decorators/current-user.decorator";
import { GetConversationsUseCase } from "../../application/use-cases/chat/get-conversations.use-case";
import { CreateConversationUseCase } from "../../application/use-cases/chat/create-conversation.use-case";
import { GetMessagesUseCase } from "../../application/use-cases/chat/get-messages.use-case";
import { SendMessageUseCase } from "../../application/use-cases/chat/send-message.use-case";
import { CloudinaryService } from "../../infrastructure/cloudinary/cloudinary.service";
import { CreateConversationDto } from "../../application/dtos/conversation.dto";
import { MessageType } from "../../domain/entities/message.entity";
import { v4 as uuidv4 } from "uuid";

@Controller("conversations")
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(
    private readonly getConversations: GetConversationsUseCase,
    private readonly createConversation: CreateConversationUseCase,
    private readonly getMessages: GetMessagesUseCase,
    private readonly sendMessage: SendMessageUseCase,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.getConversations.execute(user.sub);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateConversationDto) {
    return this.createConversation.execute(user.sub, dto);
  }

  @Get(":id/messages")
  messages(
    @CurrentUser() user: JwtPayload,
    @Param("id", ParseUUIDPipe) id: string,
    @Query("limit") limit?: string,
    @Query("before") before?: string
  ) {
    return this.getMessages.execute(user.sub, id, limit ? +limit : 50, before);
  }

  /**
   * POST /conversations/:id/images
   * Upload une image via Cloudinary puis crée un message de type image.
   * Le message est ensuite diffusé via WebSocket par le client.
   */
  @Post(":id/images")
  async sendImage(
    @CurrentUser() user: JwtPayload,
    @Param("id", ParseUUIDPipe) conversationId: string,
    @Body() body: { base64: string }
  ) {
    const tempId = uuidv4();
    const imageUrl = await this.cloudinaryService.uploadMessageImage(
      body.base64,
      tempId
    );

    return this.sendMessage.execute({
      conversationId,
      senderId: user.sub,
      messageType: MessageType.IMAGE,
      imageUrl,
    });
  }
}
