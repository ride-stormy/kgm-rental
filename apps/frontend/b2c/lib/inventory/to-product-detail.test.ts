import { describe, expect, it } from 'vitest';
import { toProductDetailList } from './to-product-detail';
import type { GroupedInventory, InventorySku } from './inventory-mapper';

const makeSku = (overrides: Partial<InventorySku> = {}): InventorySku => ({
  slug: '2025-torres',
  skuId: 'MW5:A1:BK01',
  modelName: '토레스 T7 4WD',
  trimLabel: 'T7 4WD',
  colorName: 'Space Black',
  colorCode: 'BK01',
  basePrice: 30_000_000,
  optionPrice: 0,
  baseCustomizing: [{ name: '기본옵션', amount: 0 }],
  optionCustomizing: [{ name: '추가옵션', amount: 0 }],
  price: 31_000_000,
  priceError: false,
  duplicateCount: 2,
  makeDates: ['26.03'],
  ...overrides,
});

const makeGroup = (overrides: Partial<GroupedInventory> = {}): GroupedInventory => {
  const sku = makeSku();
  return {
    slug: '2025-torres',
    skus: [sku],
    minPriceSku: sku,
    totalCount: 2,
    ...overrides,
  };
};

describe('toProductDetailList', () => {
  it('maps group slug + display name into ProductDetail', () => {
    const result = toProductDetailList([makeGroup()]);
    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe('2025-torres');
    expect(result[0]?.name).toBe('토레스');
    expect(result[0]?.minMonthlyRent).toBe(31_000_000);
  });

  it('maps each InventorySku into VehicleSkuDto with id/trim/price preserved', () => {
    const sku = makeSku({ skuId: 'X:Y:Z', trimLabel: 'X-edition', price: 28_500_000 });
    const result = toProductDetailList([makeGroup({ skus: [sku], minPriceSku: sku })]);
    const dto = result[0]?.skus[0];
    expect(dto?.id).toBe('X:Y:Z');
    expect(dto?.trim).toBe('X-edition');
    expect(dto?.price).toBe(28_500_000);
    expect(dto?.colorExteriorCode).toBe('BK01');
  });

  it('filters out groups whose slug is not in MODEL_DISPLAY (non-whitelisted)', () => {
    const unknownSku = makeSku({ slug: 'tivoli' as unknown as InventorySku['slug'] });
    const unknownGroup: GroupedInventory = {
      slug: 'tivoli' as unknown as GroupedInventory['slug'],
      skus: [unknownSku],
      minPriceSku: unknownSku,
      totalCount: 1,
    };
    const torresGroup = makeGroup();
    const result = toProductDetailList([unknownGroup, torresGroup]);
    expect(result.map((p) => p.slug)).toEqual(['2025-torres']);
  });

  it('substitutes price=1 when SKU price is 0 to satisfy minMonthlyRent positivity', () => {
    const zeroSku = makeSku({ price: 0, priceError: true });
    const result = toProductDetailList([makeGroup({ skus: [zeroSku], minPriceSku: zeroSku })]);
    expect(result[0]?.minMonthlyRent).toBeGreaterThanOrEqual(1);
    expect(result[0]?.skus[0]?.price).toBeGreaterThanOrEqual(1);
  });
});
