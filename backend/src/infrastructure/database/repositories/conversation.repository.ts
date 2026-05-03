import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Conversation } from "../../../domain/entities/conversation.entity";
import { IConversationRepository } from "../../../domain/repositories/conversation.repository.interface";
import { ConversationOrmEntity } from "../entities/conversation.orm-entity";

@Injectable()
export class ConversationRepository implements IConversationRepository {
  constructor(
    @InjectRepository(ConversationOrmEntity)
    private readonly repo: Repository<ConversationOrmEntity>
  ) {}

  async findById(id: string): Promise<Conversation | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByParticipants(
    userAId: string,
    userBId: string
  ): Promise<Conversation | null> {
    // Use PostgreSQL array operators to find conversation with both participants
    const row = await this.repo
      .createQueryBuilder("c")
      .where(":userA = ANY(c.participant_ids)", { userA: userAId })
      .andWhere(":userB = ANY(c.participant_ids)", { userB: userBId })
      .andWhere("array_length(c.participant_ids, 1) = 2")
      .getOne();

    return row ? this.toDomain(row) : null;
  }

  async findAllByUserId(userId: string): Promise<Conversation[]> {
    const rows = await this.repo
      .createQueryBuilder("c")
      .where(":userId = ANY(c.participant_ids)", { userId })
      .orderBy("c.updated_at", "DESC")
      .getMany();

    return rows.map((r) => this.toDomain(r));
  }

  async save(conversation: Conversation): Promise<Conversation> {
    const row = this.toOrm(conversation);
    const saved = await this.repo.save(row);
    return this.toDomain(saved);
  }

  async update(conversation: Conversation): Promise<Conversation> {
    const row = this.toOrm(conversation);
    await this.repo.save(row);
    return conversation;
  }

  private toDomain(row: ConversationOrmEntity): Conversation {
    return new Conversation(
      row.id,
      row.participantIds,
      row.lastMessageId,
      row.createdAt,
      row.updatedAt
    );
  }

  private toOrm(conv: Conversation): ConversationOrmEntity {
    const row = new ConversationOrmEntity();
    row.id = conv.id;
    row.participantIds = conv.participantIds;
    row.lastMessageId = conv.lastMessageId;
    return row;
  }
}
