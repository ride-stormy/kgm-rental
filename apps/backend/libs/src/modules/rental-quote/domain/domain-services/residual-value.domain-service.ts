// ResidualValueDomainService — 잔가(=인수가) 계산.
// xlsm cell CC9 = ROUNDUP(X8 × 잔가율, -3)

import { roundUp } from './utils/krw-round.js';
import type { ReferenceDataset } from '../../../reference-data/domain/domain-entities/reference-data.types.js';
import { ResidualRateNotFoundException } from '../exceptions/rental-quote.exception.js';
import type { VehicleTypeCode } from '../value-objects/sku-preset.value-object.js';

export interface ResidualValueInput {
  vehiclePrice: number; // X8
  vehicleType: VehicleTypeCode;
  contractPeriodMonths: number;
  annualMileageKm: number;
}

export class ResidualValueDomainService {
  constructor(private readonly reference: ReferenceDataset) {}

  calculate(input: ResidualValueInput): { residualValue: number; residualFraction: number } {
    const row = this.reference.residualRates.find(
      (r) =>
        r.vehicleType === input.vehicleType &&
        r.contractPeriodMonths === input.contractPeriodMonths &&
        r.annualMileageKm === input.annualMileageKm,
    );
    if (!row) {
      throw new ResidualRateNotFoundException(
        input.vehicleType,
        input.contractPeriodMonths,
        input.annualMileageKm,
      );
    }
    const raw = input.vehiclePrice * row.residualFraction;
    const residualValue = roundUp(raw, -3);
    return { residualValue, residualFraction: row.residualFraction };
  }
}
