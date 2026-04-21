import type { DataSourceOptions } from 'typeorm';
import { buildReferenceDataSource } from '@kgm-rental/backend-libs/infrastructure/database/data-source.js';

export function buildAppDataSourceOptions(): DataSourceOptions {
  const ds = buildReferenceDataSource({
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number(process.env.POSTGRES_PORT ?? 5432),
    username: process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD ?? 'postgres',
    database: process.env.POSTGRES_DB ?? 'kgm_rental',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.NODE_ENV !== 'production',
  });
  return ds.options;
}
