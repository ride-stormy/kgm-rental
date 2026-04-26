'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { LANDING_CONTENT } from '../../_content/landing';
import { SegmentedPicker } from './_calculator/SegmentedPicker';
import { PercentSlider } from './_calculator/PercentSlider';
import { useInventoriesQuery } from './hooks/useInventoriesQuery';
import { toProductDetailList } from '@/lib/inventory/to-product-detail';
import { useQuoteEstimation } from '@/lib/use-quote-estimation';
import clsx from 'clsx';
import {
  ANNUAL_KM,
  CAR_ITEM_DEFAULTS,
  CONTRACT_MONTHS,
  findMinSku,
} from '@/lib/vehicle-pricing';
import type { QuoteState } from '@/lib/use-quote-estimation';
import type { AnnualKm, ContractMonths, PercentStep } from '@/lib/vehicle-pricing';
import type { ProductDetail } from '@kgm-rental/api-contracts/product/product-detail.schema.js';

const FALLBACK_MESSAGE = '재고 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.';
const DEFAULT_CALCULATOR_MODEL_SLUG = '2025-torres';

const formatKrw = (amount: number): string => new Intl.NumberFormat('ko-KR').format(amount);

const buildInitial = (products: ProductDetail[]): QuoteState | null => {
  const defaultProduct =
    products.find((p) => p.slug === DEFAULT_CALCULATOR_MODEL_SLUG) ?? products[0];
  if (!defaultProduct) return null;
  const minSku = findMinSku(defaultProduct);
  if (!minSku) return null;
  return {
    modelSlug: defaultProduct.slug,
    skuId: minSku.skuId,
    contractMonths: CAR_ITEM_DEFAULTS.contractMonths,
    annualKm: CAR_ITEM_DEFAULTS.annualKm,
    prepaidPercent: CAR_ITEM_DEFAULTS.prepaidPercent,
    subsidyPercent: CAR_ITEM_DEFAULTS.subsidyPercent,
  };
};

interface CalculatorBodyProps {
  products: ProductDetail[];
  initial: QuoteState;
}

