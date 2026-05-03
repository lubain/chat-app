import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { MessageOrmEntity } from "./message.orm-entity";

@Entity("users")
export class UserOrmEntity {
  @PrimaryColumn("uuid")
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: "password_hash" })
  passwordHash: string;

  @Column({ name: "avatar_url", default: "" })
  avatarUrl: string;

  @Column({ default: "offline" })
  status: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => MessageOrmEntity, (m) => m.sender)
  messages: MessageOrmEntity[];
}
