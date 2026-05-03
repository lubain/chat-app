import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserStatus } from "../../../domain/entities/user.entity";
import { IUserRepository } from "../../../domain/repositories/user.repository.interface";
import { UserOrmEntity } from "../entities/user.orm-entity";

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>
  ) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.repo.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.repo.findOne({ where: { email } });
    return row ? this.toDomain(row) : null;
  }

  async save(user: User): Promise<User> {
    const row = this.toOrm(user);
    const saved = await this.repo.save(row);
    return this.toDomain(saved);
  }

  async update(user: User): Promise<User> {
    const row = this.toOrm(user);
    await this.repo.save(row);
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(row: UserOrmEntity): User {
    return new User(
      row.id,
      row.name,
      row.email,
      row.passwordHash,
      row.avatarUrl,
      row.status as UserStatus,
      row.createdAt,
      row.updatedAt
    );
  }

  private toOrm(user: User): UserOrmEntity {
    const row = new UserOrmEntity();
    row.id = user.id;
    row.name = user.name;
    row.email = user.email;
    row.passwordHash = user.passwordHash;
    row.avatarUrl = user.avatarUrl;
    row.status = user.status;
    return row;
  }
}
