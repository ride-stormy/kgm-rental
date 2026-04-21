'use client';

import { cn } from '@/lib/cn';

interface SegmentedPickerProps<TValue extends number | string> {
  options: readonly TValue[];
  value: TValue;
  onChange: (value: TValue) => void;
  formatLabel?: (option: TValue) => string;
  ariaLabel?: string;
}

export const SegmentedPicker = <TValue extends number | string>({
  options,
  value,
  onChange,
  formatLabel,
  ariaLabel,
}: SegmentedPickerProps<TValue>) => {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex w-full items-start gap-0 overflow-clip rounded-[10px] bg-gray-200 p-1"
    >
      {options.map((option) => {
        const isActive = option === value;
        const label = formatLabel ? formatLabel(option) : String(option);
        return (
          <button
            key={String(option)}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option)}
            className={cn(
              'flex-1 rounded-[8px] px-3 py-[7px] text-[13px] font-medium leading-[18px] transition-colors',
              isActive ? 'bg-white text-gray-900 shadow-kgm-1dp' : 'bg-transparent text-gray-600',
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
