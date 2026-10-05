import {
  IsIn,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{10,15}$/, {
    message:
      'phone must contain only digits and be between 10 and 15 digits',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ACTIVE', 'INACTIVE'], {
    message: 'status must be either ACTIVE or INACTIVE',
  })
  status?: string;
}