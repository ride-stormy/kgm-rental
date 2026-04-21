// VehicleTaxCostDomainService — 차세분 월비 (xlsm EG8).
// Formula (approx, from Design):
//   EV → fixed 2000 (KRW, roundUp(-2))
//   displacement ≤ 1600 → displacement × 18 / 12
//   displacement ≤ 2500 → displacement × 19 / 12
//   else → displacement × 24 / 12
//   All wrapped by ROUNDUP(-2)

import { roundUp } from './utils/krw-round.js';
import type { VehicleTypeCode } from '../value-objects/sku-preset.value-object.js';

export interface VehicleTaxCostInput {
  vehicleType: VehicleTypeCode;
  displacement: number; // cc
}

export class VehicleTaxCostDomainService {
  calculate(input: VehicleTaxCostInput): { vehicleTaxCost: number } {
    if (input.vehicleType === 'EV') {
      // EV: flat annual 20,000 → monthly 2,000 → roundUp(-2) stays 2000
      return { vehicleTaxCost: 2000 };
    }
    const d = input.displacement;
    let raw: number;
    if (d <= 1600) raw = (d * 18) / 12;
    else if (d <= 2500) raw = (d * 19) / 12;
    else raw = (d * 24) / 12;
    return { vehicleTaxCost: roundUp(raw, -2) };
  }
}
