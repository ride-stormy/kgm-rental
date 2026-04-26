'use client';

import clsx from 'clsx';

interface SegmentedPickerOption<TValue extends number> {
  value: TValue;
  label: string;
}

interface SegmentedPickerProps<TValue extends number> {
  ariaLabel: string;
  options: readonly SegmentedPickerOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
}

export const SegmentedPicker = <TValue extends number>({
  ariaLabel,
  options,
  value,
  onChange,
}: SegmentedPickerProps<TValue>) => {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex w-full gap-0 overflow-hidden rounded-[10px] bg-gray-200 p-1"
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(opt.value)}
            className={clsx(
              'flex flex-1 items-center justify-center rounded-lg px-3 py-[7px] text-[13px] leading-[18px] transition-colors',
              isSelected
                ? 'bg-white font-semibold text-gray-900 shadow-kgm-1dp'
                : 'bg-transparent font-medium text-gray-600',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
