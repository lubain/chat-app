import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { UserOrmEntity } from "./user.orm-entity";
import { ConversationOrmEntity } from "./conversation.orm-entity";

@Entity("messages")
@Index(["conversationId", "createdAt"])
export class MessageOrmEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column({ name: "conversation_id", type: "uuid" })
  @Index()
  conversationId: string;

  @Column({ name: "sender_id", type: "uuid" })
  senderId: string;

  @Column({ type: "text" })
  content: string;

  @Column({ default: "sent" })
  status: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @ManyToOne(() => UserOrmEntity, (u) => u.messages)
  @JoinColumn({ name: "sender_id" })
  sender: UserOrmEntity;

  @ManyToOne(() => ConversationOrmEntity, (c) => c.messages)
  @JoinColumn({ name: "conversation_id" })
  conversation: ConversationOrmEntity;
}
