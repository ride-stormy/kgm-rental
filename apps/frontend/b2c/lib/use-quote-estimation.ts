'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from '@/lib/use-debounce';
import { calculateQuote } from '@/lib/api-client';
import {
  findMinSku,
  groupSkusByTrim,
  PERCENT_STEPS,
} from '@/lib/vehicle-pricing';
import type {
  AnnualKm,
  ContractMonths,
  PercentStep,
} from '@/lib/vehicle-pricing';
import type { ProductDetail } from '@kgm-rental/api-contracts/product/product-detail.schema.js';

export const PREFILL_EVENT = 'landing:prefill-calculator' as const;

export interface PrefillDetail {
  modelSlug: string;
  skuId: string;
}

export interface QuoteState {
  modelSlug: string;
  skuId: string;
  contractMonths: ContractMonths;
  annualKm: AnnualKm;
  prepaidPercent: PercentStep;
  subsidyPercent: PercentStep;
}

export interface TrimOption {
  skuId: string;
  trimName: string;
  price: number;
}

export interface UseQuoteEstimationProps {
  products: ProductDetail[];
  initial: QuoteState;
}

export interface UseQuoteEstimationResult {
  state: QuoteState;
  monthly: number;
  vehiclePrice: number;
  modelOptions: { modelSlug: string; name: string }[];
  trimOptionsForCurrentModel: TrimOption[];
  setModel: (modelSlug: string) => void;
  setSku: (skuId: string) => void;
  setContractMonths: (months: ContractMonths) => void;
  setAnnualKm: (km: AnnualKm) => void;
  setPrepaidPercent: (percent: PercentStep) => void;
  setSubsidyPercent: (percent: PercentStep) => void;
}

const clampPair = (
  prepaid: PercentStep,
  subsidy: PercentStep,
): { prepaid: PercentStep; subsidy: PercentStep } => {
  if (prepaid + subsidy <= 50) return { prepaid, subsidy };
  const allowedSubsidy = Math.max(0, 50 - prepaid);
  const snapped = PERCENT_STEPS.find((step) => step === allowedSubsidy) ?? 0;
  return { prepaid, subsidy: snapped };
};

export const useQuoteEstimation = ({
  products,
  initial,
}: UseQuoteEstimationProps): UseQuoteEstimationResult => {
  const [state, setState] = useState<QuoteState>(initial);

  const currentProduct = useMemo(
    () => products.find((p) => p.slug === state.modelSlug),
    [products, state.modelSlug],
  );

  const currentSku = useMemo(
    () => currentProduct?.skus.find((s) => s.id === state.skuId),
    [currentProduct, state.skuId],
  );

  const vehiclePrice = currentSku?.price ?? 0;
  const abortRef = useRef<AbortController | null>(null);

  const modelOptions = useMemo(
    () => products.map((p) => ({ modelSlug: p.slug, name: p.name })),
    [products],
  );

  // 같은 trim 이름은 하나로 dedupe하고 해당 trim의 최저가 SKU를 대표로 노출
  const trimOptionsForCurrentModel = useMemo((): TrimOption[] => {
    if (!currentProduct) return [];
    return groupSkusByTrim(currentProduct).map((group) => ({
      skuId: group.skuId,
      trimName: group.trimName,
      price: group.minPrice,
    }));
  }, [currentProduct]);

  const setModel = useCallback(
    (modelSlug: string) => {
      const product = products.find((p) => p.slug === modelSlug);
      if (!product) return;
      const minSku = findMinSku(product);
      if (!minSku) return;
      setState((prev) => ({ ...prev, modelSlug, skuId: minSku.skuId }));
    },
    [products],
  );

  const setSku = useCallback((skuId: string) => {
    setState((prev) => ({ ...prev, skuId }));
  }, []);

  const setContractMonths = useCallback((months: ContractMonths) => {
    setState((prev) => ({ ...prev, contractMonths: months }));
  }, []);

  const setAnnualKm = useCallback((km: AnnualKm) => {
    setState((prev) => ({ ...prev, annualKm: km }));
  }, []);

  const setPrepaidPercent = useCallback((percent: PercentStep) => {
    setState((prev) => {
      const clamped = clampPair(percent, prev.subsidyPercent);
      return { ...prev, prepaidPercent: clamped.prepaid, subsidyPercent: clamped.subsidy };
    });
  }, []);

  const setSubsidyPercent = useCallback((percent: PercentStep) => {
    setState((prev) => {
      const clamped = clampPair(prev.prepaidPercent, percent);
      return { ...prev, prepaidPercent: clamped.prepaid, subsidyPercent: clamped.subsidy };
    });
  }, []);

  useEffect(() => {
    const onPrefill = (event: Event) => {
      const custom = event as CustomEvent<PrefillDetail>;
      const detail = custom.detail;
      if (!detail) return;
      const product = products.find((p) => p.slug === detail.modelSlug);
      if (!product) return;
      const matchedSku = product.skus.find((s) => s.id === detail.skuId);
      const nextSkuId = matchedSku?.id ?? findMinSku(product)?.skuId;
      if (!nextSkuId) return;
      setState((prev) => ({ ...prev, modelSlug: detail.modelSlug, skuId: nextSkuId }));
    };
    window.addEventListener(PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(PREFILL_EVENT, onPrefill);
  }, [products]);

  const debouncedState = useDebounce(state, 300);

  const [monthly, setMonthly] = useState(0);

  useEffect(() => {
    if (!debouncedState.skuId || vehiclePrice <= 0) return;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    calculateQuote(
      {
        skuId: debouncedState.skuId,
        contractPeriod: debouncedState.contractMonths,
        annualMileage: debouncedState.annualKm,
        prepaidRate: debouncedState.prepaidPercent,
        depositRate: debouncedState.subsidyPercent,
      },
      { signal: ctrl.signal },
    )
      .then((res) => {
        if (ctrl.signal.aborted) return;
        if (res.success && res.data) setMonthly(res.data.finalMonthlyRent);
      })
      .catch((err: unknown) => {
        if ((err as Error).name !== 'AbortError') setMonthly(0);
      });

    return () => ctrl.abort();
  }, [debouncedState, vehiclePrice]);

  return {
    state,
    monthly,
    vehiclePrice,
    modelOptions,
    trimOptionsForCurrentModel,
    setModel,
    setSku,
    setContractMonths,
    setAnnualKm,
    setPrepaidPercent,
    setSubsidyPercent,
  };
};
