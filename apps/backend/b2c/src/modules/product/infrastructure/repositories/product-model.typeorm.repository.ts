import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ProductModelDbEntity } from '@kgm-rental/backend-libs/modules/product-catalog/infrastructure/db-entities/product-model.db-entity.js';
import { VehicleSkuDbEntity } from '@kgm-rental/backend-libs/modules/product-catalog/infrastructure/db-entities/vehicle-sku.db-entity.js';
import {
  ProductModelMapper,
  VehicleSkuMapper,
} from '@kgm-rental/backend-libs/modules/product-catalog/infrastructure/mappers/product-catalog.mappers.js';

import type {
  FindAllProductsRepositoryInput,
  FindAllProductsRepositoryOutput,
  FindProductBySlugRepositoryInput,
  FindProductBySlugRepositoryOutput,
  FindSkuByIdRepositoryInput,
  FindSkuByIdRepositoryOutput,
  ProductModelRepositoryPort,
  ProductWithSkus,
} from '../../domain/repositories/product-model.repository.js';

@Injectable()
export class ProductModelTypeormRepository implements ProductModelRepositoryPort {
  constructor(
    @InjectRepository(ProductModelDbEntity)
    private readonly modelRepo: Repository<ProductModelDbEntity>,
    @InjectRepository(VehicleSkuDbEntity)
    private readonly skuRepo: Repository<VehicleSkuDbEntity>,
  ) {}

  async findAll(
    _input: FindAllProductsRepositoryInput,
  ): Promise<FindAllProductsRepositoryOutput> {
    const dbModels = await this.modelRepo.find({ order: { name: 'ASC' } });
    if (dbModels.length === 0) return { items: [] };
    const dbSkus = await this.skuRepo.find({
      where: { productModelId: In(dbModels.map((m) => m.id)) },
    });
    const skusByModel = new Map<string, VehicleSkuDbEntity[]>();
    for (const s of dbSkus) {
      const list = skusByModel.get(s.productModelId) ?? [];
      list.push(s);
      skusByModel.set(s.productModelId, list);
    }
    const items: ProductWithSkus[] = dbModels.map((m) => ({
      model: ProductModelMapper.toDomain(m),
      skus: (skusByModel.get(m.id) ?? []).map((s) => VehicleSkuMapper.toDomain(s)),
    }));
    return { items };
  }

  async findBySlug(
    input: FindProductBySlugRepositoryInput,
  ): Promise<FindProductBySlugRepositoryOutput> {
    const dbModel = await this.modelRepo.findOne({ where: { slug: input.slug } });
    if (!dbModel) return { product: null };
    const dbSkus = await this.skuRepo.find({ where: { productModelId: dbModel.id } });
    return {
      product: {
        model: ProductModelMapper.toDomain(dbModel),
        skus: dbSkus.map((s) => VehicleSkuMapper.toDomain(s)),
      },
    };
  }

  async findSkuById(input: FindSkuByIdRepositoryInput): Promise<FindSkuByIdRepositoryOutput> {
    const dbSku = await this.skuRepo.findOne({ where: { id: input.skuId } });
    return { sku: dbSku ? VehicleSkuMapper.toDomain(dbSku) : null };
  }
}
