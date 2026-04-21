// Reference data tables consumed by rental-quote domain services.
// Each table is modeled as a collection of immutable rows.

import type {
  MaintenancePackageCode,
  RegionCode,
  VehicleTypeCode,
  WinterOptionCode,
} from '../../../rental-quote/domain/value-objects/sku-preset.value-object.js';

// --- Vehicle ---
export interface Vehicle {
  slug: string; // e.g. actyon-hev
  modelCode: string; // e.g. MW5
  specCode: string; // e.g. ND0J5C
  name: string; // 표시명
  vehicleType: VehicleTypeCode;
  displacement: number; // cc
  price: number; // X8 (pre-discount base)
  priceAfterDiscount: number; // H4 (post-discount)
  acquisitionCost: number; // H21 (취득원가)
}

// --- InterestRate: (vehicleType, contractPeriod) -> annualRate ---
export interface InterestRateRow {
  vehicleType: VehicleTypeCode;
  contractPeriodMonths: number;
  annualRate: number; // e.g. 0.05295700423...
}

// --- ResidualRate: (vehicleType, contractPeriod, annualMileage) -> fraction ---
export interface ResidualRateRow {
  vehicleType: VehicleTypeCode;
  contractPeriodMonths: number;
  annualMileageKm: number;
  residualFraction: number; // e.g. 0.72
}

// --- DeliveryRate: (region) -> deliveryFee ---
export interface DeliveryRateRow {
  region: RegionCode;
  firstLegFee: number; // 메이커 1차 탁송
  secondLegFee: number; // 지역 2차 탁송
}

// --- MaintenancePackageRate: (package, vehicleType, contractPeriod, mileage) -> monthlyCost ---
export interface MaintenancePackageRateRow {
  packageCode: MaintenancePackageCode;
  vehicleType: VehicleTypeCode;
  contractPeriodMonths: number;
  annualMileageKm: number;
  monthlyCost: number; // EG10 base
}

// --- InsuranceRate: (vehicleType, annualMileage, coverTier) -> annualPremium ---
export interface InsuranceRateRow {
  vehicleType: VehicleTypeCode;
  annualMileageKm: number;
  coverTier: string; // e.g. 'standard', 'wide'
  annualPremium: number; // 연간 보험료
}

// --- Promotion: vehicle-specific or type-specific discounts ---
export interface PromotionRow {
  code: string; // e.g. 'EV_SPECIAL_150', 'TORRES_SELECT'
  vehicleSlug?: string; // specific vehicle
  vehicleType?: VehicleTypeCode; // or entire type
  amount: number; // KRW, applied to 차량분 component
  note?: string;
}

// --- Extras: winter, parking, association, membership ---
export interface WinterOptionRateRow {
  winterOption: WinterOptionCode;
  vehicleType: VehicleTypeCode;
  monthlyCost: number;
}

// --- Bundled reference dataset loaded once and passed to services ---
export interface ReferenceDataset {
  vehicles: Vehicle[];
  interestRates: InterestRateRow[];
  residualRates: ResidualRateRow[];
  deliveryRates: DeliveryRateRow[];
  maintenanceRates: MaintenancePackageRateRow[];
  insuranceRates: InsuranceRateRow[];
  promotions: PromotionRow[];
  winterOptionRates: WinterOptionRateRow[];
}
