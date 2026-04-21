import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductModelDbEntity } from '@kgm-rental/backend-libs/modules/product-catalog/infrastructure/db-entities/product-model.db-entity.js';
import { VehicleSkuDbEntity } from '@kgm-rental/backend-libs/modules/product-catalog/infrastructure/db-entities/vehicle-sku.db-entity.js';

import { PRODUCT_MODEL_REPOSITORY } from './domain/repositories/product-model.repository.js';
import { STOCK_OVERRIDE_PORT } from './domain/ports/stock-override.port.js';
import { ProductModelTypeormRepository } from './infrastructure/repositories/product-model.typeorm.repository.js';
import { NullStockOverrideAdapter } from './infrastructure/adapters/null-stock-override.adapter.js';
import { ProductSkuProviderAdapter } from './infrastructure/adapters/product-sku-provider.adapter.js';
import { ListProductsService } from './application/services/list-products.service.js';
import { GetProductDetailService } from './application/services/get-product-detail.service.js';
import { GetSkuDetailService } from './application/services/get-sku-detail.service.js';
import { ProductController } from './presentation/product.controller.js';
import { PRODUCT_SKU_PROVIDER } from '../rental-quote/application/ports/product-sku-provider.port.js';

@Module({
  imports: [TypeOrmModule.forFeature([ProductModelDbEntity, VehicleSkuDbEntity])],
  controllers: [ProductController],
  providers: [
    { provide: PRODUCT_MODEL_REPOSITORY, useClass: ProductModelTypeormRepository },
    { provide: STOCK_OVERRIDE_PORT, useClass: NullStockOverrideAdapter },
    { provide: PRODUCT_SKU_PROVIDER, useClass: ProductSkuProviderAdapter },
    ListProductsService,
    GetProductDetailService,
    GetSkuDetailService,
  ],
  exports: [PRODUCT_SKU_PROVIDER],
})
export class ProductModule {}
