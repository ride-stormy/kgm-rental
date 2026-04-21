// SupplyPriceDomainService — 공급가(BR26) + 부가세(BR27) + 표준렌탈료(BR23).
// supply = ROUNDUP(sum of monthly cost components, -2)
// vat    = ROUNDDOWN(supply × 0.1, -1)
// rent   = supply + vat

import { roundDown, roundUp } from './utils/krw-round.js';

export interface SupplyPriceInput {
  vehicleRentCost: number;
  vehicleTaxCost: number;
  insuranceCost: number;
  maintenanceCost: number;
  parkingCost: number;
  associationCost: number;
  membershipCost: number;
  winterCost: number;
}

export class SupplyPriceDomainService {
  calculate(input: SupplyPriceInput): { supplyPrice: number; vat: number; standardRent: number } {
    const sum =
      input.vehicleRentCost +
      input.vehicleTaxCost +
      input.insuranceCost +
      input.maintenanceCost +
      input.parkingCost +
      input.associationCost +
      input.membershipCost +
      input.winterCost;
    const supplyPrice = roundUp(sum, -2);
    const vat = roundDown(supplyPrice * 0.1, -1);
    return { supplyPrice, vat, standardRent: supplyPrice + vat };
  }
}
