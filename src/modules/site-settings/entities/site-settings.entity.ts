import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('site_settings')
export class SiteSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  telemedicineEnabled: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
