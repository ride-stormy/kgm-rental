import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'reference_vehicle' })
@Index('uq_reference_vehicle_slug', ['slug'], { unique: true })
export class VehicleDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64 })
  slug!: string;

  @Column({ type: 'varchar', length: 32 })
  modelCode!: string;

  @Column({ type: 'varchar', length: 32 })
  specCode!: string;

  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ type: 'varchar', length: 16 })
  vehicleType!: string; // ICE | HEV | EV | Diesel

  @Column({ type: 'int' })
  displacement!: number;

  @Column({ type: 'bigint' })
  price!: string; // bigint → string in TypeORM

  @Column({ type: 'bigint' })
  priceAfterDiscount!: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  acquisitionCost!: string;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
