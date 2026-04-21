import { z } from 'zod';
import { envelope } from '../rental-quote/common.schema.js';
import { ColorSwatchItemSchema, VehicleTypeSchema } from './common.schema.js';

export const ProductCardSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string(),
  brandName: z.string(),
  heroImage: z.string(),
  vehicleTypeDefault: VehicleTypeSchema,
  minMonthlyRent: z.number().int().positive(),
  colorSwatch: z.array(ColorSwatchItemSchema),
  promotionTags: z.array(z.string()),
});
export type ProductCard = z.infer<typeof ProductCardSchema>;

export const ListProductsResponseSchema = envelope(
  z.object({ items: z.array(ProductCardSchema) }),
);
export type ListProductsResponse = z.infer<typeof ListProductsResponseSchema>;
