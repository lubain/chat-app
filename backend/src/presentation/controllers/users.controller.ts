import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { CurrentUser, JwtPayload } from "../decorators/current-user.decorator";
import { GetUsersUseCase } from "../../application/use-cases/user/get-users.use-case";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly getUsersUseCase: GetUsersUseCase) {}

  @Get()
  search(@CurrentUser() user: JwtPayload, @Query("q") search?: string) {
    return this.getUsersUseCase.execute(user.sub, search);
  }
}
