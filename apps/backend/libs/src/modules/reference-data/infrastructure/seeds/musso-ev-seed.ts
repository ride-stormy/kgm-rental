// Demo EV seed — Musso EV with '특판 150만원' promotion.
// Used to exercise PromotionDomainService (EV branch) in tests.
// Prices/rates are placeholder; replace with real xlsm extraction when EV
// product launches (B roadmap).

import type { ReferenceDataset } from '../../domain/domain-entities/reference-data.types.js';

const BASE = {
  price: 55000000,
  priceAfterDiscount: 52000000,
  acquisitionCost: 48000000,
  displacement: 0, // EV
  interest36M: 0.055,
  residual36M20k: 0.58,
  maintenanceSelect36M20k: 42000,
  insurance20k: 680000,
};

export const mussoEvSeed: ReferenceDataset = {
  vehicles: [
    {
      slug: 'musso-ev',
      modelCode: 'EV1',
      specCode: 'MEV-STD',
      name: '무쏘 EV',
      vehicleType: 'EV',
      displacement: BASE.displacement,
      price: BASE.price,
      priceAfterDiscount: BASE.priceAfterDiscount,
      acquisitionCost: BASE.acquisitionCost,
    },
  ],
  interestRates: [
    { vehicleType: 'EV', contractPeriodMonths: 36, annualRate: BASE.interest36M },
  ],
  residualRates: [
    {
      vehicleType: 'EV',
      contractPeriodMonths: 36,
      annualMileageKm: 20000,
      residualFraction: BASE.residual36M20k,
    },
  ],
  deliveryRates: [{ region: '서울/경기/인천', firstLegFee: 0, secondLegFee: 132000 }],
  maintenanceRates: [
    {
      packageCode: 'Select',
      vehicleType: 'EV',
      contractPeriodMonths: 36,
      annualMileageKm: 20000,
      monthlyCost: BASE.maintenanceSelect36M20k,
    },
  ],
  insuranceRates: [
    {
      vehicleType: 'EV',
      annualMileageKm: 20000,
      coverTier: 'standard',
      annualPremium: BASE.insurance20k,
    },
  ],
  promotions: [
    {
      code: 'EV_SPECIAL_150',
      vehicleType: 'EV',
      amount: 1500000 / 36, // 150만원 / 36개월 = 41,666.67원 월 차감
      note: 'xlsm BC2 영역: EV 특판 150만원 (36개월 분할 적용)',
    },
  ],
  winterOptionRates: [{ winterOption: 'chain-no', vehicleType: 'EV', monthlyCost: 0 }],
};
