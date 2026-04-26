'use client';

import { useMemo } from 'react';
import { LANDING_CONTENT, MODEL_ORDER } from '../../_content/landing';
import { CarItem } from './CarItem';
import { useInventoriesQuery } from './hooks/useInventoriesQuery';
import { useMinPriceMonthlyQuery } from './hooks/useMinPriceMonthlyQuery';
import type { ModelSlug } from '../../_content/landing';
import type { MinPriceMonthlyInput } from './hooks/useMinPriceMonthlyQuery';

const FALLBACK_MESSAGE = '재고 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.';

export const ProductsSection = () => {
  const { productsHeader } = LANDING_CONTENT;
  const { data, isError } = useInventoriesQuery();

  const items = data?.items ?? [];
  const isEmpty = isError || items.length === 0;

  const availableSlugs = MODEL_ORDER.filter((slug) =>
    items.some((g) => g.slug === slug),
  ) as readonly ModelSlug[];

  const bySlug = new Map(items.map((g) => [g.slug, g]));

  const minPriceInputs = useMemo<MinPriceMonthlyInput[]>(
    () =>
      availableSlugs
        .map((slug) => bySlug.get(slug))
        .filter((g): g is NonNullable<typeof g> => g !== undefined)
        .map((g) => ({ slug: g.slug, minSku: g.minPriceSku })),
    [availableSlugs, bySlug],
  );
  const { monthlyBySlug } = useMinPriceMonthlyQuery(minPriceInputs);

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

      {isEmpty ? (
        <div className="px-5 py-10 text-center text-[14px] text-gray-600">
          {FALLBACK_MESSAGE}
        </div>
      ) : (
        <div className="flex flex-col gap-5 px-5 pb-10 pt-5">
          {availableSlugs.map((slug) => {
            const group = bySlug.get(slug);
            if (!group) return null;
            return (
              <CarItem
                key={slug}
                modelSlug={slug}
                monthly={monthlyBySlug[slug] ?? 0}
                minSkuId={group.minPriceSku.skuId}
              />
            );
          })}
          <div id="landing-products-end" aria-hidden className="h-1" />
        </div>
      )}
    </section>
  );
};
