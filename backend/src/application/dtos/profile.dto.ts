import { IsString, IsOptional, MinLength, MaxLength, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}

export class ProfileResponseDto {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  status: string;
}
