import type {
  CustomizingDetail,
  InventoryItem,
} from '@kgm-rental/api-contracts/inventory/inventory.schema.js';
import { computeVehiclePrice } from './amount-parser';
import { MODEL_SLUGS, resolveModelSlug } from './slug-mapper';
import type { ModelSlug } from './slug-mapper';

export interface InventorySku {
  slug: ModelSlug;
  skuId: string;
  modelName: string;
  trimLabel: string;
  colorName: string;
  colorCode: string;
  basePrice: number;
  optionPrice: number;
  baseCustomizing: CustomizingDetail[];
  optionCustomizing: CustomizingDetail[];
  price: number;
  priceError: boolean;
  duplicateCount: number;
  makeDates: readonly string[];
}

export interface GroupedInventory {
  slug: ModelSlug;
  skus: InventorySku[];
  minPriceSku: InventorySku;
  totalCount: number;
}

export const mapToVehicleSku = (item: InventoryItem): InventorySku | undefined => {
  const slug = resolveModelSlug(item);
  if (!slug) return undefined;
  const { price, priceError } = computeVehiclePrice(item);
  const skuId = `${item.modelCode}:${item.specCode}:${item.colorCode}`;
  const trimLabel = extractTrimLabel(item.modelName, slug);
  return {
    slug,
    skuId,
    modelName: item.modelName,
    trimLabel,
    colorName: item.colorName,
    colorCode: item.colorCode,
    basePrice: item.baseTotalAmount,
    optionPrice: item.optionTotalAmount,
    baseCustomizing: item.baseCustomizingDetail,
    optionCustomizing: item.optionCustomizingDetail,
    price,
    priceError,
    duplicateCount: item.duplicateCount ?? 1,
    makeDates: item.makeDates,
  };
};

export const groupByModel = (items: InventoryItem[]): GroupedInventory[] => {
  const buckets = new Map<ModelSlug, InventorySku[]>();
  for (const it of items) {
    const sku = mapToVehicleSku(it);
    if (!sku) {
      // eslint-disable-next-line no-console
      console.warn('[inventory-mapper] slug mapping failed', {
        vehicleModelName: it.vehicleModelName,
        modelName: it.modelName,
        modelCode: it.modelCode,
      });
      continue;
    }
    const arr = buckets.get(sku.slug) ?? [];
    arr.push(sku);
    buckets.set(sku.slug, arr);
  }
  return [...buckets.entries()].map(([slug, skus]) => ({
    slug,
    skus,
    minPriceSku: skus.reduce((a, b) => (a.price <= b.price ? a : b)),
    totalCount: skus.reduce((sum, s) => sum + s.duplicateCount, 0),
  }));
};

export interface TrimPresence {
  trimLabel: string;
  colorCodes: readonly string[];
}

export const listTrimColors = (skus: InventorySku[]): TrimPresence[] => {
  const map = new Map<string, Set<string>>();
  for (const sku of skus) {
    const bucket = map.get(sku.trimLabel) ?? new Set<string>();
    bucket.add(sku.colorCode);
    map.set(sku.trimLabel, bucket);
  }
  return [...map.entries()].map(([trimLabel, colors]) => ({
    trimLabel,
    colorCodes: [...colors],
  }));
};

export interface ColorInfo {
  code: string;
  name: string;
}

export const listUniqueColors = (skus: InventorySku[]): ColorInfo[] => {
  const map = new Map<string, string>();
  for (const sku of skus) {
    if (!map.has(sku.colorCode)) map.set(sku.colorCode, sku.colorName);
  }
  return [...map.entries()].map(([code, name]) => ({ code, name }));
};

export const extractTrimLabel = (modelName: string, slug: ModelSlug): string => {
  const extracted = TRIM_EXTRACTORS[slug](modelName);
  return extracted || modelName;
};

const TRIM_EXTRACTORS: Record<ModelSlug, (modelName: string) => string> = {
  'actyon-hev': (mn) =>
    mn.replace(/^액티[언온]\s*하이브리드(\s*하이브리드)?\s*/, '').trim(),
  '2025-torres': (mn) => mn.replace(/^토레스\s*/, '').trim(),
};

export { MODEL_SLUGS };
export type { ModelSlug };
