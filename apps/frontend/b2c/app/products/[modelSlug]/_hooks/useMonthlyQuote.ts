'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useDebounce } from '@/lib/use-debounce';
import { calculateQuote } from '@/lib/api-client';
import { useConfigurationSelection } from './useConfigurationSelection';
import type { CalculatorSchema } from '../_components/CalculatorInputs/schema';

interface UseMonthlyQuoteResult {
  monthly: number;
  isPriceError: boolean;
  isLoading: boolean;
}

export const useMonthlyQuote = (): UseMonthlyQuoteResult => {
  const { control } = useFormContext<CalculatorSchema>();
  const watched = useWatch({ control }) as Partial<CalculatorSchema>;
  const debounced = useDebounce(watched, 300);
  const { selectedSku } = useConfigurationSelection();

  const [monthly, setMonthly] = useState(0);
  const [isPriceError, setIsPriceError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (selectedSku.priceError) {
      setIsPriceError(true);
      setIsLoading(false);
      return;
    }
    if (
      debounced.contractMonths === undefined ||
      debounced.annualKm === undefined ||
      debounced.prepaidPercent === undefined ||
      debounced.subsidyPercent === undefined
    ) {
      return;
    }

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setIsLoading(true);

    calculateQuote(
      {
        skuId: selectedSku.skuId,
        contractPeriod: debounced.contractMonths,
        annualMileage: debounced.annualKm,
        prepaidRate: debounced.prepaidPercent,
        depositRate: debounced.subsidyPercent,
      },
      { signal: ctrl.signal },
    )
      .then((res) => {
        if (ctrl.signal.aborted) return;
        if (res.success && res.data) {
          setMonthly(res.data.finalMonthlyRent);
          setIsPriceError(false);
        } else {
          setIsPriceError(true);
        }
      })
      .catch((err: unknown) => {
        if ((err as Error).name === 'AbortError') return;
        setIsPriceError(true);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setIsLoading(false);
      });

    return () => {
      ctrl.abort();
    };
  }, [
    selectedSku.skuId,
    selectedSku.priceError,
    debounced.contractMonths,
    debounced.annualKm,
    debounced.prepaidPercent,
    debounced.subsidyPercent,
  ]);

  return { monthly, isPriceError, isLoading };
};
