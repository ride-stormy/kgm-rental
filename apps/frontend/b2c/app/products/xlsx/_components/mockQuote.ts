// Client-side approximation of the rental quote formula.
// Used by /products/xlsx preview only — NOT the real F2 algorithm.
// Numbers are plausible for UX verification, not binding.

import type { QuoteBreakdown } from '@kgm-rental/api-contracts/rental-quote/calculate-quote.schema.js';

const RENT_RATE_BY_PERIOD: Record<number, number> = {
  24: 0.021,
  36: 0.018,
  48: 0.016,
  60: 0.015,
};

const RESIDUAL_BASE_BY_PERIOD: Record<number, number> = {
  24: 0.78,
  36: 0.72,
  48: 0.64,
  60: 0.55,
};

const RESIDUAL_MILEAGE_ADJ: Record<number, number> = {
  10000: 0.05,
  15000: 0.025,
  20000: 0,
  25000: -0.02,
  30000: -0.04,
};

const MILEAGE_RENT_MULTIPLIER: Record<number, number> = {
  10000: 0.88,
  15000: 0.94,
  20000: 1,
  25000: 1.06,
  30000: 1.11,
};

export interface MockQuoteInput {
  basePrice: number;
  contractPeriod: number;
  annualMileage: number;
  prepaidRate: number;
  depositRate: number;
}

export const computeMockQuote = ({
  basePrice,
  contractPeriod,
  annualMileage,
  prepaidRate,
  depositRate,
}: MockQuoteInput): QuoteBreakdown => {
  const rentRate = RENT_RATE_BY_PERIOD[contractPeriod] ?? 0.018;
  const mileageMul = MILEAGE_RENT_MULTIPLIER[annualMileage] ?? 1;
  const standardRent = Math.round(basePrice * rentRate * mileageMul);

  const discountTotal = -Math.round(standardRent * 0.025);

  const prepaidAmount = Math.round((basePrice * prepaidRate) / 100);
  const depositAmount = Math.round((basePrice * depositRate) / 100);
  const prepaidDeduction =
    prepaidAmount > 0 ? -Math.round(prepaidAmount / contractPeriod) : 0;

  const finalMonthlyRent = Math.max(
    0,
    standardRent + discountTotal + prepaidDeduction,
  );
  const initialBurden = prepaidAmount + depositAmount;

  const supplyPrice = Math.round(finalMonthlyRent / 1.1);
  const vat = finalMonthlyRent - supplyPrice;

  return {
    standardRent,
    discountTotal,
    prepaidDeduction,
    finalMonthlyRent,
    residualValue: computeMockResidualValue({ basePrice, contractPeriod, annualMileage }),
    prepaidAmount,
    depositAmount,
    initialBurden,
    supplyPrice,
    vat,
  };
};

export interface MockResidualInput {
  basePrice: number;
  contractPeriod: number;
  annualMileage: number;
}

export const computeMockResidualValue = ({
  basePrice,
  contractPeriod,
  annualMileage,
}: MockResidualInput): number => {
  const base = RESIDUAL_BASE_BY_PERIOD[contractPeriod] ?? 0.6;
  const adj = RESIDUAL_MILEAGE_ADJ[annualMileage] ?? 0;
  const fraction = Math.max(0.3, Math.min(0.85, base + adj));
  return Math.round(basePrice * fraction);
};
