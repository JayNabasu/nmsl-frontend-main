import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactInfo } from '../entities/contact-info.entity';
import { UpdateContactDto } from '../dto/update-contact.dto';

@Injectable()
export class ContactService implements OnModuleInit {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(ContactInfo)
    private readonly contactRepository: Repository<ContactInfo>,
  ) {}

  async onModuleInit() {
    // Ensure required columns exist in the database
    try {
      await this.contactRepository.query(
        `ALTER TABLE "contact_info" ADD COLUMN IF NOT EXISTS "location" character varying`,
      );
      await this.contactRepository.query(
        `ALTER TABLE "contact_info" ADD COLUMN IF NOT EXISTS "contactFormRecipient" character varying`,
      );
      // Set default location for existing rows
      await this.contactRepository.query(
        `UPDATE "contact_info" SET "location" = 'Abuja' WHERE "location" IS NULL`,
      );

      // Add unique index if not exists
      const indexExists = await this.contactRepository.query(
        `SELECT 1 FROM pg_indexes WHERE indexname = 'UQ_contact_info_location'`,
      );
      if (indexExists.length === 0) {
        // Remove duplicates before adding unique constraint
        await this.contactRepository.query(`
          DELETE FROM "contact_info" a USING "contact_info" b
          WHERE a.ctid < b.ctid AND a."location" = b."location"
        `);
        await this.contactRepository.query(
          `CREATE UNIQUE INDEX "UQ_contact_info_location" ON "contact_info" ("location")`,
        );
      }

      this.logger.log('Contact info table schema verified');
    } catch (e) {
      this.logger.warn(`Schema check warning: ${e.message}`);
    }
  }

  async getAll(): Promise<ContactInfo[]> {
    return this.contactRepository.find({ order: { location: 'ASC' } });
  }

  async getByLocation(location: string): Promise<ContactInfo> {
    let contact = await this.contactRepository.findOne({ where: { location } });
    if (!contact) {
      contact = this.contactRepository.create({ location });
      contact = await this.contactRepository.save(contact);
    }
    return contact;
  }

  async update(dto: UpdateContactDto): Promise<ContactInfo> {
    let contact = await this.contactRepository.findOne({
      where: { location: dto.location },
    });
    if (!contact) {
      contact = this.contactRepository.create({ location: dto.location });
    }
    const { location, ...fields } = dto;
    Object.assign(contact, fields);
    return this.contactRepository.save(contact);
  }
}
