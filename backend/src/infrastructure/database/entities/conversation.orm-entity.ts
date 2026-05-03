import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { MessageOrmEntity } from "./message.orm-entity";

@Entity("conversations")
export class ConversationOrmEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column("uuid", { array: true, name: "participant_ids" })
  participantIds: string[];

  @Column({ name: "last_message_id", type: "uuid", nullable: true })
  lastMessageId: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => MessageOrmEntity, (m) => m.conversation)
  messages: MessageOrmEntity[];
}
