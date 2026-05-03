import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UseGuards, Inject, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsJwtAuthGuard } from "../guards/jwt-auth.guard";
import {
  WsCurrentUser,
  JwtPayload,
} from "../decorators/current-user.decorator";
import { SendMessageUseCase } from "../../application/use-cases/chat/send-message.use-case";
import { SendMessageDto } from "../../application/dtos/message.dto";
import {
  IPresenceService,
  PRESENCE_SERVICE,
} from "../../application/ports/presence.service.interface";
import {
  IMessageRepository,
  MESSAGE_REPOSITORY,
} from "../../domain/repositories/message.repository.interface";
import {
  IConversationRepository,
  CONVERSATION_REPOSITORY,
} from "../../domain/repositories/conversation.repository.interface";

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
  namespace: "/chat",
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly sendMessageUseCase: SendMessageUseCase,
    @Inject(PRESENCE_SERVICE)
    private readonly presenceService: IPresenceService,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepo: IMessageRepository,
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepo: IConversationRepository
  ) {}

  // ─── Connection Lifecycle ─────────────────────────────────────────────────

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(" ")[1];

      if (!token) throw new WsException("No token provided");

      const payload = this.jwtService.verify<JwtPayload>(token);
      client.data.user = payload;

      await this.presenceService.setOnline(payload.sub, client.id);

      // Auto-join rooms for all user's conversations
      const conversations = await this.conversationRepo.findAllByUserId(
        payload.sub
      );
      for (const conv of conversations) {
        client.join(`conversation:${conv.id}`);
      }

      // Notify contacts that user is online
      this.server.emit("user:online", { userId: payload.sub });
      this.logger.log(`Client connected: ${client.id} (user: ${payload.sub})`);
    } catch (err) {
      this.logger.warn(`Rejected connection: ${(err as Error).message}`);
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const user = client.data.user as JwtPayload | undefined;
    if (!user) return;

    await this.presenceService.setOffline(user.sub, client.id);

    // Only broadcast offline if no other sessions remain
    const isStillOnline = await this.presenceService.isOnline(user.sub);
    if (!isStillOnline) {
      this.server.emit("user:offline", { userId: user.sub });
    }

    this.logger.log(`Client disconnected: ${client.id} (user: ${user.sub})`);
  }

  // ─── Message Events ───────────────────────────────────────────────────────

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage("message:send")
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto
  ) {
    const user = client.data.user as JwtPayload;

    try {
      const message = await this.sendMessageUseCase.execute(user.sub, dto);

      // Broadcast to all participants in the conversation room
      this.server
        .to(`conversation:${dto.conversationId}`)
        .emit("message:new", message);

      // Mark as delivered for online recipients
      const conversation = await this.conversationRepo.findById(
        dto.conversationId
      );
      if (conversation) {
        const recipientId = conversation.getOtherParticipant(user.sub);
        if (recipientId) {
          const isOnline = await this.presenceService.isOnline(recipientId);
          if (isOnline) {
            const msg = await this.messageRepo.findById(message.id);
            if (msg) {
              msg.markAsDelivered();
              await this.messageRepo.update(msg);
              this.server
                .to(`conversation:${dto.conversationId}`)
                .emit("message:status", {
                  messageId: message.id,
                  status: msg.status,
                });
            }
          }
        }
      }

      return { success: true, message };
    } catch (err) {
      throw new WsException((err as Error).message);
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage("message:read")
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string }
  ) {
    const user = client.data.user as JwtPayload;

    await this.messageRepo.markConversationAsRead(
      data.conversationId,
      user.sub
    );

    // Notify sender that messages were read
    this.server
      .to(`conversation:${data.conversationId}`)
      .emit("message:read", {
        conversationId: data.conversationId,
        readBy: user.sub,
      });

    return { success: true };
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage("typing:start")
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string }
  ) {
    const user = client.data.user as JwtPayload;
    client
      .to(`conversation:${data.conversationId}`)
      .emit("typing:start", {
        userId: user.sub,
        conversationId: data.conversationId,
      });
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage("typing:stop")
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string }
  ) {
    const user = client.data.user as JwtPayload;
    client
      .to(`conversation:${data.conversationId}`)
      .emit("typing:stop", {
        userId: user.sub,
        conversationId: data.conversationId,
      });
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage("conversation:join")
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string }
  ) {
    client.join(`conversation:${data.conversationId}`);
    return { success: true };
  }

  // ─── Public helper for other services ───────────────────────────────────

  emitToUser(userId: string, event: string, payload: unknown): void {
    this.server.to(`user:${userId}`).emit(event, payload);
  }
}
