import { z } from 'zod';
import { envelope } from './common.schema.js';
import {
  AnnualMileageLiteral,
  ContractPeriodLiteral,
} from './calculate-quote.schema.js';

export const ResidualValueQuerySchema = z.object({
  skuId: z.string().min(1),
  contractPeriod: z.coerce.number().pipe(ContractPeriodLiteral),
  annualMileage: z.coerce.number().pipe(AnnualMileageLiteral),
});
export type ResidualValueQuery = z.infer<typeof ResidualValueQuerySchema>;

export const ResidualValueDataSchema = z.object({
  residualValue: z.number().int(),
});
export type ResidualValueData = z.infer<typeof ResidualValueDataSchema>;

export const ResidualValueResponseSchema = envelope(ResidualValueDataSchema);
export type ResidualValueResponse = z.infer<typeof ResidualValueResponseSchema>;
