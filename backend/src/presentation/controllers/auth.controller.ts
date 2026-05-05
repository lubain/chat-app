import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Patch,
} from "@nestjs/common";
import { RegisterUserUseCase } from "../../application/use-cases/auth/register-user.use-case";
import { LoginUserUseCase } from "../../application/use-cases/auth/login-user.use-case";
import { UpdateProfileUseCase } from "../../application/use-cases/auth/update-profile.use-case";
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
} from "../../application/dtos/auth.dto";
import {
  UpdateProfileDto,
  ProfileResponseDto,
} from "../../application/dtos/profile.dto";
import { CloudinaryService } from "../../infrastructure/cloudinary/cloudinary.service";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { CurrentUser, JwtPayload } from "../decorators/current-user.decorator";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUserUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly cloudinaryService: CloudinaryService
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

  @Patch("profile")
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto
  ): Promise<ProfileResponseDto> {
    return this.updateProfileUseCase.execute(user.sub, dto);
  }

  /**
   * POST /auth/avatar
   * Reçoit une image en base64, l'upload sur Cloudinary,
   * met à jour l'avatarUrl en DB et retourne le profil mis à jour.
   */
  @Post("avatar")
  @UseGuards(JwtAuthGuard)
  async uploadAvatar(
    @CurrentUser() user: JwtPayload,
    @Body() body: { base64: string }
  ): Promise<ProfileResponseDto> {
    const avatarUrl = await this.cloudinaryService.uploadAvatar(
      body.base64,
      user.sub
    );
    return this.updateProfileUseCase.execute(user.sub, { avatarUrl });
  }
}
