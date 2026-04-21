import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { seedReferenceData } from '@kgm-rental/backend-libs/infrastructure/seeders/reference-data.seeder.js';
import { seedProductCatalog } from '@kgm-rental/backend-libs/modules/product-catalog/infrastructure/seeders/products.seeder.js';
import { AppModule } from './app.module.js';
import { DomainExceptionFilter } from './filters/domain-exception.filter.js';
import { ApplicationExceptionFilter } from './filters/application-exception.filter.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalFilters(new DomainExceptionFilter(), new ApplicationExceptionFilter());
  app.setGlobalPrefix('api');

  const ds = app.get(DataSource);
  if (process.env.DB_RUN_MIGRATIONS === 'true' && ds.isInitialized) {
    await ds.runMigrations();
  }
  if (process.env.DB_SEED_REFERENCE === 'true' && ds.isInitialized) {
    await seedReferenceData(ds);
  }
  if (process.env.DB_SEED_PRODUCTS === 'true' && ds.isInitialized) {
    const xlsxPath = process.env.VEHICLE_GROUPS_XLSX_PATH;
    if (!xlsxPath) throw new Error('VEHICLE_GROUPS_XLSX_PATH is required when DB_SEED_PRODUCTS=true');
    await seedProductCatalog(ds, { xlsxPath });
  }

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`[b2c] listening on :${port}`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[b2c] bootstrap failed', err);
  process.exit(1);
});
