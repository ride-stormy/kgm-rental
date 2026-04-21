import { DataSource } from 'typeorm';
import { newDb } from 'pg-mem';
import {
  APP_ENTITIES,
  APP_MIGRATIONS,
} from '@kgm-rental/backend-libs/infrastructure/database/data-source.js';

export async function buildInMemoryDataSource(): Promise<DataSource> {
  const db = newDb({ autoCreateForeignKeyIndices: true });

  db.public.registerFunction({
    name: 'version',
    implementation: () => 'pg-mem (PostgreSQL 15.0 emulation)',
  });
  db.public.registerFunction({
    name: 'current_database',
    implementation: () => 'pgmem',
  });
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
