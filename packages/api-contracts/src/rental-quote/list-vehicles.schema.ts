import { z } from 'zod';
import { envelope } from './common.schema.js';

export const ListVehiclesQuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(50).default(20),
  skip: z.coerce.number().int().min(0).default(0),
});
export type ListVehiclesQuery = z.infer<typeof ListVehiclesQuerySchema>;

export const VehicleSummarySchema = z.object({
  slug: z.string(),
  name: z.string(),
  price: z.number().int(),
  isEv: z.boolean(),
  isHev: z.boolean(),
});
export type VehicleSummary = z.infer<typeof VehicleSummarySchema>;

export const ListVehiclesResponseSchema = envelope(
  z.object({
    items: z.array(VehicleSummarySchema),
    total: z.number().int(),
  }),
);
export type ListVehiclesResponse = z.infer<typeof ListVehiclesResponseSchema>;
