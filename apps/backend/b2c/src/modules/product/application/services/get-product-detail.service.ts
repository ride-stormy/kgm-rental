import { Inject, Injectable } from '@nestjs/common';
import {
  PRODUCT_MODEL_REPOSITORY,
  type ProductModelRepositoryPort,
} from '../../domain/repositories/product-model.repository.js';
import {
  STOCK_OVERRIDE_PORT,
  type StockOverridePort,
} from '../../domain/ports/stock-override.port.js';
import { ProductNotFoundApplicationException } from '../exceptions/product-not-found.application-exception.js';
import type {
  GetProductDetailServiceInput,
  GetProductDetailServiceOutput,
} from './interfaces/get-product-detail.service.interface.js';
import { modelToDetail } from './mappers/domain-to-dto.js';

@Injectable()
export class GetProductDetailService {
  constructor(
    @Inject(PRODUCT_MODEL_REPOSITORY)
    private readonly repo: ProductModelRepositoryPort,
    @Inject(STOCK_OVERRIDE_PORT)
    private readonly stock: StockOverridePort,
  ) {}

  async execute(input: GetProductDetailServiceInput): Promise<GetProductDetailServiceOutput> {
    const { product } = await this.repo.findBySlug({ slug: input.modelSlug });
    if (!product) throw new ProductNotFoundApplicationException(input.modelSlug);
    const { skus } = await this.stock.applyTo({ skus: product.skus });
    return { detail: modelToDetail(product.model, skus) };
  }
}
