import type { ProductDetail } from '@kgm-rental/api-contracts/product/product-detail.schema.js';

export const CONTRACT_MONTHS = [36, 48, 60] as const;
export type ContractMonths = (typeof CONTRACT_MONTHS)[number];

export const ANNUAL_KM = [10000, 20000, 30000, 40000] as const;
export type AnnualKm = (typeof ANNUAL_KM)[number];

export const PERCENT_STEPS = [0, 10, 20, 30, 40, 50] as const;
export type PercentStep = (typeof PERCENT_STEPS)[number];

export const CAR_ITEM_DEFAULTS = {
  contractMonths: 60,
  annualKm: 20000,
  prepaidPercent: 10,
  subsidyPercent: 10,
} as const;

const INTEREST_RATE_ANNUAL = 0.059;

const RESIDUAL_RATE_BY_MONTHS: Record<ContractMonths, number> = {
  36: 0.55,
  48: 0.45,
  60: 0.35,
};

const KM_FACTOR_BY_ANNUAL: Record<AnnualKm, number> = {
  10000: 0.95,
  20000: 1.0,
  30000: 1.08,
  40000: 1.18,
};

export interface CarItemPricing {
  modelSlug: string;
  minMonthlyFromMinSku: number;
  minSkuId: string;
  minSkuTrimName: string;
  minVehiclePrice: number;
}

export interface ComputeMonthlyQuoteInput {
  vehiclePrice: number;
  contractMonths: ContractMonths;
  annualKm: AnnualKm;
  prepaidPercent: PercentStep;
  subsidyPercent: PercentStep;
}

const pmt = (rate: number, nper: number, pv: number, fv: number): number => {
  if (rate === 0) return -(pv + fv) / nper;
  const pvif = Math.pow(1 + rate, nper);
  return -(rate * (pv * pvif + fv)) / (pvif - 1);
};

const roundToThousand = (value: number): number => Math.round(value / 1000) * 1000;

export const computeMonthlyQuote = (input: ComputeMonthlyQuoteInput): number => {
  const { vehiclePrice, contractMonths, annualKm, prepaidPercent, subsidyPercent } = input;
  if (!Number.isFinite(vehiclePrice) || vehiclePrice <= 0) return 0;

  const discountRate = (prepaidPercent + subsidyPercent) / 100;
  const financedAmount = vehiclePrice * (1 - discountRate);
  if (financedAmount <= 0) return 0;

  const residual = vehiclePrice * RESIDUAL_RATE_BY_MONTHS[contractMonths];
  const monthlyRate = INTEREST_RATE_ANNUAL / 12;
  const rawMonthly = pmt(monthlyRate, contractMonths, -financedAmount, residual);
  const adjusted = rawMonthly * KM_FACTOR_BY_ANNUAL[annualKm];

  return roundToThousand(Math.max(0, adjusted));
};

export const findMinSku = (
  product: ProductDetail,
): { skuId: string; trimName: string; vehiclePrice: number } | null => {
  if (product.skus.length === 0) return null;
  const minSku = product.skus.reduce((min, current) =>
    current.price < min.price ? current : min,
  );
  return { skuId: minSku.id, trimName: minSku.trim, vehiclePrice: minSku.price };
};

export interface TrimGroupOption {
  skuId: string;       // 해당 trim의 최저가 SKU id
  trimName: string;    // 고유 trim 이름
  minPrice: number;    // 해당 trim 최저가
}

// 같은 trim 이름이 여러 SKU로 쪼개져 있는 경우 trim 기준 dedupe + 최저가 SKU 선택
export const groupSkusByTrim = (product: ProductDetail): TrimGroupOption[] => {
  const byTrim = new Map<string, TrimGroupOption>();
  for (const sku of product.skus) {
    const existing = byTrim.get(sku.trim);
    if (!existing || sku.price < existing.minPrice) {
      byTrim.set(sku.trim, {
        skuId: sku.id,
        trimName: sku.trim,
        minPrice: sku.price,
      });
    }
  }
  return Array.from(byTrim.values()).sort((a, b) => a.minPrice - b.minPrice);
};

export const computeCarItemPricing = (products: ProductDetail[]): CarItemPricing[] => {
  return products
    .map((product): CarItemPricing | null => {
      const minSku = findMinSku(product);
      if (!minSku || minSku.vehiclePrice <= 0) return null;

      const monthly = computeMonthlyQuote({
        vehiclePrice: minSku.vehiclePrice,
        contractMonths: CAR_ITEM_DEFAULTS.contractMonths,
        annualKm: CAR_ITEM_DEFAULTS.annualKm,
        prepaidPercent: CAR_ITEM_DEFAULTS.prepaidPercent,
        subsidyPercent: CAR_ITEM_DEFAULTS.subsidyPercent,
      });

      return {
        modelSlug: product.slug,
        minMonthlyFromMinSku: monthly,
        minSkuId: minSku.skuId,
        minSkuTrimName: minSku.trimName,
        minVehiclePrice: minSku.vehiclePrice,
      };
    })
    .filter((pricing): pricing is CarItemPricing => pricing !== null);
};
