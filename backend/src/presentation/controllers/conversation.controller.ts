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
import { CreateConversationDto } from "../../application/dtos/conversation.dto";

@Controller("conversations")
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(
    private readonly getConversations: GetConversationsUseCase,
    private readonly createConversation: CreateConversationUseCase,
    private readonly getMessages: GetMessagesUseCase
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
}
