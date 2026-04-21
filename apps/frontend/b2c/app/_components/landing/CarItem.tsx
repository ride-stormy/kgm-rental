'use client';

import Image from 'next/image';
import { Fragment } from 'react';
import { LANDING_CONTENT, MODEL_DISPLAY } from '../../_content/landing';
import type { ModelSlug } from '../../_content/landing';
import { PREFILL_EVENT } from '@/lib/use-quote-estimation';
import type { PrefillDetail } from '@/lib/use-quote-estimation';

interface CarItemProps {
  modelSlug: ModelSlug;
  monthly: number;
  minSkuId: string;
}

const formatKrw = (amount: number): string => new Intl.NumberFormat('ko-KR').format(amount);

export const CarItem = ({ modelSlug, monthly, minSkuId }: CarItemProps) => {
  const display = MODEL_DISPLAY[modelSlug];
  const { carItem } = LANDING_CONTENT;

  const handleQuoteClick = () => {
    const detail: PrefillDetail = { modelSlug, skuId: minSkuId };
    window.dispatchEvent(new CustomEvent<PrefillDetail>(PREFILL_EVENT, { detail }));
    window.location.hash = 'calculator';
  };

  return (
    <article
      id={modelSlug}
      data-model-slug={modelSlug}
      data-node-id="7:7795"
      className="scroll-mt-24 overflow-clip rounded-[20px] bg-white shadow-kgm-4dp"
    >
      <div className="flex w-full flex-col gap-2 bg-white pl-5 pt-5 shadow-kgm-4dp">
        <div className="w-full pr-5">
          <div className="flex w-full items-center gap-1">
            <p className="text-[16px] font-semibold leading-[24px] text-gray-900">
              {display.name}
            </p>
            <p className="flex-1 text-right text-[13px] font-medium leading-[18px] text-gray-600">
              {display.badge}
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-0.5">
          <div className="flex w-full items-center gap-1">
            <span className="text-[20px] font-bold leading-[30px] text-kgm-purple-600">
              {formatKrw(monthly)}원
            </span>
            <span className="text-[20px] font-semibold leading-[30px] text-gray-600">
              {carItem.priceSuffix}
            </span>
          </div>
          <div className="flex w-full items-center gap-1">
            {carItem.conditionParts.map((part, index) => (
              <Fragment key={part}>
                {index > 0 ? (
                  <span
                    aria-hidden
                    className="inline-block h-[3px] w-[3px] shrink-0 rounded-full bg-gray-400"
                  />
                ) : null}
                <span className="whitespace-nowrap text-[11px] font-medium leading-[16px] text-gray-400">
                  {part}
                </span>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="relative h-[120px] w-full overflow-clip bg-white">
        <div className="absolute right-[-16px] top-[-30px] h-[180px] w-[180px]">
          <Image
            src={display.thumbnail}
            alt={display.name}
            fill
            sizes="180px"
            className="object-contain"
          />
        </div>
        <button
          type="button"
          onClick={handleQuoteClick}
          className="absolute bottom-5 left-5 inline-flex items-center gap-1 rounded-[12px] bg-white/40 p-2 backdrop-blur-[2px]"
        >
          <span className="text-[14px] font-semibold leading-[18px] text-gray-900">
            {carItem.cta}
          </span>
          <Image
            src="/images/landing/leftarrow.svg"
            alt=""
            width={16}
            height={16}
            aria-hidden
          />
        </button>
      </div>
    </article>
  );
};
