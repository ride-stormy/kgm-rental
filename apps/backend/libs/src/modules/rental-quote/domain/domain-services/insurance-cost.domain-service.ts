// InsuranceCostDomainService — 보험료 월비 (xlsm EG9).
// Formula: ROUNDUP(연간 보험료 / 12, -2)

import { roundUp } from './utils/krw-round.js';
import { InsuranceRateNotFoundException } from '../exceptions/rental-quote.exception.js';
import type { ReferenceDataset } from '../../../reference-data/domain/domain-entities/reference-data.types.js';
import type { VehicleTypeCode } from '../value-objects/sku-preset.value-object.js';

export interface InsuranceCostInput {
  vehicleType: VehicleTypeCode;
  annualMileageKm: number;
  coverTier?: string; // default: 'standard'
}

export class InsuranceCostDomainService {
  constructor(private readonly reference: ReferenceDataset) {}

  calculate(input: InsuranceCostInput): { insuranceCost: number; annualPremium: number } {
    const tier = input.coverTier ?? 'standard';
    const row = this.reference.insuranceRates.find(
      (r) =>
        r.vehicleType === input.vehicleType &&
        r.annualMileageKm === input.annualMileageKm &&
        r.coverTier === tier,
    );
    if (!row) {
      throw new InsuranceRateNotFoundException(input.vehicleType, input.annualMileageKm);
    }
    const monthly = row.annualPremium / 12;
    return { insuranceCost: roundUp(monthly, -2), annualPremium: row.annualPremium };
  }
}
