import type { InventoryItem } from '@kgm-rental/api-contracts/inventory/inventory.schema.js';

export const MODEL_SLUGS = ['actyon-hev', '2025-torres'] as const;

export type ModelSlug = (typeof MODEL_SLUGS)[number];

export const resolveModelSlug = (
  item: Pick<InventoryItem, 'vehicleModelName' | 'modelName' | 'modelCode'>
): ModelSlug | undefined => {
  if (item.vehicleModelName == null) return undefined;

  switch (item.vehicleModelName) {
    case '액티언 하이브리드':
      return 'actyon-hev';
    case '더 뉴 토레스':
      return '2025-torres';
    default:
      return undefined;
  }
};
