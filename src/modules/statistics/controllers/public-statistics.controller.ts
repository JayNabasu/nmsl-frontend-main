import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StatisticsService } from '../services/statistics.service';

@ApiTags('Public — Statistics')
@Controller('stats')
export class PublicStatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all statistics (public endpoint)' })
  findAll() {
    return this.statisticsService.findAll();
  }
}
