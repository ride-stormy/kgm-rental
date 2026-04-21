// Reference data seed — Acktyon 1.5T HEV.
// Only the 36M / 20,000km / Select / 20k-insurance combination is xlsm-sourced
// (1 KRW match verified via case #1). Other rows are PLAUSIBLE BASELINES so
// that regression tests cover variations of prepaid/deposit/preset across
// contract periods and mileages. These will be replaced with xlsm-sourced
// values in a later Stage (B in the roadmap).

import type { ReferenceDataset } from '../../domain/domain-entities/reference-data.types.js';

// ─── XLSM-SOURCED VALUES ────────────────────────────────────────────────
const XLSM = {
  vehiclePriceX8: 40690000,
  vehiclePriceH4: 37790000,
  acquisitionCostH21: 35218372.42,
  displacement: 1497,
  interest36M: 0.05295700423125657, // BR32 cache
  residual36M20k: 0.72, // BR9 cache
  maintenanceSelect36M20k: 49000, // EG10 cache
  insurance20k: 620000, // EG30 cache (annual, standard cover)
} as const;

// ─── PLAUSIBLE-BASELINE VALUES (for regression coverage) ────────────────
// Contract-period-dependent interest rates (HEV). Longer period = slightly
// higher rate in Korean rental convention.
const PLAUSIBLE_RATES: Record<24 | 48 | 60, number> = {
  24: 0.0515,
  48: 0.0545,
  60: 0.056,
};

// Residual fraction approximation. More mileage OR longer period → lower.
function plausibleResidual(period: number, mileage: number): number {
  const base: Record<number, number> = { 24: 0.78, 36: 0.72, 48: 0.64, 60: 0.55 };
  const mileageAdj: Record<number, number> = {
    10000: 0.05,
    15000: 0.025,
    20000: 0,
    25000: -0.02,
    30000: -0.04,
  };
  const b = base[period] ?? 0.6;
  const m = mileageAdj[mileage] ?? 0;
  return Math.round((b + m) * 100) / 100;
}

// Select maintenance cost variations.
function plausibleMaintenance(period: number, mileage: number): number {
  const mileageFactor: Record<number, number> = {
    10000: 0.85,
    15000: 0.92,
    20000: 1,
    25000: 1.08,
    30000: 1.15,
  };
  const periodFactor: Record<number, number> = { 24: 1.05, 36: 1, 48: 0.96, 60: 0.93 };
  const base = XLSM.maintenanceSelect36M20k;
  return Math.round((base * (mileageFactor[mileage] ?? 1) * (periodFactor[period] ?? 1)) / 100) * 100;
}

// Annual insurance premium — plausible scaling by mileage.
function plausibleInsurance(mileage: number): number {
  const factor: Record<number, number> = {
    10000: 0.85,
    15000: 0.92,
    20000: 1,
    25000: 1.1,
    30000: 1.22,
  };
  return Math.round(XLSM.insurance20k * (factor[mileage] ?? 1));
}

// ─── Build dataset ──────────────────────────────────────────────────────

const periods = [24, 36, 48, 60] as const;
const mileages = [10000, 15000, 20000, 25000, 30000] as const;

const interestRates = periods.map((p) => ({
  vehicleType: 'HEV' as const,
  contractPeriodMonths: p,
  annualRate: p === 36 ? XLSM.interest36M : PLAUSIBLE_RATES[p as 24 | 48 | 60],
}));

const residualRates = periods.flatMap((p) =>
  mileages.map((m) => ({
    vehicleType: 'HEV' as const,
    contractPeriodMonths: p,
    annualMileageKm: m,
    residualFraction: p === 36 && m === 20000 ? XLSM.residual36M20k : plausibleResidual(p, m),
  })),
);

const maintenanceRates = periods.flatMap((p) =>
  mileages.map((m) => ({
    packageCode: 'Select' as const,
    vehicleType: 'HEV' as const,
    contractPeriodMonths: p,
    annualMileageKm: m,
    monthlyCost:
      p === 36 && m === 20000 ? XLSM.maintenanceSelect36M20k : plausibleMaintenance(p, m),
  })),
);

const insuranceRates = mileages.map((m) => ({
  vehicleType: 'HEV' as const,
  annualMileageKm: m,
  coverTier: 'standard',
  annualPremium: m === 20000 ? XLSM.insurance20k : plausibleInsurance(m),
}));

export const actyonHevSeed: ReferenceDataset = {
  vehicles: [
    {
      slug: 'actyon-hev',
      modelCode: 'MW5',
      specCode: 'ND0J5C',
      name: '액티언 1.5T HEV',
      vehicleType: 'HEV',
      displacement: XLSM.displacement,
      price: XLSM.vehiclePriceX8,
      priceAfterDiscount: XLSM.vehiclePriceH4,
      acquisitionCost: XLSM.acquisitionCostH21,
    },
  ],
  interestRates,
  residualRates,
  deliveryRates: [{ region: '서울/경기/인천', firstLegFee: 0, secondLegFee: 132000 }],
  maintenanceRates,
  insuranceRates,
  promotions: [],
  winterOptionRates: [{ winterOption: 'chain-no', vehicleType: 'HEV', monthlyCost: 0 }],
};
