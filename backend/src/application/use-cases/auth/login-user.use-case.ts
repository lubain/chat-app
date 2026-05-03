import { Injectable, Inject, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import {
  IUserRepository,
  USER_REPOSITORY,
} from "../../../domain/repositories/user.repository.interface";
import { LoginDto, AuthResponseDto } from "../../dtos/auth.dto";
import { JwtService } from "@nestjs/jwt";
import { UserStatus } from "../../../domain/entities/user.entity";

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email.toLowerCase());
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    user.updateStatus(UserStatus.ONLINE);
    await this.userRepository.update(user);

    const token = this.jwtService.sign({ sub: user.id, email: user.email });

    return {
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        status: user.status,
      },
    };
  }
}
