// products.seeder — reads pre-docs/vehicle-groups-20260420.xlsx and upserts
// ProductModel + VehicleSku. Idempotent (upsert by id).
// Merges catalog metadata from product-config.ts (slug, heroImage, preset…)
// that is not present in the xlsx source.
//
// Invoke after migrations:
//   await seedProductCatalog(dataSource, { xlsxPath });

import type { DataSource } from 'typeorm';
import { ProductModel } from '../../domain/domain-entities/product-model.domain-entity.js';
import { VehicleSku } from '../../domain/domain-entities/vehicle-sku.domain-entity.js';
import { ProductPreset } from '../../domain/value-objects/product-preset.value-object.js';
import { TrimParserDomainService } from '../../domain/domain-services/trim-parser.domain-service.js';
import { ProductModelDbEntity } from '../db-entities/product-model.db-entity.js';
import { VehicleSkuDbEntity } from '../db-entities/vehicle-sku.db-entity.js';
import {
  ProductModelMapper,
  VehicleSkuMapper,
} from '../mappers/product-catalog.mappers.js';
import { lookupColor } from '../color-codes.map.js';
import { lookupProductConfig, normalizeModelName } from '../product-config.js';
import {
  parseVehicleGroups,
  type VehicleGroupRow,
} from '../xlsx/vehicle-groups.parser.js';

export interface SeedProductCatalogInput {
  xlsxPath?: string;
  xlsxBuffer?: Buffer;
  // When true, throws on any row error / missing color / missing config.
  // When false (default), collects warnings and continues.
  strict?: boolean;
}

export interface SeedProductCatalogReport {
  totalRows: number;
  skuCount: number;
  modelCount: number;
  unmappedColorCodes: string[];
  unknownModelNames: string[];
  lowConfidenceTrims: Array<{ rowNumber: number; trim: string; modelName: string }>;
  rowErrors: Array<{ rowNumber: number | null; message: string }>;
}

const MIN_MONTHLY_RENT_FACTOR = 0.018; // approx 36M 20k-km monthly share of price

function computeMinMonthlyRent(minSkuPrice: number): number {
  return Math.round(minSkuPrice * MIN_MONTHLY_RENT_FACTOR);
}

function buildProductModelId(slug: string): string {
  return `pm_${slug}`;
}

