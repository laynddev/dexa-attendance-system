import { IsOptional, IsString } from 'class-validator';

export class UpdateMyProfileDto {
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}