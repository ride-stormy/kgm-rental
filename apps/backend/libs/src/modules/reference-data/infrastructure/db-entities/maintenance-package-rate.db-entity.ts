import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'reference_maintenance_package_rate' })
@Index(
  'uq_maint_pkg_code_type_period_mileage',
  ['packageCode', 'vehicleType', 'contractPeriodMonths', 'annualMileageKm'],
  { unique: true },
)
export class MaintenancePackageRateDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 16 })
  packageCode!: string;

  @Column({ type: 'varchar', length: 16 })
  vehicleType!: string;

  @Column({ type: 'int' })
  contractPeriodMonths!: number;

  @Column({ type: 'int' })
  annualMileageKm!: number;

  @Column({ type: 'int' })
  monthlyCost!: number;
}
