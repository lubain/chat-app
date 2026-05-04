import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { UserOrmEntity } from "../../infrastructure/database/entities/user.orm-entity";
import { ConversationOrmEntity } from "../../infrastructure/database/entities/conversation.orm-entity";
import { MessageOrmEntity } from "../../infrastructure/database/entities/message.orm-entity";

dotenv.config();

export default new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "chat_db",
  entities: [UserOrmEntity, ConversationOrmEntity, MessageOrmEntity],
  migrations: ["src/infrastructure/database/migrations/*.ts"],
  synchronize: false,
});
