import { z } from 'zod';
import { envelope } from '../rental-quote/common.schema.js';
import { ProductCardSchema } from './product-card.schema.js';
import { ProductPresetSchema } from './common.schema.js';
import { VehicleSkuSchema } from './vehicle-sku.schema.js';

export const ProductDetailSchema = ProductCardSchema.extend({
  description: z.string(),
  fixedPreset: ProductPresetSchema,
  skus: z.array(VehicleSkuSchema),
});
export type ProductDetail = z.infer<typeof ProductDetailSchema>;

export const ProductDetailResponseSchema = envelope(ProductDetailSchema);
export type ProductDetailResponse = z.infer<typeof ProductDetailResponseSchema>;
