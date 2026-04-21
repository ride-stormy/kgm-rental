// RentalQuote — snapshot of a quote calculation result.
// Captures customer inputs, SKU preset, vehicle info, and every break-down
// amount in KRW integers so that the API response and audit trail share the
// same data shape.

import {
  AnnualMileageKm,
  ContractPeriodMonths,
  DepositRatePercent,
  PrepaidRatePercent,
} from '../value-objects/customer-input.value-object.js';
import {
  MaintenancePackageCode,
  MaturityOptionCode,
  RegionCode,
  VehicleTypeCode,
  WinterOptionCode,
} from '../value-objects/sku-preset.value-object.js';

export interface QuoteInputSnapshot {
  skuId: string;
  vehicleSlug: string;
  vehicleType: VehicleTypeCode;
  vehiclePrice: number; // X8 (pre-discount base price)
  vehiclePriceAfterDiscount: number; // H4 (post-discount)
  displacement: number; // cc
  contractPeriod: ContractPeriodMonths;
  annualMileage: AnnualMileageKm;
  prepaidRate: PrepaidRatePercent;
  depositRate: DepositRatePercent;
  preset: {
    maintenancePackage: MaintenancePackageCode;
    maturityOption: MaturityOptionCode;
    winterOption: WinterOptionCode;
    region: RegionCode;
  };
}

export interface QuoteBreakdown {
  // Monthly cost components (VAT-exclusive sum BEFORE roundUp)
  vehicleRentCost: number; // EG7
  vehicleTaxCost: number; // EG8
  insuranceCost: number; // EG9
  maintenanceCost: number; // EG10
  parkingCost: number; // EG11
  associationCost: number; // EG12
  membershipCost: number; // EG13

  // Derived monthly totals
  supplyPrice: number; // BR26 = ROUNDUP(sum, -2)
  vat: number; // BR27 = ROUNDDOWN(supply * 0.1, -1)
  standardRent: number; // BR23 = supply + vat
  discountTotal: number; // signed (reserved for future manual adjustments)
  prepaidDeduction: number; // BR28 (negative)
  finalMonthlyRent: number; // Y30 = standardRent + discountTotal + prepaidDeduction

  // Up-front amounts
  residualValue: number; // CC9
  prepaidAmount: number; // CC21
  depositAmount: number; // CC8
  initialBurden: number; // Y33 = deposit + prepaid
}

export interface RentalQuoteSnapshot {
  input: QuoteInputSnapshot;
  breakdown: QuoteBreakdown;
}

export class RentalQuote {
  private constructor(public readonly snapshot: RentalQuoteSnapshot) {}

  static from(snapshot: RentalQuoteSnapshot): RentalQuote {
    return new RentalQuote(snapshot);
  }

  get finalMonthlyRent(): number {
    return this.snapshot.breakdown.finalMonthlyRent;
  }

  get initialBurden(): number {
    return this.snapshot.breakdown.initialBurden;
  }

  get residualValue(): number {
    return this.snapshot.breakdown.residualValue;
  }

  toJSON(): RentalQuoteSnapshot {
    return this.snapshot;
  }
}
