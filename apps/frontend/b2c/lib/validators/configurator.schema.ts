import { z } from 'zod';

export const CONTRACT_PERIOD_OPTIONS = ['24', '36', '48', '60'] as const;
export const ANNUAL_MILEAGE_OPTIONS = [
  '10000',
  '15000',
  '20000',
  '25000',
  '30000',
] as const;
export const PREPAID_RATE_OPTIONS = ['0', '10', '20', '30'] as const;
export const DEPOSIT_RATE_OPTIONS = ['0', '10', '20', '30'] as const;

export const ConfiguratorSchema = z
  .object({
    contractPeriod: z.enum(CONTRACT_PERIOD_OPTIONS),
    annualMileage: z.enum(ANNUAL_MILEAGE_OPTIONS),
    prepaidRate: z.enum(PREPAID_RATE_OPTIONS),
    depositRate: z.enum(DEPOSIT_RATE_OPTIONS),
  })
  .refine((d) => Number(d.prepaidRate) <= 40, {
    message: 'PREPAID_LIMIT_40',
    path: ['prepaidRate'],
  })
  .refine((d) => Number(d.depositRate) <= 50, {
    message: 'DEPOSIT_LIMIT_50',
    path: ['depositRate'],
  })
  .refine(
    (d) => Number(d.prepaidRate) + Number(d.depositRate) <= 50,
    { message: 'SUM_LIMIT_50', path: ['depositRate'] },
  );

export type ConfiguratorInput = z.infer<typeof ConfiguratorSchema>;

export const INITIAL_VALUES: ConfiguratorInput = {
  contractPeriod: '36',
  annualMileage: '15000',
  prepaidRate: '0',
  depositRate: '0',
};

export const ERROR_MESSAGE_KO: Record<string, string> = {
  PREPAID_LIMIT_40: '선납금은 최대 40%까지 선택할 수 있어요.',
  DEPOSIT_LIMIT_50: '보증금은 최대 50%까지 선택할 수 있어요.',
  SUM_LIMIT_50: '선납금과 보증금의 합은 50%를 넘을 수 없어요.',
};

export const toConfiguratorError = (code: string): string =>
  ERROR_MESSAGE_KO[code] ?? code;

// Map server error codes (INVALID_DEPOSIT_PREPAY_LIMIT_*) to Zod message keys.
export const SERVER_ERROR_TO_FIELD: Record<
  string,
  { field: keyof ConfiguratorInput; code: string }
> = {
  INVALID_DEPOSIT_PREPAY_LIMIT_PREPAID_40: {
    field: 'prepaidRate',
    code: 'PREPAID_LIMIT_40',
  },
  INVALID_DEPOSIT_PREPAY_LIMIT_DEPOSIT_50: {
    field: 'depositRate',
    code: 'DEPOSIT_LIMIT_50',
  },
  INVALID_DEPOSIT_PREPAY_LIMIT_SUM_50: {
    field: 'depositRate',
    code: 'SUM_LIMIT_50',
  },
};
