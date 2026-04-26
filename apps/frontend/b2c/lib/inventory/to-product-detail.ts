import { MODEL_DISPLAY } from '@/app/_content/landing';
import type {
  ProductDetail,
} from '@kgm-rental/api-contracts/product/product-detail.schema.js';
import type { VehicleSkuDto } from '@kgm-rental/api-contracts/product/vehicle-sku.schema.js';
import type { GroupedInventory, InventorySku } from './inventory-mapper';
import type { ModelSlug } from './slug-mapper';

const LANDING_DISPLAY_SLUGS = new Set(Object.keys(MODEL_DISPLAY));

const FIXED_PRESET = {
  maintenancePackage: 'NONE',
  maturityOption: '만기인수형',
  winterOption: 'tire-no',
  region: 'NONE',
} as const satisfies ProductDetail['fixedPreset'];

export const toProductDetailList = (
  grouped: GroupedInventory[],
): ProductDetail[] =>
  grouped
    .filter((group) => LANDING_DISPLAY_SLUGS.has(group.slug))
    .map(toProductDetail);

const toProductDetail = (group: GroupedInventory): ProductDetail => {
  const display = MODEL_DISPLAY[group.slug as keyof typeof MODEL_DISPLAY];
  const minPrice = Math.max(group.minPriceSku.price, 1);

  return {
    id: group.slug,
    slug: group.slug,
    name: display?.name ?? group.minPriceSku.modelName,
    brandName: 'KGM',
    heroImage: display?.thumbnail ?? '',
    vehicleTypeDefault: 'ICE',
    minMonthlyRent: minPrice,
    colorSwatch: [],
    promotionTags: [],
    description: '',
    fixedPreset: FIXED_PRESET,
    skus: group.skus.map((sku) => toVehicleSku(sku, group.slug)),
  };
};

const toVehicleSku = (sku: InventorySku, slug: ModelSlug): VehicleSkuDto => ({
  id: sku.skuId,
  productModelId: slug,
  specCode: sku.skuId.split(':')[1] ?? '',
  modelCode: sku.skuId.split(':')[0] ?? '',
  trim: sku.trimLabel || sku.modelName,
  vehicleType: 'ICE',
  displacement: 0,
  colorExteriorCode: sku.colorCode,
  colorExteriorName: sku.colorName,
  colorInteriorCode: null,
  options: [
    ...sku.baseCustomizing.map((c) => c.name),
    ...sku.optionCustomizing.map((c) => c.name),
  ],
  price: Math.max(sku.price, 1),
  stockBucket: sku.duplicateCount,
  productionPeriods: [...sku.makeDates],
});
