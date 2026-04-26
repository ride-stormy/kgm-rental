'use client';

import { useQuery } from '@tanstack/react-query';
import { calculateQuote } from '@/lib/api-client';
import type { InventorySku, ModelSlug } from '@/lib/inventory/inventory-mapper';

export interface MinPriceMonthlyInput {
  slug: ModelSlug;
  minSku: InventorySku;
}

interface UseMinPriceMonthlyQueryResult {
  monthlyBySlug: Record<string, number>;
  isLoading: boolean;
}

const DEFAULT_CONTRACT_PERIOD = 60;
const DEFAULT_ANNUAL_MILEAGE = 20000;
const DEFAULT_PREPAID_RATE = 10;
const DEFAULT_DEPOSIT_RATE = 10;
const STALE_MS = 5 * 60 * 1000;

export const useMinPriceMonthlyQuery = (
  inputs: readonly MinPriceMonthlyInput[],
): UseMinPriceMonthlyQueryResult => {
  const queryKey = [
    'landing-min-price-monthly',
    inputs.map((i) => i.minSku.skuId).join(','),
  ];

  const { data, isLoading } = useQuery<Record<string, number>>({
    queryKey,
    enabled: inputs.length > 0,
    staleTime: STALE_MS,
    queryFn: async () => {
      const entries = await Promise.all(
        inputs.map(async (input): Promise<[string, number]> => {
          if (input.minSku.priceError || input.minSku.price <= 0) {
            return [input.slug, 0];
          }
          const res = await calculateQuote({
            skuId: input.minSku.skuId,
            contractPeriod: DEFAULT_CONTRACT_PERIOD,
            annualMileage: DEFAULT_ANNUAL_MILEAGE,
            prepaidRate: DEFAULT_PREPAID_RATE,
            depositRate: DEFAULT_DEPOSIT_RATE,
          });
          if (res.success && res.data) return [input.slug, res.data.finalMonthlyRent];
          return [input.slug, 0];
        }),
      );
      return Object.fromEntries(entries);
    },
  });

  return { monthlyBySlug: data ?? {}, isLoading };
};
