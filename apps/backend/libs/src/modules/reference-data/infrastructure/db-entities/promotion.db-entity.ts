import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'reference_promotion' })
@Index('uq_promotion_code', ['code'], { unique: true })
export class PromotionDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 64 })
  code!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  vehicleSlug!: string | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  vehicleType!: string | null;

  @Column({ type: 'int' })
  amount!: number;

  @Column({ type: 'text', nullable: true })
  note!: string | null;
}
