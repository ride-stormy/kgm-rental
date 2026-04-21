import type { QuoteBreakdown } from '@kgm-rental/api-contracts/rental-quote/calculate-quote.schema.js';

export interface CalculateQuoteServiceInput {
  skuId: string;
  contractPeriod: number;
  annualMileage: number;
  prepaidRate: number;
  depositRate: number;
}

export interface CalculateQuoteServiceOutput {
  breakdown: QuoteBreakdown;
}

export interface CalculateQuoteServicePort {
  execute(input: CalculateQuoteServiceInput): Promise<CalculateQuoteServiceOutput>;
}
