import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'reference_residual_rate' })
@Index(
  'uq_residual_rate_type_period_mileage',
  ['vehicleType', 'contractPeriodMonths', 'annualMileageKm'],
  { unique: true },
)
export class ResidualRateDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 16 })
  vehicleType!: string;

  @Column({ type: 'int' })
  contractPeriodMonths!: number;

  @Column({ type: 'int' })
  annualMileageKm!: number;

  @Column({ type: 'numeric', precision: 5, scale: 4 })
  residualFraction!: string;
}
