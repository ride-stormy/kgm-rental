// MaintenanceCostDomainService — 정비 월비 (xlsm EG10).
// If the SKU preset is 'NONE', returns 0 (customer opted out / product without maintenance).

import type { ReferenceDataset } from '../../../reference-data/domain/domain-entities/reference-data.types.js';
import { MaintenanceRateNotFoundException } from '../exceptions/rental-quote.exception.js';
import type {
  MaintenancePackageCode,
  VehicleTypeCode,
} from '../value-objects/sku-preset.value-object.js';

export interface MaintenanceCostInput {
  packageCode: MaintenancePackageCode;
  vehicleType: VehicleTypeCode;
  contractPeriodMonths: number;
  annualMileageKm: number;
}

export class MaintenanceCostDomainService {
  constructor(private readonly reference: ReferenceDataset) {}

  calculate(input: MaintenanceCostInput): { maintenanceCost: number } {
    if (input.packageCode === 'NONE') return { maintenanceCost: 0 };
    const row = this.reference.maintenanceRates.find(
      (r) =>
        r.packageCode === input.packageCode &&
        r.vehicleType === input.vehicleType &&
        r.contractPeriodMonths === input.contractPeriodMonths &&
        r.annualMileageKm === input.annualMileageKm,
    );
    if (!row) {
      throw new MaintenanceRateNotFoundException(input.packageCode, input.vehicleType);
    }
    return { maintenanceCost: row.monthlyCost };
  }
}
