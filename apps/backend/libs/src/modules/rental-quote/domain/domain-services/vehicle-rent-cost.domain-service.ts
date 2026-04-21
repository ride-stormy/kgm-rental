// VehicleRentCostDomainService — 차량분 월비 (xlsm EG7).
// Formula: ROUNDUP(PMT(BR32/12, M4, -H21, ROUND(CC9/1.1, 0), 0), -1)

import { pmt } from './utils/pmt.js';
import { roundUp } from './utils/krw-round.js';
import { InterestRateNotFoundException } from '../exceptions/rental-quote.exception.js';
import type { ReferenceDataset } from '../../../reference-data/domain/domain-entities/reference-data.types.js';
import type { VehicleTypeCode } from '../value-objects/sku-preset.value-object.js';

export interface VehicleRentCostInput {
  vehicleType: VehicleTypeCode;
  contractPeriodMonths: number;
  acquisitionCost: number; // H21
  residualValue: number; // CC9
}

export class VehicleRentCostDomainService {
  constructor(private readonly reference: ReferenceDataset) {}

  calculate(input: VehicleRentCostInput): { vehicleRentCost: number; annualRate: number } {
    const rateRow = this.reference.interestRates.find(
      (r) =>
        r.vehicleType === input.vehicleType &&
        r.contractPeriodMonths === input.contractPeriodMonths,
    );
    if (!rateRow) {
      throw new InterestRateNotFoundException(input.vehicleType, input.contractPeriodMonths);
    }
    const monthlyRate = rateRow.annualRate / 12;
    const fvRounded = Math.round(input.residualValue / 1.1);
    const payment = pmt(monthlyRate, input.contractPeriodMonths, -input.acquisitionCost, fvRounded, 0);
    const vehicleRentCost = roundUp(payment, -1);
    return { vehicleRentCost, annualRate: rateRow.annualRate };
  }
}
