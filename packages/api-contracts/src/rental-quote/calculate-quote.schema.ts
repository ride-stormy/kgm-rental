import { z } from 'zod';
import { envelope } from './common.schema.js';

export const ContractPeriodLiteral = z.union([
  z.literal(24),
  z.literal(36),
  z.literal(48),
  z.literal(60),
]);

export const AnnualMileageLiteral = z.union([
  z.literal(10000),
  z.literal(15000),
  z.literal(20000),
  z.literal(25000),
  z.literal(30000),
]);

export const PrepaidRateLiteral = z.union([
  z.literal(0),
  z.literal(10),
  z.literal(20),
  z.literal(30),
]);

export const DepositRateLiteral = z.union([
  z.literal(0),
  z.literal(10),
  z.literal(20),
  z.literal(30),
]);

export const CalculateQuoteRequestSchema = z.object({
  skuId: z.string().min(1),
  contractPeriod: ContractPeriodLiteral,
  annualMileage: AnnualMileageLiteral,
  prepaidRate: PrepaidRateLiteral,
  depositRate: DepositRateLiteral,
});
export type CalculateQuoteRequest = z.infer<typeof CalculateQuoteRequestSchema>;

export const QuoteBreakdownSchema = z.object({
  standardRent: z.number().int(),
  discountTotal: z.number().int(),
  prepaidDeduction: z.number().int(),
  finalMonthlyRent: z.number().int(),
  residualValue: z.number().int(),
  prepaidAmount: z.number().int(),
  depositAmount: z.number().int(),
  initialBurden: z.number().int(),
  supplyPrice: z.number().int(),
  vat: z.number().int(),
});
export type QuoteBreakdown = z.infer<typeof QuoteBreakdownSchema>;

export const CalculateQuoteResponseSchema = envelope(QuoteBreakdownSchema);
export type CalculateQuoteResponse = z.infer<typeof CalculateQuoteResponseSchema>;
