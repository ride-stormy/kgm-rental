'use client';

import type { ChangeEvent } from 'react';
import { PERCENT_STEPS } from '@/lib/vehicle-pricing';
import type { PercentStep } from '@/lib/vehicle-pricing';

interface PercentSliderProps {
  ariaLabel: string;
  value: PercentStep;
  onChange: (value: PercentStep) => void;
}

export const PercentSlider = ({ ariaLabel, value, onChange }: PercentSliderProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    if ((PERCENT_STEPS as readonly number[]).includes(next)) {
      onChange(next as PercentStep);
    }
  };

  const percent = value / 50;

  return (
    <div className="relative w-full py-3">
      <div className="relative h-[6px] w-full rounded-lg bg-gray-200">
        <div
          aria-hidden
          className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-kgm-purple-600 shadow-kgm-4dp"
          style={{ left: `calc(${percent * 100}% - 12px)` }}
        />
      </div>
      <input
        type="range"
        aria-label={ariaLabel}
        min={0}
        max={50}
        step={10}
        value={value}
        onChange={handleChange}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
      />
    </div>
  );
};
