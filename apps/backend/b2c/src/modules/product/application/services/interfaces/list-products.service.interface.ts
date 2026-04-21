import type { ProductCard } from '@kgm-rental/api-contracts/product/product-card.schema.js';

export type ListProductsServiceInput = Record<string, never>;

export interface ListProductsServiceOutput {
  items: ProductCard[];
}
