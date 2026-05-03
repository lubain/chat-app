import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
} from "@nestjs/common";
import { RegisterUserUseCase } from "../../application/use-cases/auth/register-user.use-case";
import { LoginUserUseCase } from "../../application/use-cases/auth/login-user.use-case";
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
} from "../../application/dtos/auth.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { CurrentUser, JwtPayload } from "../decorators/current-user.decorator";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUserUseCase
  ) {}

  @Post("register")
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.registerUseCase.execute(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.loginUseCase.execute(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtPayload) {
    return { userId: user.sub, email: user.email };
  }
}
