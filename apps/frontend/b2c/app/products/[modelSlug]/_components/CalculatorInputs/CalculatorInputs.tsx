'use client';

import clsx from 'clsx';
import { Controller, useFormContext } from 'react-hook-form';
import { SegmentedPicker } from './SegmentedPicker';
import { PercentSlider } from './PercentSlider';
import type { CalculatorSchema } from './schema';
import { ANNUAL_KM, CONTRACT_MONTHS } from '@/lib/vehicle-pricing';
import { useConfigurationSelection } from '../../_hooks/useConfigurationSelection';

const CONTRACT_OPTIONS = CONTRACT_MONTHS.map((m) => ({ value: m, label: `${m}개월` }));
const ANNUAL_KM_OPTIONS = ANNUAL_KM.map((km) => ({ value: km, label: `${km / 10_000}만km` }));

const formatKrw = (value: number): string => `${Math.round(value).toLocaleString('ko-KR')}원`;

interface InputRowProps {
  label: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}

const InputRow = ({ label, trailing, children }: InputRowProps) => (
  <div className="flex flex-col gap-2">
    <div className="flex w-full items-center gap-2">
      <span className="flex-1 text-[13px] font-semibold leading-[18px] text-gray-600">{label}</span>
      {trailing}
    </div>
    {children}
  </div>
);

export const CalculatorInputs = () => {
  const { control } = useFormContext<CalculatorSchema>();
  const { selectedSku } = useConfigurationSelection();
  const vehiclePrice = selectedSku.priceError ? 0 : selectedSku.price;

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      aria-label="월 납입금 계산기"
      className="flex flex-col gap-5 bg-white px-5 py-5"
    >
      <h2 className="text-[20px] font-semibold leading-[30px] text-gray-900">견적</h2>
      <Controller
        control={control}
        name="contractMonths"
        render={({ field }) => (
          <InputRow label="계약 기간">
            <SegmentedPicker
              ariaLabel="계약 기간"
              options={CONTRACT_OPTIONS}
              value={field.value}
              onChange={field.onChange}
            />
          </InputRow>
        )}
      />

      <Controller
        control={control}
        name="annualKm"
        render={({ field }) => (
          <InputRow label="연간 주행거리">
            <div
              role="radiogroup"
              aria-label="연간 주행거리"
              className="flex gap-2 overflow-x-auto"
              style={{ scrollbarWidth: 'none' }}
            >
              {ANNUAL_KM_OPTIONS.map((opt) => {
                const isSelected = opt.value === field.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => field.onChange(opt.value)}
                    className={clsx(
                      'shrink-0 rounded-lg border px-4 py-2 text-[13px] font-medium leading-[18px] transition-colors',
                      isSelected
                        ? 'border-gray-900 bg-white font-semibold text-gray-900'
                        : 'border-gray-200 bg-white text-gray-600',
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </InputRow>
        )}
      />

      <Controller
        control={control}
        name="prepaidPercent"
        render={({ field }) => (
          <InputRow
            label="선수금 비율"
            trailing={
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-medium leading-[12px] text-gray-600">
                  {field.value}%
                </span>
                <span className="text-[12px] font-medium leading-[12px] text-gray-600">
                  {formatKrw((vehiclePrice * field.value) / 100)}
                </span>
              </div>
            }
          >
            <PercentSlider ariaLabel="선수금 비율" value={field.value} onChange={field.onChange} />
          </InputRow>
        )}
      />

      <Controller
        control={control}
        name="subsidyPercent"
        render={({ field }) => (
          <InputRow
            label="보조금 비율"
            trailing={
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] font-medium leading-[12px] text-gray-600">
                  {field.value}%
                </span>
                <span className="text-[12px] font-medium leading-[12px] text-gray-600">
                  {formatKrw((vehiclePrice * field.value) / 100)}
                </span>
              </div>
            }
          >
            <PercentSlider ariaLabel="보조금 비율" value={field.value} onChange={field.onChange} />
          </InputRow>
        )}
      />
    </form>
  );
};
