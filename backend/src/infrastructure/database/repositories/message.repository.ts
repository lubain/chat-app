import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Repository } from "typeorm";
import {
  Message,
  MessageStatus,
} from "../../../domain/entities/message.entity";
import { IMessageRepository } from "../../../domain/repositories/message.repository.interface";
import { MessageOrmEntity } from "../entities/message.orm-entity";

@Injectable()
export class MessageRepository implements IMessageRepository {
  constructor(
    @InjectRepository(MessageOrmEntity)
    private readonly repo: Repository<MessageOrmEntity>
  ) {}

  async findById(id: string): Promise<Message | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByConversationId(
    conversationId: string,
    limit = 50,
    before?: Date
  ): Promise<Message[]> {
    const where: any = { conversationId };
    if (before) where.createdAt = LessThan(before);

    const rows = await this.repo.find({
      where,
      order: { createdAt: "DESC" },
      take: limit,
    });

    // Return in chronological order
    return rows.reverse().map((r) => this.toDomain(r));
  }

  async save(message: Message): Promise<Message> {
    const row = this.toOrm(message);
    const saved = await this.repo.save(row);
    return this.toDomain(saved);
  }

  async update(message: Message): Promise<Message> {
    const row = this.toOrm(message);
    await this.repo.save(row);
    return message;
  }

  async markConversationAsRead(
    conversationId: string,
    userId: string
  ): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(MessageOrmEntity)
      .set({ status: MessageStatus.READ })
      .where("conversationId = :conversationId", { conversationId })
      .andWhere("senderId != :userId", { userId })
      .andWhere("status != :status", { status: MessageStatus.READ })
      .execute();
  }

  async countUnread(conversationId: string, userId: string): Promise<number> {
    return this.repo.count({
      where: {
        conversationId,
        status: MessageStatus.SENT as any,
      },
    });
  }

  private toDomain(row: MessageOrmEntity): Message {
    return new Message(
      row.id,
      row.conversationId,
      row.senderId,
      row.content,
      row.status as MessageStatus,
      row.createdAt,
      row.updatedAt
    );
  }

  private toOrm(message: Message): MessageOrmEntity {
    const row = new MessageOrmEntity();
    row.id = message.id;
    row.conversationId = message.conversationId;
    row.senderId = message.senderId;
    row.content = message.content;
    row.status = message.status;
    return row;
  }
}
