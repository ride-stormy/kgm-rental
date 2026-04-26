'use client';

import { useQuery } from '@tanstack/react-query';
import { groupByModel } from '@/lib/inventory/inventory-mapper';
import { INVENTORIES_QUERY_KEY } from './inventories-query-key';
import type { InventoriesQueryData } from './inventories-query-key';
import type { InventoryListResponse } from '@kgm-rental/api-contracts/inventory/inventory.schema.js';

const fetchInventories = async (): Promise<InventoriesQueryData> => {
  const res = await fetch('/api/inventories', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`inventories fetch failed: ${res.status}`);
  }
  const body = (await res.json()) as InventoryListResponse;
  return {
    items: groupByModel(body.items),
    totalElements: body.totalElements,
    timestamp: body.timestamp,
    rawResponse: body,
  };
};

export const useInventoriesQuery = () =>
  useQuery<InventoriesQueryData>({
    queryKey: [...INVENTORIES_QUERY_KEY],
    queryFn: fetchInventories,
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: 1,
  });
