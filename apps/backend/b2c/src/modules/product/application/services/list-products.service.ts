import { Inject, Injectable } from '@nestjs/common';
import {
  PRODUCT_MODEL_REPOSITORY,
  type ProductModelRepositoryPort,
} from '../../domain/repositories/product-model.repository.js';
import {
  STOCK_OVERRIDE_PORT,
  type StockOverridePort,
} from '../../domain/ports/stock-override.port.js';
import type {
  ListProductsServiceInput,
  ListProductsServiceOutput,
} from './interfaces/list-products.service.interface.js';
import { modelToCard } from './mappers/domain-to-dto.js';

@Injectable()
export class ListProductsService {
  constructor(
    @Inject(PRODUCT_MODEL_REPOSITORY)
    private readonly repo: ProductModelRepositoryPort,
    @Inject(STOCK_OVERRIDE_PORT)
    private readonly stock: StockOverridePort,
  ) {}

  async execute(_input: ListProductsServiceInput): Promise<ListProductsServiceOutput> {
    const { items } = await this.repo.findAll({});
    const cards = await Promise.all(
      items.map(async (p) => {
        const { skus } = await this.stock.applyTo({ skus: p.skus });
        return modelToCard(p.model, skus);
      }),
    );
    return { items: cards };
  }
}
