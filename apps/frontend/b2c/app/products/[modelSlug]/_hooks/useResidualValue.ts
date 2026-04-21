'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchResidualValue } from '@/lib/api-client';

interface UseResidualValueParams {
  skuId: string | null;
  contractPeriod: number;
  annualMileage: number;
}

interface UseResidualValueResult {
  value: number | null;
  isLoading: boolean;
  error: string | null;
}

export const useResidualValue = ({
  skuId,
  contractPeriod,
  annualMileage,
}: UseResidualValueParams): UseResidualValueResult => {
  const [value, setValue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!skuId) {
      setValue(null);
      setError(null);
      return;
    }

    const key = `${skuId}:${contractPeriod}:${annualMileage}`;
    const cached = cacheRef.current.get(key);
    if (cached !== undefined) {
      setValue(cached);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetchResidualValue(
      { skuId, contractPeriod, annualMileage },
      { signal: controller.signal },
    )
      .then((res) => {
        if (controller.signal.aborted) return;
        if (res.success && res.data) {
          cacheRef.current.set(key, res.data.residualValue);
          setValue(res.data.residualValue);
        } else if (res.error) {
          setError(res.error.code);
        }
      })
      .catch((e: unknown) => {
        if ((e as Error).name === 'AbortError') return;
        setError('NETWORK_ERROR');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [skuId, contractPeriod, annualMileage]);

  return { value, isLoading, error };
};
