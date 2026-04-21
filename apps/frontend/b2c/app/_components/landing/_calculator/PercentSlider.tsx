'use client';

import type { PercentStep } from '@/lib/vehicle-pricing';

interface PercentSliderProps {
  value: PercentStep;
  max: PercentStep;
  vehiclePrice: number;
  onChange: (value: PercentStep) => void;
  label: string;
  id: string;
}

const formatKrw = (amount: number): string => new Intl.NumberFormat('ko-KR').format(amount);

export const PercentSlider = ({
  value,
  max,
  vehiclePrice,
  onChange,
  label,
  id,
}: PercentSliderProps) => {
  const amountAtValue = Math.round((vehiclePrice * value) / 100);

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex w-full items-center gap-2 text-gray-600">
        <label htmlFor={id} className="flex-1 text-[13px] font-semibold leading-[18px]">
          {label}
        </label>
        <div className="flex items-center gap-1.5 text-[12px] font-medium leading-[12px]">
          <span>{value}%</span>
          <span>{formatKrw(amountAtValue)}원</span>
        </div>
      </div>
      <div className="flex w-full items-center py-3">
        <input
          id={id}
          type="range"
          min={0}
          max={max}
          step={10}
          value={value}
          onChange={(e) => {
            const parsed = Number(e.target.value) as PercentStep;
            onChange(parsed);
          }}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={value}
          className="kgm-percent-slider w-full appearance-none bg-transparent"
        />
      </div>
    </div>
  );
};
