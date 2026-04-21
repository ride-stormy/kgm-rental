// Reference-data seeder — upserts the Acktyon HEV baseline dataset.
// Re-runnable: unique indexes guarantee idempotency (INSERT ... ON CONFLICT).
//
// Invoke via TypeORM after migrations:
//   const ds = new DataSource({ ... entities: [VehicleDbEntity, ...], migrations: [...] });
//   await ds.initialize();
//   await ds.runMigrations();
//   await seedReferenceData(ds);

import type { DataSource } from 'typeorm';
import { actyonHevSeed } from '../../modules/reference-data/infrastructure/seeds/actyon-hev-seed.js';
import { VehicleDbEntity } from '../../modules/reference-data/infrastructure/db-entities/vehicle.db-entity.js';
import { InterestRateDbEntity } from '../../modules/reference-data/infrastructure/db-entities/interest-rate.db-entity.js';
import { ResidualRateDbEntity } from '../../modules/reference-data/infrastructure/db-entities/residual-rate.db-entity.js';
import { DeliveryRateDbEntity } from '../../modules/reference-data/infrastructure/db-entities/delivery-rate.db-entity.js';
import { MaintenancePackageRateDbEntity } from '../../modules/reference-data/infrastructure/db-entities/maintenance-package-rate.db-entity.js';
import { InsuranceRateDbEntity } from '../../modules/reference-data/infrastructure/db-entities/insurance-rate.db-entity.js';
import { PromotionDbEntity } from '../../modules/reference-data/infrastructure/db-entities/promotion.db-entity.js';
import {
  deliveryRateMapper,
  insuranceRateMapper,
  interestRateMapper,
  maintenancePackageRateMapper,
  promotionMapper,
  residualRateMapper,
  vehicleMapper,
} from '../../modules/reference-data/infrastructure/mappers/reference-data.mappers.js';

export async function seedReferenceData(dataSource: DataSource): Promise<void> {
  const qr = dataSource.createQueryRunner();
  try {
    await qr.startTransaction();

    const vehicles = dataSource.getRepository(VehicleDbEntity);
    for (const v of actyonHevSeed.vehicles) {
      await vehicles
        .createQueryBuilder()
        .insert()
        .values(vehicleMapper.toDb(v))
        .orUpdate(['modelCode', 'specCode', 'name', 'vehicleType', 'displacement', 'price', 'priceAfterDiscount', 'acquisitionCost', 'updatedAt'], ['slug'])
        .execute();
    }

    const interest = dataSource.getRepository(InterestRateDbEntity);
    for (const r of actyonHevSeed.interestRates) {
      await interest
        .createQueryBuilder()
        .insert()
        .values(interestRateMapper.toDb(r))
        .orUpdate(['annualRate'], ['vehicleType', 'contractPeriodMonths'])
        .execute();
    }

    const residual = dataSource.getRepository(ResidualRateDbEntity);
    for (const r of actyonHevSeed.residualRates) {
      await residual
        .createQueryBuilder()
        .insert()
        .values(residualRateMapper.toDb(r))
        .orUpdate(['residualFraction'], ['vehicleType', 'contractPeriodMonths', 'annualMileageKm'])
        .execute();
    }

    const delivery = dataSource.getRepository(DeliveryRateDbEntity);
    for (const r of actyonHevSeed.deliveryRates) {
      await delivery
        .createQueryBuilder()
        .insert()
        .values(deliveryRateMapper.toDb(r))
        .orUpdate(['firstLegFee', 'secondLegFee'], ['region'])
        .execute();
    }

    const maintenance = dataSource.getRepository(MaintenancePackageRateDbEntity);
    for (const r of actyonHevSeed.maintenanceRates) {
      await maintenance
        .createQueryBuilder()
        .insert()
        .values(maintenancePackageRateMapper.toDb(r))
        .orUpdate(
          ['monthlyCost'],
          ['packageCode', 'vehicleType', 'contractPeriodMonths', 'annualMileageKm'],
        )
        .execute();
    }

    const insurance = dataSource.getRepository(InsuranceRateDbEntity);
    for (const r of actyonHevSeed.insuranceRates) {
      await insurance
        .createQueryBuilder()
        .insert()
        .values(insuranceRateMapper.toDb(r))
        .orUpdate(['annualPremium'], ['vehicleType', 'annualMileageKm', 'coverTier'])
        .execute();
    }

    const promotion = dataSource.getRepository(PromotionDbEntity);
    for (const r of actyonHevSeed.promotions) {
      await promotion
        .createQueryBuilder()
        .insert()
        .values(promotionMapper.toDb(r))
        .orUpdate(['vehicleSlug', 'vehicleType', 'amount', 'note'], ['code'])
        .execute();
    }

    await qr.commitTransaction();
  } catch (e) {
    await qr.rollbackTransaction();
    throw e;
  } finally {
    await qr.release();
  }
}
