import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'reference_interest_rate' })
@Index('uq_interest_rate_type_period', ['vehicleType', 'contractPeriodMonths'], { unique: true })
export class InterestRateDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 16 })
  vehicleType!: string;

  @Column({ type: 'int' })
  contractPeriodMonths!: number;

  @Column({ type: 'numeric', precision: 10, scale: 8 })
  annualRate!: string;
}
