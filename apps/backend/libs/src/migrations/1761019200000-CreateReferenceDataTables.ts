import { MigrationInterface, QueryRunner } from 'typeorm';

// Creates 7 reference-data tables used by the rental-quote domain.
// Idempotent: safe to re-run via TypeORM migration runner (raises error only
// when tables already exist; use `migration:revert` first to reset).

export class CreateReferenceDataTables1761019200000 implements MigrationInterface {
  name = 'CreateReferenceDataTables1761019200000';

  async up(qr: QueryRunner): Promise<void> {
    // Vehicle
    await qr.query(`
      CREATE TABLE "reference_vehicle" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "slug" varchar(64) NOT NULL,
        "modelCode" varchar(32) NOT NULL,
        "specCode" varchar(32) NOT NULL,
        "name" varchar(128) NOT NULL,
        "vehicleType" varchar(16) NOT NULL,
        "displacement" int NOT NULL,
        "price" bigint NOT NULL,
        "priceAfterDiscount" bigint NOT NULL,
        "acquisitionCost" numeric(14,2) NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT NOW(),
        "updatedAt" timestamptz NOT NULL DEFAULT NOW()
      )
    `);
    await qr.query(
      `CREATE UNIQUE INDEX "uq_reference_vehicle_slug" ON "reference_vehicle" ("slug")`,
    );

    // InterestRate
    await qr.query(`
      CREATE TABLE "reference_interest_rate" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "vehicleType" varchar(16) NOT NULL,
        "contractPeriodMonths" int NOT NULL,
        "annualRate" numeric(10,8) NOT NULL
      )
    `);
    await qr.query(
      `CREATE UNIQUE INDEX "uq_interest_rate_type_period" ON "reference_interest_rate" ("vehicleType", "contractPeriodMonths")`,
    );

    // ResidualRate
    await qr.query(`
      CREATE TABLE "reference_residual_rate" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "vehicleType" varchar(16) NOT NULL,
        "contractPeriodMonths" int NOT NULL,
        "annualMileageKm" int NOT NULL,
        "residualFraction" numeric(5,4) NOT NULL
      )
    `);
    await qr.query(
      `CREATE UNIQUE INDEX "uq_residual_rate_type_period_mileage" ON "reference_residual_rate" ("vehicleType", "contractPeriodMonths", "annualMileageKm")`,
    );

    // DeliveryRate
    await qr.query(`
      CREATE TABLE "reference_delivery_rate" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "region" varchar(32) NOT NULL,
        "firstLegFee" int NOT NULL,
        "secondLegFee" int NOT NULL
      )
    `);
    await qr.query(
      `CREATE UNIQUE INDEX "uq_delivery_rate_region" ON "reference_delivery_rate" ("region")`,
    );

    // MaintenancePackageRate
    await qr.query(`
      CREATE TABLE "reference_maintenance_package_rate" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "packageCode" varchar(16) NOT NULL,
        "vehicleType" varchar(16) NOT NULL,
        "contractPeriodMonths" int NOT NULL,
        "annualMileageKm" int NOT NULL,
        "monthlyCost" int NOT NULL
      )
    `);
    await qr.query(
      `CREATE UNIQUE INDEX "uq_maint_pkg_code_type_period_mileage" ON "reference_maintenance_package_rate" ("packageCode", "vehicleType", "contractPeriodMonths", "annualMileageKm")`,
    );

    // InsuranceRate
    await qr.query(`
      CREATE TABLE "reference_insurance_rate" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "vehicleType" varchar(16) NOT NULL,
        "annualMileageKm" int NOT NULL,
        "coverTier" varchar(32) NOT NULL,
        "annualPremium" int NOT NULL
      )
    `);
    await qr.query(
      `CREATE UNIQUE INDEX "uq_insurance_rate_type_mileage_tier" ON "reference_insurance_rate" ("vehicleType", "annualMileageKm", "coverTier")`,
    );

    // Promotion
    await qr.query(`
      CREATE TABLE "reference_promotion" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" varchar(64) NOT NULL,
        "vehicleSlug" varchar(64),
        "vehicleType" varchar(16),
        "amount" int NOT NULL,
        "note" text
      )
    `);
    await qr.query(
      `CREATE UNIQUE INDEX "uq_promotion_code" ON "reference_promotion" ("code")`,
    );
  }

  async down(qr: QueryRunner): Promise<void> {
    await qr.query(`DROP TABLE IF EXISTS "reference_promotion"`);
    await qr.query(`DROP TABLE IF EXISTS "reference_insurance_rate"`);
    await qr.query(`DROP TABLE IF EXISTS "reference_maintenance_package_rate"`);
    await qr.query(`DROP TABLE IF EXISTS "reference_delivery_rate"`);
    await qr.query(`DROP TABLE IF EXISTS "reference_residual_rate"`);
    await qr.query(`DROP TABLE IF EXISTS "reference_interest_rate"`);
    await qr.query(`DROP TABLE IF EXISTS "reference_vehicle"`);
  }
}
