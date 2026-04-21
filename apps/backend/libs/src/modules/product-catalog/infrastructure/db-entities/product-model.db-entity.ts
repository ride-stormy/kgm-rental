import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'product_model' })
@Index('uq_product_model_slug', ['slug'], { unique: true })
export class ProductModelDbEntity {
  @PrimaryColumn({ name: 'id', type: 'varchar', length: 40 })
  id!: string; // deterministic: `pm_${slug}`

  @Column({ name: 'slug', type: 'varchar', length: 64 })
  slug!: string;

  @Column({ name: 'name', type: 'varchar', length: 128 })
  name!: string;

  @Column({ name: 'brandName', type: 'varchar', length: 64 })
  brandName!: string;

  @Column({ name: 'heroImage', type: 'varchar', length: 512 })
  heroImage!: string;

  @Column({ name: 'description', type: 'text' })
  description!: string;

  @Column({ name: 'vehicleTypeDefault', type: 'varchar', length: 16 })
  vehicleTypeDefault!: string; // ICE | HEV | EV | Diesel

  // fixedPreset serialized as 4 columns to keep simple indexed queries possible.
  @Column({ name: 'presetMaintenancePackage', type: 'varchar', length: 32 })
  presetMaintenancePackage!: string;

  @Column({ name: 'presetMaturityOption', type: 'varchar', length: 32 })
  presetMaturityOption!: string;

  @Column({ name: 'presetWinterOption', type: 'varchar', length: 32 })
  presetWinterOption!: string;

  @Column({ name: 'presetRegion', type: 'varchar', length: 32 })
  presetRegion!: string;

  @Column({ name: 'minMonthlyRent', type: 'bigint' })
  minMonthlyRent!: string; // bigint → string in TypeORM

  @Column({ name: 'promotionTags', type: 'jsonb', default: () => "'[]'::jsonb" })
  promotionTags!: string[];

  @Column({ name: 'createdAt', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updatedAt', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
