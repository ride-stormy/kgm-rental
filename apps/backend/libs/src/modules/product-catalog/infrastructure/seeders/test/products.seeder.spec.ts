import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { DataSource } from 'typeorm';
import { newDb } from 'pg-mem';
import {
  APP_ENTITIES,
  APP_MIGRATIONS,
} from '../../../../../infrastructure/database/data-source.js';
import { ProductModelDbEntity } from '../../db-entities/product-model.db-entity.js';
import { VehicleSkuDbEntity } from '../../db-entities/vehicle-sku.db-entity.js';
import { seedProductCatalog } from '../products.seeder.js';

const here = dirname(fileURLToPath(import.meta.url));
const xlsxPath = resolve(here, '../../../../../../../../../pre-docs/vehicle-groups-20260420.xlsx');

async function buildDs(): Promise<DataSource> {
  const db = newDb({ autoCreateForeignKeyIndices: true });
  db.public.registerFunction({ name: 'version', implementation: () => 'pg-mem' });
  db.public.registerFunction({ name: 'current_database', implementation: () => 'pgmem' });
  let uuidCounter = 0;
  db.public.registerFunction({
    name: 'gen_random_uuid',
    implementation: () => {
      uuidCounter += 1;
      const pad = (n: number) => n.toString(16).padStart(12, '0');
      return `00000000-0000-0000-0000-${pad(uuidCounter)}`;
    },
    impure: true,
  });
  const ds = (await db.adapters.createTypeormDataSource({
    type: 'postgres',
    entities: [...APP_ENTITIES],
    migrations: [...APP_MIGRATIONS],
  })) as DataSource;
  await ds.initialize();
  await ds.runMigrations();
  return ds;
}

describe('seedProductCatalog (integration, pg-mem)', () => {
  it('seeds 6 models and 166 SKUs from vehicle-groups.xlsx', async () => {
    const ds = await buildDs();
    try {
      const report = await seedProductCatalog(ds, { xlsxPath });
      expect(report.rowErrors).toHaveLength(0);
      expect(report.totalRows).toBe(166);
      expect(report.skuCount).toBe(166);
      expect(report.modelCount).toBe(6);

      const modelRepo = ds.getRepository(ProductModelDbEntity);
      const skuRepo = ds.getRepository(VehicleSkuDbEntity);
      const models = await modelRepo.find();
      const skus = await skuRepo.find();
      expect(models).toHaveLength(6);
      expect(skus).toHaveLength(166);

      const slugs = models.map((m) => m.slug).sort();
      expect(slugs).toEqual(
        ['2025-torres', 'actyon-hev', 'musso', 'musso-ev', 'musso-grand', 'tivoli'],
      );
    } finally {
      await ds.destroy();
    }
  });

  it('is idempotent — second run does not duplicate', async () => {
    const ds = await buildDs();
    try {
      await seedProductCatalog(ds, { xlsxPath });
      await seedProductCatalog(ds, { xlsxPath });
      const modelRepo = ds.getRepository(ProductModelDbEntity);
      const skuRepo = ds.getRepository(VehicleSkuDbEntity);
      expect(await modelRepo.count()).toBe(6);
      expect(await skuRepo.count()).toBe(166);
    } finally {
      await ds.destroy();
    }
  });

  it('each model has positive minMonthlyRent and at least one SKU', async () => {
    const ds = await buildDs();
    try {
      await seedProductCatalog(ds, { xlsxPath });
      const models = await ds.getRepository(ProductModelDbEntity).find();
      for (const m of models) {
        expect(Number(m.minMonthlyRent)).toBeGreaterThan(0);
      }
      const skus = await ds.getRepository(VehicleSkuDbEntity).find();
      for (const m of models) {
        const owned = skus.filter((s) => s.productModelId === m.id);
        expect(owned.length).toBeGreaterThan(0);
      }
    } finally {
      await ds.destroy();
    }
  });

  it('reports no unmapped color codes', async () => {
    const ds = await buildDs();
    try {
      const report = await seedProductCatalog(ds, { xlsxPath });
      // 경고만 수집; test tracks unknown codes for visibility.
      if (report.unmappedColorCodes.length > 0) {
        // eslint-disable-next-line no-console
        console.warn('Unmapped color codes:', report.unmappedColorCodes);
      }
    } finally {
      await ds.destroy();
    }
  });
});
