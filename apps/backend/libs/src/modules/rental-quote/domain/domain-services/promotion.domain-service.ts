// PromotionDomainService — applies vehicle-specific/type-specific promotions
// to the monthly 차량분 cost. Currently supports flat KRW reduction per month.
// xlsm references: EV 특판 150만원 (BC2 area) reduces monthly vehicleRentCost.

import type {
  PromotionRow,
  ReferenceDataset,
} from '../../../reference-data/domain/domain-entities/reference-data.types.js';
import type { VehicleTypeCode } from '../value-objects/sku-preset.value-object.js';

export interface PromotionApplyInput {
  vehicleSlug: string;
  vehicleType: VehicleTypeCode;
}

export class PromotionDomainService {
  constructor(private readonly reference: ReferenceDataset) {}

  findActivePromotions(input: PromotionApplyInput): PromotionRow[] {
    return this.reference.promotions.filter(
      (p) =>
        (!p.vehicleSlug || p.vehicleSlug === input.vehicleSlug) &&
        (!p.vehicleType || p.vehicleType === input.vehicleType),
    );
  }

  // Returns the total monthly reduction (KRW, positive number) to subtract
  // from vehicleRentCost. Multiple promotions accumulate.
  monthlyReduction(input: PromotionApplyInput): number {
    return this.findActivePromotions(input).reduce((sum, p) => sum + p.amount, 0);
  }
}
