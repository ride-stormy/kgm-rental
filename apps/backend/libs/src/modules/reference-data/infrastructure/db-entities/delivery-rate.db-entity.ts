import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'reference_delivery_rate' })
@Index('uq_delivery_rate_region', ['region'], { unique: true })
export class DeliveryRateDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 32 })
  region!: string;

  @Column({ type: 'int' })
  firstLegFee!: number;

  @Column({ type: 'int' })
  secondLegFee!: number;
}
