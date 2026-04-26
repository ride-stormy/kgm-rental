import { describe, expect, it } from 'vitest';
import { computeVehiclePrice, parseAmount } from './amount-parser';
import type { InventoryItem } from '@kgm-rental/api-contracts/inventory/inventory.schema.js';

describe('parseAmount', () => {
  it('accepts non-negative finite numbers', () => {
    expect(parseAmount(40000000)).toEqual({ value: 40000000, ok: true });
    expect(parseAmount(0)).toEqual({ value: 0, ok: true });
  });

  it('parses numeric strings', () => {
    expect(parseAmount('40000000')).toEqual({ value: 40000000, ok: true });
  });

  it('parses comma-delimited strings', () => {
    expect(parseAmount('40,000,000')).toEqual({ value: 40000000, ok: true });
  });

  it('rejects empty / nullish / non-numeric / negative input', () => {
    expect(parseAmount('')).toEqual({ value: 0, ok: false });
    expect(parseAmount(null)).toEqual({ value: 0, ok: false });
    expect(parseAmount(undefined)).toEqual({ value: 0, ok: false });
    expect(parseAmount('미정')).toEqual({ value: 0, ok: false });
    expect(parseAmount(-1)).toEqual({ value: 0, ok: false });
    expect(parseAmount(Number.NaN)).toEqual({ value: 0, ok: false });
    expect(parseAmount(Number.POSITIVE_INFINITY)).toEqual({
      value: 0,
      ok: false,
    });
  });
});

describe('computeVehiclePrice', () => {
  const baseItem: InventoryItem = {
    modelName: 'test',
    modelCode: 'UH5',
    specCode: 'A',
    colorName: 'black',
    colorCode: 'BK',
    baseTotalAmount: 30000000,
    optionTotalAmount: 1500000,
    baseCustomizingDetail: [{ name: '기본', amount: 500000 }],
    optionCustomizingDetail: [{ name: '옵션A', amount: 200000 }],
    vehicleModelName: '무쏘',
    duplicateCount: 1,
    makeDates: ['26.03'],
  };

  it('sums base + option + customizings when all valid', () => {
    expect(computeVehiclePrice(baseItem)).toEqual({
      price: 30000000 + 1500000 + 500000 + 200000,
      priceError: false,
    });
  });

  it('returns priceError when a customizing amount is invalid', () => {
    const broken: InventoryItem = {
      ...baseItem,
      baseCustomizingDetail: [{ name: '오류', amount: -1 as unknown as number }],
    };
    expect(computeVehiclePrice(broken)).toEqual({ price: 0, priceError: true });
  });

  it('handles zero-option totals (observed in 45/201 records)', () => {
    const zero: InventoryItem = {
      ...baseItem,
      optionTotalAmount: 0,
      optionCustomizingDetail: [],
    };
    expect(computeVehiclePrice(zero)).toEqual({
      price: 30000000 + 500000,
      priceError: false,
    });
  });
});
