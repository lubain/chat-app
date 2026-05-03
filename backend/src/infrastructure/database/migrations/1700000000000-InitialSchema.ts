import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1700000000000 implements MigrationInterface {
  name = "InitialSchema1700000000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"            UUID PRIMARY KEY,
        "name"          VARCHAR(100) NOT NULL,
        "email"         VARCHAR(255) NOT NULL UNIQUE,
        "password_hash" TEXT NOT NULL,
        "avatar_url"    TEXT NOT NULL DEFAULT '',
        "status"        VARCHAR(20) NOT NULL DEFAULT 'offline',
        "created_at"    TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "conversations" (
        "id"              UUID PRIMARY KEY,
        "participant_ids" UUID[] NOT NULL,
        "last_message_id" UUID,
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_conversations_participants"
        ON "conversations" USING GIN ("participant_ids")
    `);

    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id"              UUID PRIMARY KEY,
        "conversation_id" UUID NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
        "sender_id"       UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "content"         TEXT NOT NULL,
        "status"          VARCHAR(20) NOT NULL DEFAULT 'sent',
        "created_at"      TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at"      TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_messages_conversation_created"
        ON "messages" ("conversation_id", "created_at" DESC)
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_messages_sender"
        ON "messages" ("sender_id")
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "messages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "conversations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
