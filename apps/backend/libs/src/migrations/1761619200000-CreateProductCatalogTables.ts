import { MigrationInterface, QueryRunner } from 'typeorm';

// Creates product_model + vehicle_sku tables for F3 (product-catalog).
// Idempotent insert pattern relies on PK id; application seeder uses
// INSERT ... ON CONFLICT DO UPDATE via TypeORM QueryBuilder.

export class CreateProductCatalogTables1761619200000 implements MigrationInterface {
  name = 'CreateProductCatalogTables1761619200000';

  async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      CREATE TABLE "product_model" (
        "id" varchar(40) PRIMARY KEY,
        "slug" varchar(64) NOT NULL,
        "name" varchar(128) NOT NULL,
        "brandName" varchar(64) NOT NULL,
        "heroImage" varchar(512) NOT NULL,
        "description" text NOT NULL,
        "vehicleTypeDefault" varchar(16) NOT NULL,
        "presetMaintenancePackage" varchar(32) NOT NULL,
        "presetMaturityOption" varchar(32) NOT NULL,
        "presetWinterOption" varchar(32) NOT NULL,
        "presetRegion" varchar(32) NOT NULL,
        "minMonthlyRent" bigint NOT NULL,
        "promotionTags" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "createdAt" timestamptz NOT NULL DEFAULT NOW(),
        "updatedAt" timestamptz NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(
      `CREATE UNIQUE INDEX "uq_product_model_slug" ON "product_model" ("slug")`,
    );

    await qr.query(`
      CREATE TABLE "vehicle_sku" (
        "id" varchar(64) PRIMARY KEY,
        "productModelId" varchar(40) NOT NULL,
        "specCode" varchar(32) NOT NULL,
        "modelCode" varchar(32) NOT NULL,
        "trim" varchar(128) NOT NULL,
        "vehicleType" varchar(16) NOT NULL,
        "displacement" int NOT NULL,
        "colorExteriorCode" varchar(16) NOT NULL,
        "colorExteriorName" varchar(64) NOT NULL,
        "colorInteriorCode" varchar(16) NULL,
        "options" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "price" bigint NOT NULL,
        "stockBucket" int NOT NULL,
        "productionPeriods" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "createdAt" timestamptz NOT NULL DEFAULT NOW(),
        "updatedAt" timestamptz NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(
      `CREATE INDEX "idx_vehicle_sku_product_model" ON "vehicle_sku" ("productModelId")`,
    );
    await qr.query(
      `CREATE INDEX "idx_vehicle_sku_spec_code" ON "vehicle_sku" ("specCode")`,
    );
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`DROP INDEX IF EXISTS "idx_vehicle_sku_spec_code"`);
    await qr.query(`DROP INDEX IF EXISTS "idx_vehicle_sku_product_model"`);
    await qr.query(`DROP TABLE IF EXISTS "vehicle_sku"`);
    await qr.query(`DROP INDEX IF EXISTS "uq_product_model_slug"`);
    await qr.query(`DROP TABLE IF EXISTS "product_model"`);
  }
}
