import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'vehicle_sku' })
@Index('idx_vehicle_sku_product_model', ['productModelId'])
@Index('idx_vehicle_sku_spec_code', ['specCode'])
export class VehicleSkuDbEntity {
  @PrimaryColumn({ name: 'id', type: 'varchar', length: 64 })
  id!: string; // `${specCode}-${colorExteriorCode}`

  @Column({ name: 'productModelId', type: 'varchar', length: 40 })
  productModelId!: string;

  @Column({ name: 'specCode', type: 'varchar', length: 32 })
  specCode!: string;

  @Column({ name: 'modelCode', type: 'varchar', length: 32 })
  modelCode!: string;

  @Column({ name: 'trim', type: 'varchar', length: 128 })
  trim!: string;

  @Column({ name: 'vehicleType', type: 'varchar', length: 16 })
  vehicleType!: string;

  @Column({ name: 'displacement', type: 'int' })
  displacement!: number;

  @Column({ name: 'colorExteriorCode', type: 'varchar', length: 16 })
  colorExteriorCode!: string;

  @Column({ name: 'colorExteriorName', type: 'varchar', length: 64 })
  colorExteriorName!: string;

  @Column({ name: 'colorInteriorCode', type: 'varchar', length: 16, nullable: true })
  colorInteriorCode!: string | null;

  @Column({ name: 'options', type: 'jsonb', default: () => "'[]'::jsonb" })
  options!: string[];

  @Column({ name: 'price', type: 'bigint' })
  price!: string;

  @Column({ name: 'stockBucket', type: 'int' })
  stockBucket!: number;

  @Column({ name: 'productionPeriods', type: 'jsonb', default: () => "'[]'::jsonb" })
  productionPeriods!: string[];

  @Column({ name: 'createdAt', type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;

  @Column({ name: 'updatedAt', type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
