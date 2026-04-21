import { Inject, Injectable } from '@nestjs/common';
import {
  PRODUCT_MODEL_REPOSITORY,
  type ProductModelRepositoryPort,
} from '../../domain/repositories/product-model.repository.js';
import {
  STOCK_OVERRIDE_PORT,
  type StockOverridePort,
} from '../../domain/ports/stock-override.port.js';
import {
  ProductNotFoundApplicationException,
  SkuNotFoundApplicationException,
} from '../exceptions/product-not-found.application-exception.js';
import type {
  GetSkuDetailServiceInput,
  GetSkuDetailServiceOutput,
} from './interfaces/get-sku-detail.service.interface.js';
import { skuToDto } from './mappers/domain-to-dto.js';

@Injectable()
export class GetSkuDetailService {
  constructor(
    @Inject(PRODUCT_MODEL_REPOSITORY)
    private readonly repo: ProductModelRepositoryPort,
    @Inject(STOCK_OVERRIDE_PORT)
    private readonly stock: StockOverridePort,
  ) {}

  async execute(input: GetSkuDetailServiceInput): Promise<GetSkuDetailServiceOutput> {
    const { product } = await this.repo.findBySlug({ slug: input.modelSlug });
    if (!product) throw new ProductNotFoundApplicationException(input.modelSlug);

    const match = product.skus.find((s) => s.id === input.skuId);
    if (!match) throw new SkuNotFoundApplicationException(input.skuId, input.modelSlug);

    const { skus } = await this.stock.applyTo({ skus: [match] });
    return { sku: skuToDto(skus[0]!) };
  }
}
