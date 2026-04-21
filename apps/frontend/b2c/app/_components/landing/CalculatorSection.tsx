'use client';

import { ChevronDown } from 'lucide-react';
import { LANDING_CONTENT } from '../../_content/landing';
import { SegmentedPicker } from './_calculator/SegmentedPicker';
import { PercentSlider } from './_calculator/PercentSlider';
import { useQuoteEstimation } from '@/lib/use-quote-estimation';
import type { QuoteState } from '@/lib/use-quote-estimation';
import { ANNUAL_KM, CONTRACT_MONTHS } from '@/lib/vehicle-pricing';
import type { AnnualKm, ContractMonths, PercentStep } from '@/lib/vehicle-pricing';
import type { ProductDetail } from '@kgm-rental/api-contracts/product/product-detail.schema.js';

interface CalculatorSectionProps {
  products: ProductDetail[];
  initial: QuoteState;
}

const formatKrw = (amount: number): string => new Intl.NumberFormat('ko-KR').format(amount);

export const CalculatorSection = ({ products, initial }: CalculatorSectionProps) => {
  const { calculator } = LANDING_CONTENT;
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
    if (typeof window !== 'undefined') {
      window.console.debug('calculator-cta');
    }
  };

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
            <SegmentedPicker
              options={ANNUAL_KM}
              value={state.annualKm}
              onChange={(v) => setAnnualKm(v as AnnualKm)}
              formatLabel={(v) => `${(v / 10000).toFixed(0)}만${calculator.annualKmUnit}`}
              ariaLabel={calculator.annualKmLabel}
            />
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
      </div>
    </section>
  );
};
