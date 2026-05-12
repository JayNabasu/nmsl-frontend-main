import {
  IsEmail,
  IsString,
  IsNumber,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DoctorSpecialty } from './create-doctor.dto';

export class UpdateDoctorDto {
  @ApiPropertyOptional({ example: 'Dr. Michael Chen' })
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Michael' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Chen' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: 'Dr.' })
  @IsString()
  @IsOptional()
  designation?: string;

  @ApiPropertyOptional({ example: 'michael.chen@nmsl.app' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Abuja' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: 'FCT' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ enum: DoctorSpecialty })
  @IsEnum(DoctorSpecialty)
  @IsOptional()
  specialty?: DoctorSpecialty;

  @ApiPropertyOptional({ example: 'MBBS, MD (Cardiology)' })
  @IsString()
  @IsOptional()
  qualifications?: string;

  @ApiPropertyOptional({
    example: 'Dr. Chen has over 15 years of experience treating cardiovascular diseases...',
    description: 'Free-form biography shown on the public doctor profile page.',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ example: 'https://...avatar-url...' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsOptional()
  yearsOfExperience?: number;
}
