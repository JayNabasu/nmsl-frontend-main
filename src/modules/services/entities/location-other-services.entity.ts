import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { NigeriaLocation } from './service.entity';

@Entity('location_other_services')
@Index(['location'], { unique: true })
export class LocationOtherServices {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NigeriaLocation,
  })
  location: NigeriaLocation;

  @Column({ type: 'jsonb', default: [] })
  services: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
