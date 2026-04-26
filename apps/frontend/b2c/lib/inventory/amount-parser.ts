import type { InventoryItem } from '@kgm-rental/api-contracts/inventory/inventory.schema.js';

export interface ParseAmountResult {
  value: number;
  ok: boolean;
}

export interface VehiclePriceResult {
  price: number;
  priceError: boolean;
}

export const parseAmount = (input: unknown): ParseAmountResult => {
  if (typeof input === 'number' && Number.isFinite(input) && input >= 0) {
    return { value: input, ok: true };
  }
  if (typeof input !== 'string' || input.trim() === '') {
    return { value: 0, ok: false };
  }
  const cleaned = input.replace(/,/g, '').trim();
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return { value: 0, ok: false };
  return { value: n, ok: true };
};

export const computeVehiclePrice = (item: InventoryItem): VehiclePriceResult => {
  const base = parseAmount(item.baseTotalAmount);
  const option = parseAmount(item.optionTotalAmount);
  const baseCustom = sumCustomizing(item.baseCustomizingDetail);
  const optionCustom = sumCustomizing(item.optionCustomizingDetail);

  const isOk = base.ok && option.ok && baseCustom.ok && optionCustom.ok;
  const price = isOk
    ? base.value + option.value + baseCustom.value + optionCustom.value
    : 0;
  return { price, priceError: !isOk };
};

const sumCustomizing = (
  details: InventoryItem['baseCustomizingDetail']
): ParseAmountResult =>
  details.reduce<ParseAmountResult>(
    (acc, cur) => {
      const r = parseAmount(cur.amount);
      return { value: acc.value + r.value, ok: acc.ok && r.ok };
    },
    { value: 0, ok: true }
  );
