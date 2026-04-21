import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { resolve } from 'node:path';
import request from 'supertest';
import { seedProductCatalog } from '@kgm-rental/backend-libs/modules/product-catalog/infrastructure/seeders/products.seeder.js';

import { AppModule } from '../src/app.module.js';
import { DomainExceptionFilter } from '../src/filters/domain-exception.filter.js';
import { ApplicationExceptionFilter } from '../src/filters/application-exception.filter.js';
import { buildInMemoryDataSource } from './pg-mem-datasource.js';
import { ListProductsResponseSchema } from '@kgm-rental/api-contracts/product/product-card.schema.js';
import { ProductDetailResponseSchema } from '@kgm-rental/api-contracts/product/product-detail.schema.js';
import { SkuDetailResponseSchema } from '@kgm-rental/api-contracts/product/vehicle-sku.schema.js';

// CWD during jest is apps/backend/b2c — resolve the xlsx relative to it.
const xlsxPath = resolve(process.cwd(), '../../../pre-docs/vehicle-groups-20260420.xlsx');

describe('Product API (e2e)', () => {
  let app: INestApplication;
  let ds: DataSource;

  beforeAll(async () => {
    ds = await buildInMemoryDataSource();
    await seedProductCatalog(ds, { xlsxPath });

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

  describe('GET /api/products', () => {
    it('returns 6 product cards with color swatches and promotion tags', async () => {
      const res = await request(app.getHttpServer()).get('/api/products');
      expect(res.status).toBe(200);
      const parsed = ListProductsResponseSchema.parse(res.body);
      expect(parsed.success).toBe(true);
      expect(parsed.data?.items).toHaveLength(6);
      const slugs = parsed.data!.items.map((i) => i.slug).sort();
      expect(slugs).toEqual(
        ['2025-torres', 'actyon-hev', 'musso', 'musso-ev', 'musso-grand', 'tivoli'],
      );
      for (const card of parsed.data!.items) {
        expect(card.minMonthlyRent).toBeGreaterThan(0);
        expect(card.colorSwatch.length).toBeGreaterThan(0);
      }
    });
  });

  describe('GET /api/products/:modelSlug', () => {
    it('returns full detail with SKUs for 2025-torres', async () => {
      const res = await request(app.getHttpServer()).get('/api/products/2025-torres');
      expect(res.status).toBe(200);
      const parsed = ProductDetailResponseSchema.parse(res.body);
      expect(parsed.data?.slug).toBe('2025-torres');
      expect(parsed.data?.skus.length).toBeGreaterThan(0);
      expect(parsed.data?.fixedPreset.region).toBe('서울/경기/인천');
    });

    it('returns 404 for an unknown slug', async () => {
      const res = await request(app.getHttpServer()).get('/api/products/does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body.error?.code).toBe('PRODUCT_NOT_FOUND');
    });
  });

  describe('GET /api/products/:modelSlug/skus/:skuId', () => {
    it('returns a single SKU when valid', async () => {
      const list = await request(app.getHttpServer()).get('/api/products/2025-torres');
      const firstSkuId = list.body.data.skus[0].id as string;

      const res = await request(app.getHttpServer()).get(
        `/api/products/2025-torres/skus/${encodeURIComponent(firstSkuId)}`,
      );
      expect(res.status).toBe(200);
      const parsed = SkuDetailResponseSchema.parse(res.body);
      expect(parsed.data?.id).toBe(firstSkuId);
    });

    it('returns 404 SKU_NOT_FOUND when SKU does not belong to the model', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/products/2025-torres/skus/not-a-real-sku',
      );
      expect(res.status).toBe(404);
      expect(res.body.error?.code).toBe('SKU_NOT_FOUND');
    });

    it('returns 404 PRODUCT_NOT_FOUND when model slug is unknown', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/products/unknown/skus/anything',
      );
      expect(res.status).toBe(404);
      expect(res.body.error?.code).toBe('PRODUCT_NOT_FOUND');
    });
  });
});
