import type {
  FindAllProductsRepositoryInput,
  FindAllProductsRepositoryOutput,
  FindProductBySlugRepositoryInput,
  FindProductBySlugRepositoryOutput,
  FindSkuByIdRepositoryInput,
  FindSkuByIdRepositoryOutput,
} from './interfaces/product-model.repository.interface.js';

export const PRODUCT_MODEL_REPOSITORY = Symbol('PRODUCT_MODEL_REPOSITORY');

export interface ProductModelRepositoryPort {
  findAll(input: FindAllProductsRepositoryInput): Promise<FindAllProductsRepositoryOutput>;
  findBySlug(input: FindProductBySlugRepositoryInput): Promise<FindProductBySlugRepositoryOutput>;
  findSkuById(input: FindSkuByIdRepositoryInput): Promise<FindSkuByIdRepositoryOutput>;
}

export type {
  FindAllProductsRepositoryInput,
  FindAllProductsRepositoryOutput,
  FindProductBySlugRepositoryInput,
  FindProductBySlugRepositoryOutput,
  FindSkuByIdRepositoryInput,
  FindSkuByIdRepositoryOutput,
  ProductWithSkus,
} from './interfaces/product-model.repository.interface.js';