const CalculatorBody = ({ products, initial }: CalculatorBodyProps) => {
  const { calculator } = LANDING_CONTENT;
  const router = useRouter();

  const {
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
  } = useQuoteEstimation({ products, initial });

  const handleCtaClick = () => {
    router.push(`/products/${state.modelSlug}`);
  };

  return (
    <div className="relative flex w-full flex-col items-center gap-5 overflow-clip bg-white pb-5 pt-10">
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-[-111px] h-[222px] w-[222px] rounded-full"
        style={{
          background:
            'radial-gradient(50% 50% at 50% 50%, rgba(138, 122, 255, 0.22) 0%, rgba(138, 122, 255, 0) 72%)',
        }}
      />

      <div className="flex w-full flex-col items-center gap-1">
        <p className="w-full text-center text-[14px] font-semibold leading-[18px] text-gray-600">
          {calculator.title}
        </p>
        <div className="flex w-full items-baseline justify-center gap-0.5">
          <span className="text-[28px] font-bold leading-[40px] text-gray-900">
            {formatKrw(monthly)}
          </span>
          <span className="flex items-center text-[13px] font-medium leading-[18px] text-gray-600">
            <span>원</span>
            <span>/</span>
            <span>월</span>
          </span>
        </div>
      </div>

      <label className="flex w-full flex-col items-start gap-2">
        <span className="text-[13px] font-semibold leading-[18px] text-gray-600">
          {calculator.modelLabel}
        </span>
        <div className="relative flex min-h-[48px] w-full items-center gap-2 rounded-[12px] bg-gray-100 py-3 pl-4 pr-[14px]">
          <select
            value={state.modelSlug}
            onChange={(e) => setModel(e.target.value)}
            className="flex-1 appearance-none bg-transparent text-[16px] font-normal leading-[24px] text-gray-900 focus:outline-none"
            aria-label={calculator.modelLabel}
          >
            {modelOptions.map((option) => (
              <option key={option.modelSlug} value={option.modelSlug}>
                {option.name}
              </option>
            ))}
          </select>
          <ChevronDown size={24} strokeWidth={2} className="text-gray-900" />
        </div>
      </label>

      <div className="flex w-full flex-col items-start gap-2">
        <label className="flex w-full flex-col items-start gap-2">
          <span className="text-[13px] font-semibold leading-[18px] text-gray-600">
            {calculator.trimLabel}
          </span>
          <div className="relative flex min-h-[48px] w-full items-center gap-2 rounded-[12px] bg-gray-100 py-3 pl-4 pr-[14px]">
            <select
              value={state.skuId}
              onChange={(e) => setSku(e.target.value)}
              className="flex-1 appearance-none bg-transparent text-[16px] font-normal leading-[24px] text-gray-900 focus:outline-none"
              aria-label={calculator.trimLabel}
            >
              {trimOptionsForCurrentModel.map((option) => (
                <option key={option.skuId} value={option.skuId}>
                  {option.trimName}
                </option>
              ))}
            </select>
            <ChevronDown size={24} strokeWidth={2} className="text-gray-900" />
          </div>
        </label>
        <p className="w-full text-[11px] font-medium leading-[16px] text-gray-400">
          {calculator.vehiclePriceLabel} {formatKrw(vehiclePrice)}원
        </p>
      </div>

      <div className="flex w-full flex-col items-start gap-2">
        <span className="text-[13px] font-semibold leading-[18px] text-gray-600">
          {calculator.contractLabel}
        </span>
        <SegmentedPicker
          options={CONTRACT_MONTHS}
          value={state.contractMonths}
          onChange={(v) => setContractMonths(v as ContractMonths)}
          formatLabel={(v) => `${v}${calculator.contractUnit}`}
          ariaLabel={calculator.contractLabel}
        />
      </div>

      <div className="flex w-full flex-col items-start gap-2">
        <span className="text-[13px] font-semibold leading-[18px] text-gray-600">
          {calculator.annualKmLabel}
        </span>
        <div
          role="radiogroup"
          aria-label={calculator.annualKmLabel}
          className="flex w-full gap-2 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {ANNUAL_KM.map((km) => {
            const n = km / 10000;
            const label = `${Number.isInteger(n) ? n : n.toFixed(1)}만${calculator.annualKmUnit}`;
            const isSelected = state.annualKm === km;
            return (
              <button
                key={km}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setAnnualKm(km as AnnualKm)}
                className={clsx(
                  'shrink-0 rounded-lg border px-4 py-2 text-[13px] font-medium leading-[18px] transition-colors',
                  isSelected
                    ? 'border-gray-900 bg-white font-semibold text-gray-900'
                    : 'border-gray-200 bg-white text-gray-600',
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <PercentSlider
        id="prepaid-slider"
        label={calculator.prepaidLabel}
        value={state.prepaidPercent}
        max={calculator.percentMax as PercentStep}
        vehiclePrice={vehiclePrice}
        onChange={setPrepaidPercent}
      />

      <PercentSlider
        id="subsidy-slider"
        label={calculator.subsidyLabel}
        value={state.subsidyPercent}
        max={calculator.percentMax as PercentStep}
        vehiclePrice={vehiclePrice}
        onChange={setSubsidyPercent}
      />

      <button
        type="button"
        onClick={handleCtaClick}
        className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-xl bg-kgm-purple-600 px-6 text-[15px] font-medium text-white transition-opacity hover:opacity-90"
      >
        {calculator.cta}
      </button>
    </div>
  );
};

export const CalculatorSection = () => {
  const { calculator } = LANDING_CONTENT;
  const { data, isError } = useInventoriesQuery();

  const products = useMemo(
    () => (data?.items ? toProductDetailList(data.items) : []),
    [data?.items],
  );
  const initial = useMemo(() => buildInitial(products), [products]);

  const isEmpty = isError || products.length === 0 || initial === null;

  if (isEmpty) {
    return (
      <section
        id="calculator"
        data-node-id="8:1862"
        className="scroll-mt-20 bg-white px-5 pb-10 pt-10"
      >
        <p className="text-center text-[14px] text-gray-600">{FALLBACK_MESSAGE}</p>
      </section>
    );
  }

  return (
    <section
      id="calculator"
      data-node-id="8:1862"
      className="scroll-mt-20 bg-white px-5 pb-5 pt-10"
    >
      <div className="flex w-full flex-col items-start gap-3">
        <h2 className="w-full text-center text-[22px] font-bold leading-[34px] text-gray-900">
          <span className="block">월 납입금</span>
          <span className="block">직접 계산해 보세요</span>
        </h2>
        <p className="w-full text-center text-[15px] font-medium leading-[20px] text-gray-600">
          {calculator.subtitle}
        </p>
        <CalculatorBody products={products} initial={initial} />
      </div>
    </section>
  );
};
