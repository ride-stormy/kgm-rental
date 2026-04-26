'use client';

import clsx from 'clsx';
import { useMemo } from 'react';
import { useConfigurationContext } from '../_context/ConfigurationContext';
import { listUniqueColors } from '@/lib/inventory/inventory-mapper';

const EXTERIOR_COLOR_MAP: Record<string, string> = {
  WAA: '#FFFFFF',
  LAK: '#222729',
  PAF: '#BFBFBF',
  BAB: '#1A2338',
  RAG: '#5C1A20',
  SAA: '#8C8F94',
  BAE: '#0B2E5B',
  EBL: '#B0A79E',
  GAO: '#58645C',
  ADE: '#818189',
  BAS: '#303444',
};

const TWO_TONE_COLOR_MAP: Record<string, [string, string]> = {
  '2WA': ['#161819', '#EBEBE9'],
};

const colorCodeToHex = (code: string): string => EXTERIOR_COLOR_MAP[code] ?? '#CFD6D9';

export const ColorChipList = () => {
  const { state, skus, dispatch } = useConfigurationContext();

  const colors = useMemo(() => {
    const all = listUniqueColors([...skus]);
    const seen = new Set<string>();
    return all.filter(({ name }) => {
      if (seen.has(name)) return false;
      seen.add(name);
      return true;
    });
  }, [skus]);

  const selectedColorName = useMemo(
    () => skus.find((s) => s.colorCode === state.colorCode)?.colorName ?? '',
    [skus, state.colorCode],
  );

  return (
    <section aria-labelledby="color-heading" className="bg-white">
      <h3
        id="color-heading"
        className="mb-2 px-5 text-[13px] font-semibold leading-[18px] text-gray-600"
      >
        색상
      </h3>
      <div
        role="radiogroup"
        aria-labelledby="color-heading"
        className="flex gap-2 overflow-x-auto px-5 pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {colors.map((color) => {
          const isSelected = selectedColorName === color.name;
          return (
            <button
              key={color.code}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => dispatch({ type: 'SELECT_COLOR', colorCode: color.code })}
              className={clsx(
                'inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium leading-[18px] transition-colors',
                isSelected
                  ? 'border-kgm-purple-600 bg-white text-kgm-purple-600'
                  : 'border-gray-200 bg-white text-gray-600',
              )}
            >
              {TWO_TONE_COLOR_MAP[color.code] ? (
                <span
                  aria-hidden
                  className="h-4 w-4 rounded border border-gray-200"
                  style={{
                    background: `linear-gradient(to right, ${TWO_TONE_COLOR_MAP[color.code]![0]} 50%, ${TWO_TONE_COLOR_MAP[color.code]![1]} 50%)`,
                  }}
                />
              ) : (
                <span
                  aria-hidden
                  className="h-4 w-4 rounded border border-gray-200"
                  style={{ backgroundColor: colorCodeToHex(color.code) }}
                />
              )}
              <span>{color.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
