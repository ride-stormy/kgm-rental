import { z } from 'zod';

export const calculatorSchema = z.object({
  contractMonths: z.union([
    z.literal(24),
    z.literal(36),
    z.literal(48),
    z.literal(60),
  ]),
  annualKm: z.union([
    z.literal(10000),
    z.literal(15000),
    z.literal(20000),
    z.literal(25000),
    z.literal(30000),
  ]),
  prepaidPercent: z.union([
    z.literal(0),
    z.literal(10),
    z.literal(20),
    z.literal(30),
    z.literal(40),
    z.literal(50),
  ]),
  subsidyPercent: z.union([
    z.literal(0),
    z.literal(10),
    z.literal(20),
    z.literal(30),
    z.literal(40),
    z.literal(50),
  ]),
});

export type CalculatorSchema = z.infer<typeof calculatorSchema>;
