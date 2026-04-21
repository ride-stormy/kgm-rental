'use client';

import { useRef } from 'react';
import { LANDING_CONTENT, MODEL_ORDER } from '../../_content/landing';
import type { ModelSlug } from '../../_content/landing';
import { CarItem } from './CarItem';
import { FilterTabs } from './FilterTabs';
import { useScrollFilter } from '@/lib/use-scroll-filter';
import type { CarItemPricing } from '@/lib/vehicle-pricing';

interface ProductsSectionProps {
  pricing: CarItemPricing[];
}

const formatKrw = (amount: number): string => new Intl.NumberFormat('ko-KR').format(amount);

export const ProductsSection = ({ pricing }: ProductsSectionProps) => {
  const { productsHeader } = LANDING_CONTENT;
  const containerRef = useRef<HTMLDivElement>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);

  const availableSlugs = MODEL_ORDER.filter((slug) =>
    pricing.some((p) => p.modelSlug === slug),
  ) as readonly ModelSlug[];

  const { activeSlug, isFilterPinned, scrollToSlug } = useScrollFilter({
    modelSlugs: availableSlugs,
    containerRef,
    filterBarRef,
  });

  const pricingBySlug = new Map(pricing.map((p) => [p.modelSlug, p]));

  return (
    <section className="bg-gray-100">
      <header
        data-node-id="7:7769"
        id="landing-products-top"
        className="flex flex-col items-start gap-2 px-5 pb-5 pt-10"
      >
        <h2 className="w-full text-center text-[22px] font-bold leading-[34px] text-gray-900">
          {productsHeader.titleLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>
        <p className="w-full text-center text-[15px] font-medium leading-[20px] text-gray-600">
          {productsHeader.subtitle}
        </p>
      </header>

      <FilterTabs
        ref={filterBarRef}
        modelSlugs={availableSlugs}
        activeSlug={activeSlug}
        isFilterPinned={isFilterPinned}
        onSelect={scrollToSlug}
      />

      <div className="flex flex-col gap-5 px-5 pb-10 pt-5">
        <div className="flex items-center gap-1 text-[13px] font-medium leading-[18px]">
          <span className="text-gray-900">
            총 {formatKrw(productsHeader.totalCount)}
            {productsHeader.totalLabelSuffix}
          </span>
          <span className="flex-1 text-right text-gray-400">
            {productsHeader.asOfLabel}
          </span>
        </div>
        <div ref={containerRef} className="flex flex-col gap-5">
          {availableSlugs.map((slug) => {
            const item = pricingBySlug.get(slug);
            if (!item) return null;
            return (
              <CarItem
                key={slug}
                modelSlug={slug}
                monthly={item.minMonthlyFromMinSku}
                minSkuId={item.minSkuId}
              />
            );
          })}
          <div id="landing-products-end" aria-hidden className="h-1" />
        </div>
      </div>
    </section>
  );
};
