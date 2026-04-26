import { resolveModelSlug } from './slug-mapper';
import type { InventoryItem } from '@kgm-rental/api-contracts/inventory/inventory.schema.js';

export interface FilterResult {
  kept: InventoryItem[];
  droppedCount: number;
  droppedModels: readonly string[];
}

const MAX_DROPPED_MODEL_SAMPLES = 10;

export const filterToAllowedModels = (items: InventoryItem[]): FilterResult => {
  const kept: InventoryItem[] = [];
  const droppedModelSet = new Set<string>();
  let droppedCount = 0;

  for (const item of items) {
    const slug = resolveModelSlug(item);
    if (slug === undefined) {
      droppedCount += 1;
      const label = item.vehicleModelName ?? '(null)';
      if (droppedModelSet.size < MAX_DROPPED_MODEL_SAMPLES) {
        droppedModelSet.add(label);
      }
      continue;
    }
    kept.push(item);
  }

  return {
    kept,
    droppedCount,
    droppedModels: [...droppedModelSet],
  };
};
