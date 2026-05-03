import { Injectable, Inject } from "@nestjs/common";
import {
  IUserRepository,
  USER_REPOSITORY,
} from "../../../domain/repositories/user.repository.interface";
import {
  IPresenceService,
  PRESENCE_SERVICE,
} from "../../ports/presence.service.interface";
import { UserStatus } from "../../../domain/entities/user.entity";

@Injectable()
export class LogoutUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(PRESENCE_SERVICE) private readonly presenceService: IPresenceService
  ) {}

  async execute(userId: string, socketId?: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) return;

    if (socketId) {
      await this.presenceService.setOffline(userId, socketId);
    }

    const isStillOnline = await this.presenceService.isOnline(userId);
    if (!isStillOnline) {
      user.updateStatus(UserStatus.OFFLINE);
      await this.userRepo.update(user);
    }
  }
}
