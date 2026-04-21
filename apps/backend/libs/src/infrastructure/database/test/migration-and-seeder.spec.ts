// DB migration + seeder integration test using pg-mem (in-memory Postgres).
// Validates that:
//  1. The migration's CREATE TABLE DDL is valid SQL
//  2. The seeder successfully UPSERTs the Acktyon HEV dataset
//  3. Rows can be read back and map to domain types
//  4. Re-running the seeder is idempotent (no duplicate-key violations)

import { describe, it, expect } from 'vitest';
import { newDb } from 'pg-mem';
import { DataSource } from 'typeorm';
import { REFERENCE_DATA_ENTITIES } from '../data-source.js';
import { CreateReferenceDataTables1761019200000 } from '../../../migrations/1761019200000-CreateReferenceDataTables.js';
import { seedReferenceData } from '../../seeders/reference-data.seeder.js';
import { VehicleDbEntity } from '../../../modules/reference-data/infrastructure/db-entities/vehicle.db-entity.js';
import { InterestRateDbEntity } from '../../../modules/reference-data/infrastructure/db-entities/interest-rate.db-entity.js';
import { ResidualRateDbEntity } from '../../../modules/reference-data/infrastructure/db-entities/residual-rate.db-entity.js';

async function buildInMemoryDataSource(): Promise<DataSource> {
  const db = newDb({ autoCreateForeignKeyIndices: true });

  // pg-mem ships with very few native functions; register the ones TypeORM
  // invokes during initialize() and migrations.
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
    entities: [...REFERENCE_DATA_ENTITIES],
    migrations: [CreateReferenceDataTables1761019200000],
  })) as DataSource;
  await ds.initialize();
  return ds;
}

describe('Reference-data migration + seeder (pg-mem)', () => {
  it('migration creates all 7 tables', async () => {
    const ds = await buildInMemoryDataSource();
    try {
      await ds.runMigrations();
      const tables = await ds.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`,
      );
      const names = tables.map((t: { table_name: string }) => t.table_name);
      expect(names).toEqual(
        expect.arrayContaining([
          'reference_vehicle',
          'reference_interest_rate',
          'reference_residual_rate',
          'reference_delivery_rate',
          'reference_maintenance_package_rate',
          'reference_insurance_rate',
          'reference_promotion',
        ]),
      );
    } finally {
      await ds.destroy();
    }
  });

  it('seeder upserts Acktyon HEV row and is idempotent', async () => {
    const ds = await buildInMemoryDataSource();
    try {
      await ds.runMigrations();

      // First seed
      await seedReferenceData(ds);
      const v1 = await ds.getRepository(VehicleDbEntity).findOneByOrFail({ slug: 'actyon-hev' });
      expect(v1.name).toBe('액티언 1.5T HEV');
      expect(Number(v1.price)).toBe(40690000);

      // Second seed (idempotent via ON CONFLICT DO UPDATE)
      await seedReferenceData(ds);
      const vehicleCount = await ds.getRepository(VehicleDbEntity).count();
      expect(vehicleCount).toBe(1);

      // Reference rows exist
      const interestCount = await ds.getRepository(InterestRateDbEntity).count();
      expect(interestCount).toBe(4); // 24/36/48/60 months

      const residualCount = await ds.getRepository(ResidualRateDbEntity).count();
      expect(residualCount).toBe(20); // 4 periods × 5 mileages
    } finally {
      await ds.destroy();
    }
  });
});
