import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSettings } from '../entities/site-settings.entity';

@Injectable()
export class SiteSettingsService {
  constructor(
    @InjectRepository(SiteSettings)
    private readonly repo: Repository<SiteSettings>,
  ) {}

  /** Return the singleton settings row, creating it if it doesn't exist. */
  async get(): Promise<SiteSettings> {
    let settings = await this.repo.findOne({ where: {} });
    if (!settings) {
      settings = this.repo.create({ telemedicineEnabled: false });
      settings = await this.repo.save(settings);
    }
    return settings;
  }

  /** Update settings (partial). */
  async update(dto: Partial<Pick<SiteSettings, 'telemedicineEnabled'>>): Promise<SiteSettings> {
    const settings = await this.get();
    Object.assign(settings, dto);
    return this.repo.save(settings);
  }
}
