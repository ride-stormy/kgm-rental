import { z } from 'zod';
import { envelope } from '../rental-quote/common.schema.js';
import { VehicleTypeSchema } from './common.schema.js';

export const VehicleSkuSchema = z.object({
  id: z.string().min(1),
  productModelId: z.string().min(1),
  specCode: z.string(),
  modelCode: z.string(),
  trim: z.string(),
  vehicleType: VehicleTypeSchema,
  displacement: z.number().int().nonnegative(),
  colorExteriorCode: z.string(),
  colorExteriorName: z.string(),
  colorInteriorCode: z.string().nullable(),
  options: z.array(z.string()),
  price: z.number().int().nonnegative(),
  stockBucket: z.number().int().nonnegative(),
  productionPeriods: z.array(z.string()),
});
export type VehicleSkuDto = z.infer<typeof VehicleSkuSchema>;

export const SkuDetailResponseSchema = envelope(VehicleSkuSchema);
export type SkuDetailResponse = z.infer<typeof SkuDetailResponseSchema>;
