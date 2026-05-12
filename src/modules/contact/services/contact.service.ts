import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactInfo } from '../entities/contact-info.entity';
import { UpdateContactDto } from '../dto/update-contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(ContactInfo)
    private readonly contactRepository: Repository<ContactInfo>,
  ) {}

  async getAll(): Promise<ContactInfo[]> {
    try {
      return await this.contactRepository.find({ order: { location: 'ASC' } });
    } catch (e) {
      this.logger.warn(`getAll failed (likely missing column): ${e.message}`);
      // Fallback: raw query with only columns that definitely exist
      try {
        return await this.contactRepository.query(
          `SELECT * FROM "contact_info" ORDER BY COALESCE("location", '') ASC`,
        );
      } catch {
        return [];
      }
    }
  }

  async getByLocation(location: string): Promise<ContactInfo> {
    try {
      let contact = await this.contactRepository.findOne({ where: { location } });
      if (!contact) {
        contact = this.contactRepository.create({ location });
        contact = await this.contactRepository.save(contact);
      }
      return contact;
    } catch (e) {
      this.logger.warn(`getByLocation('${location}') failed: ${e.message}`);
      // Return empty object with location set
      return { location } as ContactInfo;
    }
  }

  async update(dto: UpdateContactDto): Promise<ContactInfo> {
    try {
      let contact = await this.contactRepository.findOne({
        where: { location: dto.location },
      });
      if (!contact) {
        contact = this.contactRepository.create({ location: dto.location });
      }
      const { location, ...fields } = dto;
      Object.assign(contact, fields);
      return await this.contactRepository.save(contact);
    } catch (e) {
      this.logger.warn(`update via ORM failed: ${e.message}. Trying raw upsert.`);
      // Fallback: raw upsert for when the location column exists but other columns don't
      return this.rawUpsert(dto);
    }
  }

  private async rawUpsert(dto: UpdateContactDto): Promise<ContactInfo> {
    const fields = Object.entries(dto).filter(([, v]) => v !== undefined);
    const columns = fields.map(([k]) => `"${k}"`);
    const values = fields.map(([, v]) => v);
    const placeholders = fields.map((_, i) => `$${i + 1}`);
    const updates = fields
      .filter(([k]) => k !== 'location')
      .map(([k]) => `"${k}" = EXCLUDED."${k}"`);

    const sql = `
      INSERT INTO "contact_info" (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      ON CONFLICT ("location") DO UPDATE SET ${updates.join(', ')}
      RETURNING *
    `;

    try {
      const rows = await this.contactRepository.query(sql, values);
      return rows[0];
    } catch (e2) {
      this.logger.error(`Raw upsert also failed: ${e2.message}`);
      throw e2;
    }
  }
}
