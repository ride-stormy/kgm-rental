'use client';

import { useEffect, useState } from 'react';
import { calculateQuote } from '@/lib/api-client';
import { useDebounce } from '@/lib/use-debounce';
import {
  SERVER_ERROR_TO_FIELD,
  type ConfiguratorInput,
} from '@/lib/validators/configurator.schema';
import type { QuoteBreakdown } from '@kgm-rental/api-contracts/rental-quote/calculate-quote.schema.js';

interface UseQuoteCalculatorParams {
  skuId: string | null;
  values: ConfiguratorInput;
  isValid: boolean;
  debounceMs?: number;
}

interface UseQuoteCalculatorResult {
  data: QuoteBreakdown | null;
  isLoading: boolean;
  error: { code: string; field?: keyof ConfiguratorInput } | null;
}

export const useQuoteCalculator = ({
  skuId,
  values,
  isValid,
  debounceMs = 300,
}: UseQuoteCalculatorParams): UseQuoteCalculatorResult => {
  const debouncedValues = useDebounce(values, debounceMs);
  const debouncedSkuId = useDebounce(skuId, debounceMs);
  const [data, setData] = useState<QuoteBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<UseQuoteCalculatorResult['error']>(null);

  useEffect(() => {
    if (!debouncedSkuId || !isValid) {
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    calculateQuote(
      {
        skuId: debouncedSkuId,
        contractPeriod: Number(debouncedValues.contractPeriod),
        annualMileage: Number(debouncedValues.annualMileage),
        prepaidRate: Number(debouncedValues.prepaidRate),
        depositRate: Number(debouncedValues.depositRate),
      },
      { signal: controller.signal },
    )
      .then((res) => {
        if (controller.signal.aborted) return;
        if (res.success && res.data) {
          setData(res.data);
        } else if (res.error) {
          setError(mapServerError(res.error.code));
        }
      })
      .catch((e: unknown) => {
        if ((e as Error).name === 'AbortError') return;
        setError({ code: 'NETWORK_ERROR' });
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [
    debouncedSkuId,
    debouncedValues.contractPeriod,
    debouncedValues.annualMileage,
    debouncedValues.prepaidRate,
    debouncedValues.depositRate,
    isValid,
  ]);

  return { data, isLoading, error };
};

const mapServerError = (
  serverCode: string,
): UseQuoteCalculatorResult['error'] => {
  const mapped = SERVER_ERROR_TO_FIELD[serverCode];
  if (mapped) return { code: mapped.code, field: mapped.field };
  return { code: serverCode };
};
