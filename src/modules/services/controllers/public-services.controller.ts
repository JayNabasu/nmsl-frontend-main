import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ServicesService } from '../services/services.service';

@ApiTags('Public — Services')
@Controller('services')
export class PublicServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active services (public endpoint)' })
  async findAllActive() {
    return this.servicesService.findAll();
  }

  @Get('other-services')
  @ApiOperation({ summary: 'Get additional specialist services by location (public endpoint)' })
  @ApiQuery({ name: 'location', required: false, example: 'Abuja' })
  async findOtherServices(@Query('location') location?: string) {
    return this.servicesService.getOtherServicesByLocation(location);
  }
}
