'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  ANNUAL_MILEAGE_OPTIONS,
  CONTRACT_PERIOD_OPTIONS,
  DEPOSIT_RATE_OPTIONS,
  PREPAID_RATE_OPTIONS,
  toConfiguratorError,
  type ConfiguratorInput,
} from '@/lib/validators/configurator.schema';
import { GuardTooltip } from './GuardTooltip';

interface ConfigFormProps {
  basePrice: number;
}

export const ConfigForm = ({ basePrice }: ConfigFormProps): JSX.Element => {
  const { watch } = useFormContext<ConfiguratorInput>();
  const prepaidRate = Number(watch('prepaidRate') ?? '0');
  const depositRate = Number(watch('depositRate') ?? '0');

  return (
    <section aria-labelledby="config-form-heading" className="mb-10">
      <h2
        id="config-form-heading"
        className="mb-4 text-lg font-semibold text-slate-900"
      >
        STEP 2. 내 견적 만들기
      </h2>

      <div className="space-y-6">
        <FormField
          name="contractPeriod"
          render={({ field }) => (
            <FormItem>
              <FormLabel id="label-contract-period">계약 기간 (개월)</FormLabel>
              <RadioGroup
                name="contractPeriod"
                value={field.value}
                onValueChange={field.onChange}
                aria-labelledby="label-contract-period"
                className="grid-cols-2 sm:grid-cols-4"
              >
                {CONTRACT_PERIOD_OPTIONS.map((value) => (
                  <RadioGroupItem key={value} value={value} label={`${value}개월`} />
                ))}
              </RadioGroup>
              <ConfiguratorFormMessage fieldName="contractPeriod" />
            </FormItem>
          )}
        />

        <FormField
          name="annualMileage"
          render={({ field }) => (
            <FormItem>
              <FormLabel id="label-annual-mileage">연 주행거리 (km)</FormLabel>
              <RadioGroup
                name="annualMileage"
                value={field.value}
                onValueChange={field.onChange}
                aria-labelledby="label-annual-mileage"
                className="grid-cols-2 sm:grid-cols-5"
              >
                {ANNUAL_MILEAGE_OPTIONS.map((value) => (
                  <RadioGroupItem
                    key={value}
                    value={value}
                    label={`${formatKrw(Number(value))}km`}
                  />
                ))}
              </RadioGroup>
              <ConfiguratorFormMessage fieldName="annualMileage" />
            </FormItem>
          )}
        />

        <FormField
          name="prepaidRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel id="label-prepaid-rate">선납금</FormLabel>
              <RadioGroup
                name="prepaidRate"
                value={field.value}
                onValueChange={field.onChange}
                aria-labelledby="label-prepaid-rate"
                className="grid-cols-2 sm:grid-cols-4"
              >
                {PREPAID_RATE_OPTIONS.map((value) => {
                  const rate = Number(value);
                  const reason = getPrepaidDisabledReason(rate, depositRate);
                  const isDisabled = reason !== null;
                  const label = rate === 0 ? '0%' : `${rate}%`;
                  const description = rate === 0
                    ? '없음'
                    : `${formatKrw((basePrice * rate) / 100)}원`;
                  const item = (
                    <RadioGroupItem
                      key={value}
                      value={value}
                      label={label}
                      description={description}
                      disabled={isDisabled}
                    />
                  );
                  return isDisabled && reason ? (
                    <GuardTooltip key={value} reason={reason}>
                      <span className="block">{item}</span>
                    </GuardTooltip>
                  ) : (
                    item
                  );
                })}
              </RadioGroup>
              <ConfiguratorFormMessage fieldName="prepaidRate" />
            </FormItem>
          )}
        />

        <FormField
          name="depositRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel id="label-deposit-rate">보증금</FormLabel>
              <RadioGroup
                name="depositRate"
                value={field.value}
                onValueChange={field.onChange}
                aria-labelledby="label-deposit-rate"
                className="grid-cols-2 sm:grid-cols-4"
              >
                {DEPOSIT_RATE_OPTIONS.map((value) => {
                  const rate = Number(value);
                  const reason = getDepositDisabledReason(rate, prepaidRate);
                  const isDisabled = reason !== null;
                  const label = rate === 0 ? '0%' : `${rate}%`;
                  const description = rate === 0
                    ? '없음'
                    : `${formatKrw((basePrice * rate) / 100)}원`;
                  const item = (
                    <RadioGroupItem
                      key={value}
                      value={value}
                      label={label}
                      description={description}
                      disabled={isDisabled}
                    />
                  );
                  return isDisabled && reason ? (
                    <GuardTooltip key={value} reason={reason}>
                      <span className="block">{item}</span>
                    </GuardTooltip>
                  ) : (
                    item
                  );
                })}
              </RadioGroup>
              <ConfiguratorFormMessage fieldName="depositRate" />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
};

interface ConfiguratorFormMessageProps {
  fieldName: keyof ConfiguratorInput;
}

const ConfiguratorFormMessage = ({
  fieldName,
}: ConfiguratorFormMessageProps): JSX.Element | null => {
  const { formState } = useFormContext<ConfiguratorInput>();
  const error = formState.errors[fieldName];
  if (!error?.message) return null;
  return (
    <FormMessage>{toConfiguratorError(String(error.message))}</FormMessage>
  );
};

const getPrepaidDisabledReason = (
  rate: number,
  depositRate: number,
): string | null => {
  if (rate > 40) return '선납금은 최대 40%까지 선택할 수 있어요.';
  if (rate + depositRate > 50)
    return '선납금과 보증금의 합은 50%를 넘을 수 없어요.';
  return null;
};

const getDepositDisabledReason = (
  rate: number,
  prepaidRate: number,
): string | null => {
  if (rate > 50) return '보증금은 최대 50%까지 선택할 수 있어요.';
  if (rate + prepaidRate > 50)
    return '선납금과 보증금의 합은 50%를 넘을 수 없어요.';
  return null;
};

const formatKrw = (value: number): string =>
  new Intl.NumberFormat('ko-KR').format(value);
