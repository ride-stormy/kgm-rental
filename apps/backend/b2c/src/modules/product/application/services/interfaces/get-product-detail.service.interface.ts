import type { ProductDetail } from '@kgm-rental/api-contracts/product/product-detail.schema.js';

export interface GetProductDetailServiceInput {
  modelSlug: string;
}

export interface GetProductDetailServiceOutput {
  detail: ProductDetail;
}
