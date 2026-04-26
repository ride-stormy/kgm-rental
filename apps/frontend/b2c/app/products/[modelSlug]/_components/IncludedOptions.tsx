'use client';

import { useMemo, useState } from 'react';
import { useConfigurationContext } from '../_context/ConfigurationContext';
import { useConfigurationSelection } from '../_hooks/useConfigurationSelection';

const formatPrice = (value: number) => value.toLocaleString('ko-KR');

export const IncludedOptions = () => {
  const { dispatch } = useConfigurationContext();
  const { selectedSku, skuPool } = useConfigurationSelection();
  const [isOpen, setIsOpen] = useState(false);

  const sortedPool = useMemo(
    () => [...skuPool].sort((a, b) => a.price - b.price),
    [skuPool],
  );

  return (
    <section aria-labelledby="options-heading" className="bg-white px-5">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="options-panel"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 py-2"
      >
        <span
          id="options-heading"
          className="text-[13px] font-semibold leading-[18px] text-gray-600"
        >
          포함된 옵션 {[...selectedSku.baseCustomizing, ...selectedSku.optionCustomizing].filter((c) => c.name.trim() !== '-').length}개 보기
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          className={`text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div id="options-panel" className="pb-3">
          <ul className="flex flex-col gap-2">
              {sortedPool.map((sku) => {
                const isSelected = sku.skuId === selectedSku.skuId;
                const pkgOptions = [
                  ...sku.baseCustomizing.map((c) => c.name),
                  ...sku.optionCustomizing.map((c) => c.name),
                ].filter((name) => name.trim() !== '-');
                return (
                  <li key={sku.skuId}>
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'SELECT_SKU', skuId: sku.skuId })}
                      className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                        isSelected
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold leading-[18px] text-gray-900">
                          {formatPrice(sku.price)}원
                        </span>
                        {isSelected && (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                            <path
                              d="M3 8L6.5 11.5L13 5"
                              stroke="#111827"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      {pkgOptions.length === 0 ? (
                        <p className="mt-1 text-[11px] font-medium leading-[16px] text-gray-400">
                          옵션없음
                        </p>
                      ) : (
                        <ul className="mt-1 flex flex-col gap-0.5">
                          {pkgOptions.map((name) => (
                            <li
                              key={name}
                              className="text-[11px] font-medium leading-[16px] text-gray-500"
                            >
                              · {name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
        </div>
      )}
    </section>
  );
};
