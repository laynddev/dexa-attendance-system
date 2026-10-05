import { 
  IsOptional, 
  IsString,
  Matches,
} from 'class-validator';

export class UpdateMyProfileDto {
  @IsOptional()
  @IsString()
  photoUrl?: string;
  
    @IsOptional()
    @IsString()
    @Matches(/^\d{10,15}$/, {
      message:
        'phone must contain only digits and be between 10 and 15 digits',
    })
    phone?: string;
}