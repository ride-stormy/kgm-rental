import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  extractTrimLabel,
  groupByModel,
  listTrimColors,
  listUniqueColors,
  mapToVehicleSku,
} from './inventory-mapper';
import type { InventoryItem } from '@kgm-rental/api-contracts/inventory/inventory.schema.js';

const makeItem = (overrides: Partial<InventoryItem> = {}): InventoryItem => ({
  modelName: '액티언 하이브리드 S8',
  modelCode: 'OP5',
  specCode: 'A1',
  colorName: 'Space Black',
  colorCode: 'BK01',
  baseTotalAmount: 30000000,
  optionTotalAmount: 1500000,
  baseCustomizingDetail: [{ name: '기본패키지', amount: 500000 }],
  optionCustomizingDetail: [{ name: '선루프', amount: 800000 }],
  vehicleModelName: '액티언 하이브리드',
  duplicateCount: 1,
  makeDates: ['26.03'],
  ...overrides,
});

describe('mapToVehicleSku', () => {
  it('produces skuId = modelCode:specCode:colorCode', () => {
    const sku = mapToVehicleSku(makeItem());
    expect(sku?.skuId).toBe('OP5:A1:BK01');
  });

  it('normalizes null duplicateCount to 1', () => {
    const sku = mapToVehicleSku(makeItem({ duplicateCount: null }));
    expect(sku?.duplicateCount).toBe(1);
  });

  it('returns undefined when slug resolution fails', () => {
    const sku = mapToVehicleSku(
      makeItem({ vehicleModelName: null, modelCode: 'MWS' })
    );
    expect(sku).toBeUndefined();
  });

  it('sums prices correctly', () => {
    const sku = mapToVehicleSku(makeItem());
    expect(sku?.price).toBe(30000000 + 1500000 + 500000 + 800000);
    expect(sku?.priceError).toBe(false);
  });
});

describe('groupByModel', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('groups by slug and picks min-price SKU', () => {
    const cheap = makeItem({ baseTotalAmount: 20000000, specCode: 'B1' });
    const expensive = makeItem({ baseTotalAmount: 40000000, specCode: 'B2' });
    const groups = groupByModel([expensive, cheap]);
    expect(groups).toHaveLength(1);
    expect(groups[0].slug).toBe('actyon-hev');
    expect(groups[0].minPriceSku.skuId).toBe('OP5:B1:BK01');
  });

  it('sums duplicateCount into totalCount', () => {
    const a = makeItem({ duplicateCount: 3, specCode: 'C1' });
    const b = makeItem({ duplicateCount: 2, specCode: 'C2' });
    const groups = groupByModel([a, b]);
    expect(groups[0].totalCount).toBe(5);
  });

  it('skips unmappable items and logs a warning', () => {
    const ok = makeItem({ specCode: 'D1' });
    const broken = makeItem({ vehicleModelName: null, modelCode: 'MWS' });
    const groups = groupByModel([ok, broken]);
    expect(groups[0].skus).toHaveLength(1);
    expect(warnSpy).toHaveBeenCalledWith(
      '[inventory-mapper] slug mapping failed',
      expect.objectContaining({ modelCode: 'MWS' })
    );
  });
});

describe('listTrimColors', () => {
  it('groups color codes per trim label', () => {
    const a = mapToVehicleSku(makeItem({ colorCode: 'BK01', specCode: 'E1' }));
    const b = mapToVehicleSku(makeItem({ colorCode: 'WH02', specCode: 'E2' }));
    if (!a || !b) throw new Error('precondition failed');
    const result = listTrimColors([a, b]);
    expect(result).toHaveLength(1);
    expect([...result[0].colorCodes].sort()).toEqual(['BK01', 'WH02']);
  });
});

describe('listUniqueColors', () => {
  it('returns unique colors with first-seen name', () => {
    const a = mapToVehicleSku(makeItem({ colorCode: 'BK01', colorName: 'Black', specCode: 'F1' }));
    const b = mapToVehicleSku(makeItem({ colorCode: 'BK01', colorName: 'Black2', specCode: 'F2' }));
    if (!a || !b) throw new Error('precondition failed');
    const result = listUniqueColors([a, b]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Black');
  });
});

describe('extractTrimLabel', () => {
  it('strips actyon-hev prefix (accepts 액티온/액티언)', () => {
    expect(extractTrimLabel('액티언 하이브리드 하이브리드 S8', 'actyon-hev')).toBe(
      'S8'
    );
    expect(extractTrimLabel('액티온 하이브리드 하이브리드 S8', 'actyon-hev')).toBe(
      'S8'
    );
  });

  it('strips torres prefix', () => {
    expect(extractTrimLabel('토레스 블랙엣지 2WD', '2025-torres')).toBe(
      '블랙엣지 2WD'
    );
  });

  it('falls back to raw modelName when regex yields empty', () => {
    expect(extractTrimLabel('전혀 다른 포맷', '2025-torres')).toBe('전혀 다른 포맷');
  });
});
