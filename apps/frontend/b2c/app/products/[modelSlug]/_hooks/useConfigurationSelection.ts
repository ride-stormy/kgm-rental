'use client';

import { useMemo } from 'react';
import { useConfigurationContext } from '../_context/ConfigurationContext';
import type { InventorySku } from '@/lib/inventory/inventory-mapper';

interface UseConfigurationSelectionResult {
  trimLabel: string;
  colorCode: string;
  selectedSku: InventorySku;
  skuPool: readonly InventorySku[];
}

export const useConfigurationSelection = (): UseConfigurationSelectionResult => {
  const { state, skus } = useConfigurationContext();

  const skuPool = useMemo(() => {
    const trimPool = skus.filter((s) => s.trimLabel === state.trimLabel);
    const pool = trimPool.length > 0 ? trimPool : skus;
    const selectedColorName = skus.find((s) => s.colorCode === state.colorCode)?.colorName;
    const colorPool = selectedColorName
      ? pool.filter((s) => s.colorName === selectedColorName)
      : pool.filter((s) => s.colorCode === state.colorCode);
    return colorPool.length > 0 ? colorPool : pool;
  }, [skus, state.trimLabel, state.colorCode]);

  const selectedSku = useMemo(() => {
    if (state.skuId) {
      const found = skuPool.find((s) => s.skuId === state.skuId);
      if (found) return found;
    }
    return skuPool.reduce((cheapest, s) => (s.price < cheapest.price ? s : cheapest));
  }, [skuPool, state.skuId]);

  return {
    trimLabel: state.trimLabel,
    colorCode: state.colorCode,
    selectedSku,
    skuPool,
  };
};