export async function seedProductCatalog(
  dataSource: DataSource,
  input: SeedProductCatalogInput,
): Promise<SeedProductCatalogReport> {
  if (!input.xlsxPath && !input.xlsxBuffer) {
    throw new Error('seedProductCatalog: xlsxPath or xlsxBuffer is required');
  }

  const parseInput = input.xlsxBuffer
    ? { buffer: input.xlsxBuffer }
    : { path: input.xlsxPath! };
  const { rows, errors: rowErrors } = parseVehicleGroups(parseInput);

  const trimParser = new TrimParserDomainService();

  const unmappedColorCodes = new Set<string>();
  const unknownModelNames = new Set<string>();
  const lowConfidenceTrims: SeedProductCatalogReport['lowConfidenceTrims'] = [];

  type Group = {
    configKey: string; // normalized model name
    rows: VehicleGroupRow[];
    skus: VehicleSku[];
    minPrice: number;
  };
  const groups = new Map<string, Group>();

  for (const row of rows) {
    const configKey = normalizeModelName(row.modelName);
    const config = lookupProductConfig(row.modelName);
    if (!config) {
      unknownModelNames.add(row.modelName);
      if (input.strict) {
        throw new Error(`seedProductCatalog: unknown model "${row.modelName}" (row ${row.rowNumber})`);
      }
      continue;
    }

    const color = lookupColor(row.colorCode);
    if (!color) {
      unmappedColorCodes.add(row.colorCode);
    }

    const parsed = trimParser.parse({ trim: row.trim, modelName: row.modelName });
    if (parsed.confidence === 'low') {
      lowConfidenceTrims.push({
        rowNumber: row.rowNumber,
        trim: row.trim,
        modelName: row.modelName,
      });
    }

    const vehicleType = config.vehicleTypeDefault ?? parsed.vehicleType;

    const productModelId = buildProductModelId(config.slug);
    const skuId = VehicleSku.deriveId({
      specCode: row.specCode,
      colorExteriorCode: row.colorCode,
      rowNumber: row.rowNumber,
    });
    const sku = VehicleSku.create({
      id: skuId,
      productModelId,
      specCode: row.specCode,
      modelCode: row.modelCode,
      trim: row.trim,
      vehicleType,
      displacement: parsed.displacement,
      colorExteriorCode: row.colorCode,
      colorExteriorName: color?.name ?? row.colorCode,
      colorInteriorCode: null,
      options: row.options,
      price: row.price,
      stockBucket: row.stockBucket,
      productionPeriods: row.productionPeriods,
    });

    let group = groups.get(configKey);
    if (!group) {
      group = { configKey, rows: [], skus: [], minPrice: Number.POSITIVE_INFINITY };
      groups.set(configKey, group);
    }
    group.rows.push(row);
    group.skus.push(sku);
    group.minPrice = Math.min(group.minPrice, row.price);
  }

  // Upsert in a single transaction.
  const qr = dataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();
  try {
    const modelRepo = qr.manager.getRepository(ProductModelDbEntity);
    const skuRepo = qr.manager.getRepository(VehicleSkuDbEntity);

    let skuCount = 0;
    for (const group of groups.values()) {
      const config = PRODUCT_CONFIG_OR_THROW(group.configKey);
      const preset = ProductPreset.create(config.fixedPreset);
      const productModelId = buildProductModelId(config.slug);

      const productModel = ProductModel.create({
        id: productModelId,
        slug: config.slug,
        name: firstNonEmptyModelName(group.rows),
        brandName: config.brandName,
        heroImage: config.heroImage,
        description: config.description,
        vehicleTypeDefault: config.vehicleTypeDefault ?? group.skus[0]!.vehicleType,
        fixedPreset: preset,
        minMonthlyRent: computeMinMonthlyRent(group.minPrice),
        promotionTags: config.promotionTags,
      });

      await modelRepo
        .createQueryBuilder()
        .insert()
        .values(ProductModelMapper.toOrm(productModel))
        .orUpdate(
          [
            'slug',
            'name',
            'brandName',
            'heroImage',
            'description',
            'vehicleTypeDefault',
            'presetMaintenancePackage',
            'presetMaturityOption',
            'presetWinterOption',
            'presetRegion',
            'minMonthlyRent',
            'promotionTags',
            'updatedAt',
          ],
          ['id'],
        )
        .execute();

      for (const sku of group.skus) {
        await skuRepo
          .createQueryBuilder()
          .insert()
          .values(VehicleSkuMapper.toOrm(sku))
          .orUpdate(
            [
              'productModelId',
              'specCode',
              'modelCode',
              'trim',
              'vehicleType',
              'displacement',
              'colorExteriorCode',
              'colorExteriorName',
              'colorInteriorCode',
              'options',
              'price',
              'stockBucket',
              'productionPeriods',
              'updatedAt',
            ],
            ['id'],
          )
          .execute();
        skuCount += 1;
      }
    }
    await qr.commitTransaction();

    return {
      totalRows: rows.length,
      skuCount,
      modelCount: groups.size,
      unmappedColorCodes: [...unmappedColorCodes],
      unknownModelNames: [...unknownModelNames],
      lowConfidenceTrims,
      rowErrors: rowErrors.map((e) => ({ rowNumber: e.rowNumber, message: e.message })),
    };
  } catch (err) {
    await qr.rollbackTransaction();
    throw err;
  } finally {
    await qr.release();
  }
}

function firstNonEmptyModelName(rows: VehicleGroupRow[]): string {
  for (const r of rows) {
    if (r.modelName.trim().length > 0) return r.modelName.trim();
  }
  return rows[0]?.modelName ?? 'unknown';
}

function PRODUCT_CONFIG_OR_THROW(configKey: string) {
  const config = lookupProductConfig(configKey);
  if (!config) throw new Error(`seedProductCatalog: config for "${configKey}" missing`);
  return config;
}
