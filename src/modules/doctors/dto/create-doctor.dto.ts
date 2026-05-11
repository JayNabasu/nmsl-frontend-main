import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DoctorSpecialty {
  GENERAL_PRACTICE = 'General Practice',
  GYNECOLOGY = 'Gynecology',
  PHYSIOTHERAPY = 'Physiotherapy',
  PEDIATRICS = 'Pediatrics',
  CARDIOLOGY = 'Cardiology',
  DERMATOLOGY = 'Dermatology',
  ORTHOPEDICS = 'Orthopedics',
  PSYCHIATRY = 'Psychiatry',
  RADIOLOGY = 'Radiology',
  SURGERY = 'Surgery',
}

export class CreateDoctorDto {
  @ApiProperty({ example: 'Dr. Michael Chen' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'michael.chen@nmsl.app' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+2348012345678' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Abuja' })
  @IsString()
  location: string;

  @ApiPropertyOptional({ example: 'FCT' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ enum: DoctorSpecialty })
  @IsEnum(DoctorSpecialty)
  specialty: DoctorSpecialty;

  @ApiProperty({ example: 'MBBS, MD (Cardiology)' })
  @IsString()
  qualifications: string;

  @ApiPropertyOptional({
    example: 'Dr. Chen has over 15 years of experience treating cardiovascular diseases...',
    description: 'Free-form biography shown on the public doctor profile page.',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  avatar?: string;
}
