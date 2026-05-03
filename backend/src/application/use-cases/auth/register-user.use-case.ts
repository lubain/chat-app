import { ConflictException, Inject, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { User, UserStatus } from "../../../domain/entities/user.entity";
import { Email } from "../../../domain/value-objects/email.vo";
import {
  IUserRepository,
  USER_REPOSITORY,
} from "../../../domain/repositories/user.repository.interface";
import { RegisterDto, AuthResponseDto } from "../../dtos/auth.dto";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(dto: RegisterDto): Promise<AuthResponseDto> {
    const email = new Email(dto.email);

    const existing = await this.userRepository.findByEmail(email.toString());
    if (existing) {
      throw new ConflictException("Email already in use");
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const avatarUrl = `https://i.pravatar.cc/150?u=${uuidv4()}`;

    const user = new User(
      uuidv4(),
      dto.name,
      email.toString(),
      passwordHash,
      avatarUrl,
      UserStatus.ONLINE,
      new Date(),
      new Date()
    );

    const saved = await this.userRepository.save(user);

    const token = this.jwtService.sign({ sub: saved.id, email: saved.email });

    return {
      accessToken: token,
      user: {
        id: saved.id,
        name: saved.name,
        email: saved.email,
        avatarUrl: saved.avatarUrl,
        status: saved.status,
      },
    };
  }
}
