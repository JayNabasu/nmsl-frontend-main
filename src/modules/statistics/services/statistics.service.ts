import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Statistic } from '../entities/statistic.entity';

export class UpdateStatisticDto {
  id?: string;
  icon: string;
  value: string;
  label: string;
  description?: string;
  sublabel?: string;
}

@Injectable()
export class StatisticsService implements OnModuleInit {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(
    @InjectRepository(Statistic)
    private readonly statisticsRepository: Repository<Statistic>,
  ) {}

  async onModuleInit() {
    try {
      await this.statisticsRepository.query(`
        CREATE TABLE IF NOT EXISTS "statistics" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "icon" character varying NOT NULL,
          "value" character varying NOT NULL,
          "label" character varying NOT NULL,
          "description" character varying,
          CONSTRAINT "PK_statistics" PRIMARY KEY ("id")
        )
      `);
      this.logger.log('Statistics table verified');
    } catch (e) {
      this.logger.warn(`Statistics schema check: ${e.message}`);
    }
  }

  findAll(): Promise<Statistic[]> {
    return this.statisticsRepository.find();
  }

  async replaceAll(stats: UpdateStatisticDto[]): Promise<Statistic[]> {
    await this.statisticsRepository.clear();
    // Map sublabel → description for portal compatibility
    const mapped = stats.map(({ sublabel, ...rest }) => ({
      ...rest,
      description: rest.description || sublabel || '',
    }));
    const entities = this.statisticsRepository.create(mapped);
    return this.statisticsRepository.save(entities);
  }
}
