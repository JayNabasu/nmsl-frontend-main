import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateLocationOtherServicesDto {
  @ApiProperty({
    example: 'Abuja',
    description: 'Location to attach the other-services list to',
  })
  @IsString()
  location: string;

  @ApiProperty({
    type: [String],
    example: ['Gastroenterology', 'Psychiatry', 'Rheumatology'],
  })
  @IsArray()
  @IsString({ each: true })
  services: string[];
}
