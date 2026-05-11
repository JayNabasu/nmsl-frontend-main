import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactInfo } from '../entities/contact-info.entity';
import { UpdateContactDto } from '../dto/update-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactInfo)
    private readonly contactRepository: Repository<ContactInfo>,
  ) {}

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
