import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsString } from 'class-validator';
import { NigeriaLocation } from '../entities/service.entity';

export class UpdateLocationOtherServicesDto {
  @ApiProperty({
    enum: NigeriaLocation,
    description: 'Location to attach the other-services list to',
  })
  @IsEnum(NigeriaLocation)
  location: NigeriaLocation;

  @ApiProperty({
    type: [String],
    example: ['Gastroenterology', 'Psychiatry', 'Rheumatology'],
  })
  @IsArray()
  @IsString({ each: true })
  services: string[];
}
