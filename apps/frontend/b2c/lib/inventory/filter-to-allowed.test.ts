import { describe, expect, it } from 'vitest';
import { filterToAllowedModels } from './filter-to-allowed';
import type { InventoryItem } from '@kgm-rental/api-contracts/inventory/inventory.schema.js';

const makeItem = (overrides: Partial<InventoryItem> = {}): InventoryItem => ({
  modelName: '액티언 하이브리드 S8',
  modelCode: 'OP5',
  specCode: 'A1',
  colorName: 'Space Black',
  colorCode: 'BK01',
  baseTotalAmount: 30000000,
  optionTotalAmount: 0,
  baseCustomizingDetail: [],
  optionCustomizingDetail: [],
  vehicleModelName: '액티언 하이브리드',
  duplicateCount: 1,
  makeDates: ['26.03'],
  ...overrides,
});

describe('filterToAllowedModels', () => {
  it('keeps only allowed vehicleModelName entries', () => {
    const items: InventoryItem[] = [
      makeItem({ vehicleModelName: '액티언 하이브리드', modelCode: 'OP5' }),
      makeItem({ vehicleModelName: '더 뉴 토레스', modelCode: 'MW5' }),
      makeItem({ vehicleModelName: '더 뉴 티볼리', modelCode: 'XW5' }),
      makeItem({ vehicleModelName: '무쏘', modelCode: 'UH5' }),
      makeItem({ vehicleModelName: '무쏘 EV', modelCode: 'MD5' }),
    ];
    const result = filterToAllowedModels(items);
    expect(result.kept).toHaveLength(2);
    expect(result.droppedCount).toBe(3);
  });

  it('drops items with null vehicleModelName and records "(null)" in droppedModels', () => {
    const items: InventoryItem[] = [
      makeItem({ vehicleModelName: null }),
      makeItem({ vehicleModelName: '액티언 하이브리드' }),
    ];
    const result = filterToAllowedModels(items);
    expect(result.kept).toHaveLength(1);
    expect(result.droppedCount).toBe(1);
    expect(result.droppedModels).toContain('(null)');
  });

  it('deduplicates droppedModels labels', () => {
    const items: InventoryItem[] = [
      makeItem({ vehicleModelName: '무쏘', modelCode: 'UH5' }),
      makeItem({ vehicleModelName: '무쏘', modelCode: 'UH5' }),
      makeItem({ vehicleModelName: '더 뉴 티볼리', modelCode: 'XW5' }),
    ];
    const result = filterToAllowedModels(items);
    expect(result.droppedCount).toBe(3);
    expect(result.droppedModels).toHaveLength(2);
    expect([...result.droppedModels].sort()).toEqual(['더 뉴 티볼리', '무쏘']);
  });

  it('does not mutate the input array', () => {
    const input: InventoryItem[] = [
      makeItem({ vehicleModelName: '무쏘', modelCode: 'UH5' }),
      makeItem({ vehicleModelName: '액티언 하이브리드' }),
    ];
    const snapshot = [...input];
    filterToAllowedModels(input);
    expect(input).toEqual(snapshot);
  });

  it('returns empty kept when no allowed items', () => {
    const items: InventoryItem[] = [
      makeItem({ vehicleModelName: '무쏘 EV', modelCode: 'MD5' }),
    ];
    const result = filterToAllowedModels(items);
    expect(result.kept).toHaveLength(0);
    expect(result.droppedCount).toBe(1);
  });

  it('caps droppedModels samples to 10 distinct labels', () => {
    const items: InventoryItem[] = Array.from({ length: 12 }, (_, i) =>
      makeItem({
        vehicleModelName: `미지원모델${i}`,
        modelCode: 'ZZ9',
      })
    );
    const result = filterToAllowedModels(items);
    expect(result.droppedCount).toBe(12);
    expect(result.droppedModels).toHaveLength(10);
  });
});
