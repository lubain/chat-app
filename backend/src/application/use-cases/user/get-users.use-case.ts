import { Injectable, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like, Not, Repository } from "typeorm";
import { UserOrmEntity } from "../../../infrastructure/database/entities/user.orm-entity";
import {
  IPresenceService,
  PRESENCE_SERVICE,
} from "../../ports/presence.service.interface";

export interface UserSearchResult {
  id: string;
  name: string;
  avatarUrl: string;
  status: string;
}

@Injectable()
export class GetUsersUseCase {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userOrmRepo: Repository<UserOrmEntity>,
    @Inject(PRESENCE_SERVICE) private readonly presenceService: IPresenceService
  ) {}

  async execute(
    currentUserId: string,
    search?: string
  ): Promise<UserSearchResult[]> {
    const where: any = { id: Not(currentUserId) };
    if (search?.trim()) {
      where.name = Like(`%${search.trim()}%`);
    }

    const rows = await this.userOrmRepo.find({
      where,
      take: 20,
      order: { name: "ASC" },
    });

    const ids = rows.map((r) => r.id);
    const onlineIds = await this.presenceService.getOnlineUsers(ids);
    const onlineSet = new Set(onlineIds);

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      avatarUrl: r.avatarUrl,
      status: onlineSet.has(r.id) ? "online" : "offline",
    }));
  }
}
