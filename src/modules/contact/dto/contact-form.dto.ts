import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContactFormDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'I would like to schedule an appointment.' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ example: 'Abuja', description: 'Location the user is contacting from' })
  @IsString()
  @IsOptional()
  location?: string;
}
