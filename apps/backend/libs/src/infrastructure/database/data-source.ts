// TypeORM DataSource for apps/backend/libs.
// Apps (apps/backend/regular, ...) instantiate the DataSource at boot using
// this factory so that reference-data migrations/seeder use the same entity
// registry as runtime repositories.

import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { VehicleDbEntity } from '../../modules/reference-data/infrastructure/db-entities/vehicle.db-entity.js';
import { InterestRateDbEntity } from '../../modules/reference-data/infrastructure/db-entities/interest-rate.db-entity.js';
import { ResidualRateDbEntity } from '../../modules/reference-data/infrastructure/db-entities/residual-rate.db-entity.js';
import { DeliveryRateDbEntity } from '../../modules/reference-data/infrastructure/db-entities/delivery-rate.db-entity.js';
import { MaintenancePackageRateDbEntity } from '../../modules/reference-data/infrastructure/db-entities/maintenance-package-rate.db-entity.js';
import { InsuranceRateDbEntity } from '../../modules/reference-data/infrastructure/db-entities/insurance-rate.db-entity.js';
import { PromotionDbEntity } from '../../modules/reference-data/infrastructure/db-entities/promotion.db-entity.js';
import { ProductModelDbEntity } from '../../modules/product-catalog/infrastructure/db-entities/product-model.db-entity.js';
import { VehicleSkuDbEntity } from '../../modules/product-catalog/infrastructure/db-entities/vehicle-sku.db-entity.js';
import { QuoteFormulaBaseDbEntity } from '../../modules/quote-formula/infrastructure/db-entities/quote-formula-base.db-entity.js';
import { QuotePriceMatrixDbEntity } from '../../modules/quote-price-matrix/infrastructure/db-entities/quote-price-matrix.db-entity.js';
import { CreateReferenceDataTables1761019200000 } from '../../migrations/1761019200000-CreateReferenceDataTables.js';
import { DropVehiclePriceColumn1761106800000 } from '../../migrations/1761106800000-DropVehiclePriceColumn.js';
import { CreateProductCatalogTables1761619200000 } from '../../migrations/1761619200000-CreateProductCatalogTables.js';
import { AddVehicleStrategyCode1761619300000 } from '../../migrations/1761619300000-AddVehicleStrategyCode.js';
import { DropQuotePriceMatrix1762000000000 } from '../../migrations/1762000000000-DropQuotePriceMatrix.js';
import { CreateQuoteFormulaBase1762000000001 } from '../../migrations/1762000000001-CreateQuoteFormulaBase.js';
import { CreateQuotePriceMatrix1762100000000 } from '../../migrations/1762100000000-CreateQuotePriceMatrix.js';

export const REFERENCE_DATA_ENTITIES = [
  VehicleDbEntity,
  InterestRateDbEntity,
  ResidualRateDbEntity,
  DeliveryRateDbEntity,
  MaintenancePackageRateDbEntity,
  InsuranceRateDbEntity,
  PromotionDbEntity,
] as const;

export const PRODUCT_CATALOG_ENTITIES = [
  ProductModelDbEntity,
  VehicleSkuDbEntity,
] as const;

export const QUOTE_FORMULA_ENTITIES = [
  QuoteFormulaBaseDbEntity,
] as const;

export const QUOTE_PRICE_MATRIX_ENTITIES = [
  QuotePriceMatrixDbEntity,
] as const;

export const APP_ENTITIES = [
  ...REFERENCE_DATA_ENTITIES,
  ...PRODUCT_CATALOG_ENTITIES,
  ...QUOTE_FORMULA_ENTITIES,
  ...QUOTE_PRICE_MATRIX_ENTITIES,
] as const;

export const REFERENCE_DATA_MIGRATIONS = [
  CreateReferenceDataTables1761019200000,
  DropVehiclePriceColumn1761106800000,
  AddVehicleStrategyCode1761619300000,
] as const;

export const APP_MIGRATIONS = [
  CreateReferenceDataTables1761019200000,
  DropVehiclePriceColumn1761106800000,
  CreateProductCatalogTables1761619200000,
  AddVehicleStrategyCode1761619300000,
  DropQuotePriceMatrix1762000000000,
  CreateQuoteFormulaBase1762000000001,
  CreateQuotePriceMatrix1762100000000,
] as const;

export function buildReferenceDataSource(override: Partial<DataSourceOptions> = {}): DataSource {
  const useSSL = process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production';
  const base = {
    type: 'postgres' as const,
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    username: process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD ?? 'postgres',
    database: process.env.POSTGRES_DB ?? 'kgm_rental',
    ssl: useSSL ? { rejectUnauthorized: false } : false,
    entities: [...APP_ENTITIES],
    migrations: [...APP_MIGRATIONS],
    synchronize: false,
    logging: false,
  };
  return new DataSource({ ...base, ...override } as DataSourceOptions);
}
