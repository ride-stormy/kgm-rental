'use client';

import clsx from 'clsx';
import { useMemo } from 'react';
import { useConfigurationContext } from '../_context/ConfigurationContext';

export const TrimChipList = () => {
  const { state, skus, dispatch } = useConfigurationContext();

  const trimLabels = useMemo(() => {
    const unique: string[] = [];
    for (const sku of skus) {
      if (!unique.includes(sku.trimLabel)) unique.push(sku.trimLabel);
    }
    return unique;
  }, [skus]);

  return (
    <section aria-labelledby="trim-heading" className="bg-white">
      <h3
        id="trim-heading"
        className="mb-2 px-5 text-[13px] font-semibold leading-[18px] text-gray-600"
      >
        트림
      </h3>
      <div
        role="radiogroup"
        aria-labelledby="trim-heading"
        className="flex gap-2 overflow-x-auto px-5 pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {trimLabels.map((label) => {
          const isSelected = state.trimLabel === label;
          return (
            <button
              key={label}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => dispatch({ type: 'SELECT_TRIM', trimLabel: label })}
              className={clsx(
                'shrink-0 rounded-lg border px-4 py-2 text-[13px] font-medium leading-[18px] transition-colors',
                isSelected
                  ? 'border-kgm-purple-600 bg-white text-kgm-purple-600'
                  : 'border-gray-200 bg-white text-gray-600',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
};
