// FixedCostDomainService — 차고지(EG11) + 조합(EG12) + 멤버쉽(EG13).
// Parking is region-dependent. Region='NONE' → 0.
// Association is a constant 700 KRW/month (법정 렌터카조합비).
// Membership is 0 by default; set via reference if product includes premium membership.

import type { RegionCode, WinterOptionCode, VehicleTypeCode } from '../value-objects/sku-preset.value-object.js';
import type { ReferenceDataset } from '../../../reference-data/domain/domain-entities/reference-data.types.js';

const PARKING_COST_BY_REGION: Partial<Record<RegionCode, number>> = {
  '서울/경기/인천': 500,
  충남: 500,
  충북: 500,
  경북: 500,
  경남: 500,
  전북: 500,
  전남: 500,
  '강원(영서)': 500,
  '강원(영동)': 500,
  제주: 500,
};
const ASSOCIATION_COST = 700;
const MEMBERSHIP_COST_DEFAULT = 0;

export interface FixedCostInput {
  region: RegionCode;
  winterOption: WinterOptionCode;
  vehicleType: VehicleTypeCode;
}

export class FixedCostDomainService {
  constructor(private readonly reference: ReferenceDataset) {}

  calculate(input: FixedCostInput): {
    parkingCost: number;
    associationCost: number;
    membershipCost: number;
    winterCost: number;
  } {
    const parkingCost = input.region === 'NONE' ? 0 : PARKING_COST_BY_REGION[input.region] ?? 0;
    const associationCost = ASSOCIATION_COST;
    const membershipCost = MEMBERSHIP_COST_DEFAULT;
    const winterRow = this.reference.winterOptionRates.find(
      (r) => r.winterOption === input.winterOption && r.vehicleType === input.vehicleType,
    );
    const winterCost = winterRow?.monthlyCost ?? 0;
    return { parkingCost, associationCost, membershipCost, winterCost };
  }
}
