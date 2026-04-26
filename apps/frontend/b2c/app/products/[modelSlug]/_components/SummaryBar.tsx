'use client';

import Image from 'next/image';
import { useMonthlyQuote } from '../_hooks/useMonthlyQuote';
import { useConfigurationContext } from '../_context/ConfigurationContext';
import { useConfigurationSelection } from '../_hooks/useConfigurationSelection';

const formatNumber = (value: number): string => value.toLocaleString('ko-KR');

export const SummaryBar = () => {
  const { monthly, isPriceError } = useMonthlyQuote();
  const { thumbnail } = useConfigurationContext();
  const { selectedSku } = useConfigurationSelection();

  return (
    <section
      aria-label="예상 월 납입금"
      className="sticky top-0 z-30 flex w-full items-center gap-5 bg-white px-5 pb-3 pt-5"
    >
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-[14px] font-semibold leading-[18px] text-gray-600">
          예상 월 납입금
        </span>
        {isPriceError ? (
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-[28px] leading-[40px] text-gray-900">0</span>
            <span className="text-[13px] font-medium leading-[18px] text-gray-600">원/월</span>
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium leading-[16px] text-amber-900">
              상담 문의
            </span>
          </div>
        ) : (
          <div className="flex items-baseline gap-0.5">
            <span className="font-bold text-[28px] leading-[40px] text-gray-900">
              {formatNumber(monthly)}
            </span>
            <span className="text-[13px] font-medium leading-[18px] text-gray-600">원/월</span>
          </div>
        )}
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="text-[13px] font-semibold leading-[18px] text-gray-900">
            {selectedSku.trimLabel}
          </span>
          <span aria-hidden className="h-3 w-px bg-gray-200" />
          <span className="text-[13px] font-medium leading-[18px] text-gray-600">
            {formatNumber(selectedSku.price)}원
          </span>
        </div>
      </div>
      <div className="relative h-[62px] w-[62px] shrink-0 overflow-hidden">
        <Image src={thumbnail} alt="차량 썸네일" fill sizes="62px" className="object-contain" />
      </div>
    </section>
  );
};
