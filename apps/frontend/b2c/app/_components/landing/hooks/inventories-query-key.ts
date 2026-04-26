import type { GroupedInventory } from '@/lib/inventory/inventory-mapper';
import type { InventoryListResponse } from '@kgm-rental/api-contracts/inventory/inventory.schema.js';

export const INVENTORIES_QUERY_KEY = ['inventories'] as const;

export interface InventoriesQueryData {
  items: GroupedInventory[];
  totalElements: number;
  timestamp: string;
  rawResponse: InventoryListResponse;
}
