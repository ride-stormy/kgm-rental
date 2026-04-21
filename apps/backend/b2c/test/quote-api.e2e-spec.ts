import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { resolve } from 'node:path';
import request from 'supertest';
import { seedReferenceData } from '@kgm-rental/backend-libs/infrastructure/seeders/reference-data.seeder.js';
import { seedProductCatalog } from '@kgm-rental/backend-libs/modules/product-catalog/infrastructure/seeders/products.seeder.js';
import { VehicleSkuDbEntity } from '@kgm-rental/backend-libs/modules/product-catalog/infrastructure/db-entities/vehicle-sku.db-entity.js';
import { ProductModelDbEntity } from '@kgm-rental/backend-libs/modules/product-catalog/infrastructure/db-entities/product-model.db-entity.js';

import { AppModule } from '../src/app.module.js';
import { DomainExceptionFilter } from '../src/filters/domain-exception.filter.js';
import { ApplicationExceptionFilter } from '../src/filters/application-exception.filter.js';
import { buildInMemoryDataSource } from './pg-mem-datasource.js';

const xlsxPath = resolve(process.cwd(), '../../../pre-docs/vehicle-groups-20260420.xlsx');

interface GoldenCase {
  name: string;
  body: {
    contractPeriod: number;
    annualMileage: number;
    prepaidRate: number;
    depositRate: number;
  };
  expected: Partial<{
    standardRent: number;
    prepaidDeduction: number;
    finalMonthlyRent: number;
    residualValue: number;
    prepaidAmount: number;
    depositAmount: number;
    initialBurden: number;
  }>;
  source: 'xlsm-1원일치' | 'regression';
}

const GOLDEN_CASES: GoldenCase[] = [
  {
    name: 'actyon-hev 36M/20k/30/0 (xlsm)',
    body: { contractPeriod: 36, annualMileage: 20000, prepaidRate: 30, depositRate: 0 },
    expected: {
      standardRent: 528220,
      prepaidDeduction: -339080,
      finalMonthlyRent: 189140,
      residualValue: 29297000,
      prepaidAmount: 12207000,
      depositAmount: 0,
      initialBurden: 12207000,
    },
    source: 'xlsm-1원일치',
  },
  {
    name: 'actyon-hev 36M/20k/0/0 (no prepaid)',
    body: { contractPeriod: 36, annualMileage: 20000, prepaidRate: 0, depositRate: 0 },
    expected: {
      finalMonthlyRent: 528220,
      prepaidAmount: 0,
      depositAmount: 0,
      prepaidDeduction: 0,
    },
    source: 'regression',
  },
  {
    name: 'actyon-hev 48M/15k/20/10',
    body: { contractPeriod: 48, annualMileage: 15000, prepaidRate: 20, depositRate: 10 },
    expected: {},
    source: 'regression',
  },
];

describe('Quote API (e2e)', () => {
  let app: INestApplication;
  let ds: DataSource;
  let actyonHevSkuId: string;

  beforeAll(async () => {
    ds = await buildInMemoryDataSource();
    await seedReferenceData(ds);
    await seedProductCatalog(ds, { xlsxPath });

    // Pick the first SKU that belongs to the actyon-hev model for golden tests.
    const model = await ds
      .getRepository(ProductModelDbEntity)
      .findOne({ where: { slug: 'actyon-hev' } });
    if (!model) throw new Error('e2e setup: actyon-hev product model missing');
    const sku = await ds
      .getRepository(VehicleSkuDbEntity)
      .findOne({ where: { productModelId: model.id } });
    if (!sku) throw new Error('e2e setup: no SKU seeded for actyon-hev');
    actyonHevSkuId = sku.id;

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useValue(ds)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new DomainExceptionFilter(), new ApplicationExceptionFilter());
    app.setGlobalPrefix('api');
    await app.init();
  }, 60000);

  afterAll(async () => {
    await app?.close();
    if (ds?.isInitialized) await ds.destroy();
  });

  describe('POST /api/quotes/calculate', () => {
    it('returns 400 ZOD_VALIDATION for invalid contractPeriod', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/quotes/calculate')
        .send({
          skuId: actyonHevSkuId,
          contractPeriod: 999,
          annualMileage: 20000,
          prepaidRate: 0,
          depositRate: 0,
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error?.code).toBe('ZOD_VALIDATION');
    });

    it('returns 400 for prepaidRate > 30 (zod rejects union)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/quotes/calculate')
        .send({
          skuId: actyonHevSkuId,
          contractPeriod: 36,
          annualMileage: 20000,
          prepaidRate: 50,
          depositRate: 0,
        });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 404 VEHICLE_NOT_FOUND for missing SKU', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/quotes/calculate')
        .send({
          skuId: 'nonexistent-sku',
          contractPeriod: 36,
          annualMileage: 20000,
          prepaidRate: 0,
          depositRate: 0,
        });
      expect(res.status).toBe(404);
      expect(res.body.error?.code).toBe('VEHICLE_NOT_FOUND');
    });

    it.each(GOLDEN_CASES)('golden: $name [$source]', async (gc) => {
      const res = await request(app.getHttpServer())
        .post('/api/quotes/calculate')
        .send({ skuId: actyonHevSkuId, ...gc.body });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const b = res.body.data;
      expect(b).toBeDefined();
      for (const [k, v] of Object.entries(gc.expected)) {
        expect(b[k]).toBe(v);
      }
      for (const f of [
        'standardRent',
        'discountTotal',
        'prepaidDeduction',
        'finalMonthlyRent',
        'residualValue',
        'prepaidAmount',
        'depositAmount',
        'initialBurden',
        'supplyPrice',
        'vat',
      ]) {
        expect(b).toHaveProperty(f);
        expect(Number.isInteger(b[f])).toBe(true);
      }
    });
  });

  describe('GET /api/quotes/residual-value', () => {
    it('returns residualValue for actyon-hev 36/20000', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/quotes/residual-value')
        .query({ skuId: actyonHevSkuId, contractPeriod: 36, annualMileage: 20000 });
      expect(res.status).toBe(200);
      expect(res.body.data?.residualValue).toBe(29297000);
    });
  });

  describe('GET /api/vehicles', () => {
    it('lists SKUs from product catalog', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/vehicles')
        .query({ take: 10, skip: 0 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data?.total).toBeGreaterThan(0);
    });
  });
});
