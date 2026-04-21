import type { ProductModel } from '@kgm-rental/backend-libs/modules/product-catalog/domain/domain-entities/product-model.domain-entity.js';
import type { VehicleSku } from '@kgm-rental/backend-libs/modules/product-catalog/domain/domain-entities/vehicle-sku.domain-entity.js';

export interface ProductWithSkus {
  model: ProductModel;
  skus: VehicleSku[];
}

export interface FindAllProductsRepositoryInput {
  // No filters for MVP; future: type, priceRange, promotion.
  _placeholder?: never;
}
export interface FindAllProductsRepositoryOutput {
  items: ProductWithSkus[];
}

export interface FindProductBySlugRepositoryInput {
  slug: string;
}
export interface FindProductBySlugRepositoryOutput {
  product: ProductWithSkus | null;
}

export interface FindSkuByIdRepositoryInput {
  skuId: string;
}
export interface FindSkuByIdRepositoryOutput {
  sku: VehicleSku | null;
}
