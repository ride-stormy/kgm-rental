import type { ProductDetail } from '@kgm-rental/api-contracts/product/product-detail.schema.js';

export const CONTRACT_MONTHS = [24, 36, 48, 60] as const;
export type ContractMonths = (typeof CONTRACT_MONTHS)[number];

export const ANNUAL_KM = [10000, 15000, 20000, 25000, 30000] as const;
export type AnnualKm = (typeof ANNUAL_KM)[number];

export const PERCENT_STEPS = [0, 10, 20, 30, 40, 50] as const;
export type PercentStep = (typeof PERCENT_STEPS)[number];

export const CAR_ITEM_DEFAULTS = {
  contractMonths: 60,
  annualKm: 20000,
  prepaidPercent: 10,
  subsidyPercent: 10,
} as const;

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
  skuId: string;
  trimName: string;
  minPrice: number;
}

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
