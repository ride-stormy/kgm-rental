import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'reference_insurance_rate' })
@Index(
  'uq_insurance_rate_type_mileage_tier',
  ['vehicleType', 'annualMileageKm', 'coverTier'],
  { unique: true },
)
export class InsuranceRateDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 16 })
  vehicleType!: string;

  @Column({ type: 'int' })
  annualMileageKm!: number;

  @Column({ type: 'varchar', length: 32 })
  coverTier!: string;

  @Column({ type: 'int' })
  annualPremium!: number;
}
