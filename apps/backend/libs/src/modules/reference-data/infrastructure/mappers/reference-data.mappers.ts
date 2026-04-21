// Mappers between TypeORM DB entities and domain reference-data types.
// Numeric/bigint strings from PostgreSQL are parsed back to JS numbers.

import { VehicleDbEntity } from '../db-entities/vehicle.db-entity.js';
import { InterestRateDbEntity } from '../db-entities/interest-rate.db-entity.js';
import { ResidualRateDbEntity } from '../db-entities/residual-rate.db-entity.js';
import { DeliveryRateDbEntity } from '../db-entities/delivery-rate.db-entity.js';
import { MaintenancePackageRateDbEntity } from '../db-entities/maintenance-package-rate.db-entity.js';
import { InsuranceRateDbEntity } from '../db-entities/insurance-rate.db-entity.js';
import { PromotionDbEntity } from '../db-entities/promotion.db-entity.js';
import type {
  DeliveryRateRow,
  InsuranceRateRow,
  InterestRateRow,
  MaintenancePackageRateRow,
  PromotionRow,
  ResidualRateRow,
  Vehicle,
} from '../../domain/domain-entities/reference-data.types.js';
import type {
  MaintenancePackageCode,
  RegionCode,
  VehicleTypeCode,
} from '../../../rental-quote/domain/value-objects/sku-preset.value-object.js';

const n = (s: string | number): number => (typeof s === 'number' ? s : Number(s));

export const vehicleMapper = {
  toDomain(db: VehicleDbEntity): Vehicle {
    return {
      slug: db.slug,
      modelCode: db.modelCode,
      specCode: db.specCode,
      name: db.name,
      vehicleType: db.vehicleType as VehicleTypeCode,
      displacement: db.displacement,
      price: n(db.price),
      priceAfterDiscount: n(db.priceAfterDiscount),
      acquisitionCost: n(db.acquisitionCost),
    };
  },
  toDb(d: Vehicle): Partial<VehicleDbEntity> {
    return {
      slug: d.slug,
      modelCode: d.modelCode,
      specCode: d.specCode,
      name: d.name,
      vehicleType: d.vehicleType,
      displacement: d.displacement,
      price: String(d.price),
      priceAfterDiscount: String(d.priceAfterDiscount),
      acquisitionCost: String(d.acquisitionCost),
    };
  },
};

export const interestRateMapper = {
  toDomain(db: InterestRateDbEntity): InterestRateRow {
    return {
      vehicleType: db.vehicleType as VehicleTypeCode,
      contractPeriodMonths: db.contractPeriodMonths,
      annualRate: n(db.annualRate),
    };
  },
  toDb(d: InterestRateRow): Partial<InterestRateDbEntity> {
    return {
      vehicleType: d.vehicleType,
      contractPeriodMonths: d.contractPeriodMonths,
      annualRate: String(d.annualRate),
    };
  },
};

export const residualRateMapper = {
  toDomain(db: ResidualRateDbEntity): ResidualRateRow {
    return {
      vehicleType: db.vehicleType as VehicleTypeCode,
      contractPeriodMonths: db.contractPeriodMonths,
      annualMileageKm: db.annualMileageKm,
      residualFraction: n(db.residualFraction),
    };
  },
  toDb(d: ResidualRateRow): Partial<ResidualRateDbEntity> {
    return {
      vehicleType: d.vehicleType,
      contractPeriodMonths: d.contractPeriodMonths,
      annualMileageKm: d.annualMileageKm,
      residualFraction: String(d.residualFraction),
    };
  },
};

export const deliveryRateMapper = {
  toDomain(db: DeliveryRateDbEntity): DeliveryRateRow {
    return {
      region: db.region as RegionCode,
      firstLegFee: db.firstLegFee,
      secondLegFee: db.secondLegFee,
    };
  },
  toDb(d: DeliveryRateRow): Partial<DeliveryRateDbEntity> {
    return {
      region: d.region,
      firstLegFee: d.firstLegFee,
      secondLegFee: d.secondLegFee,
    };
  },
};

export const maintenancePackageRateMapper = {
  toDomain(db: MaintenancePackageRateDbEntity): MaintenancePackageRateRow {
    return {
      packageCode: db.packageCode as MaintenancePackageCode,
      vehicleType: db.vehicleType as VehicleTypeCode,
      contractPeriodMonths: db.contractPeriodMonths,
      annualMileageKm: db.annualMileageKm,
      monthlyCost: db.monthlyCost,
    };
  },
  toDb(d: MaintenancePackageRateRow): Partial<MaintenancePackageRateDbEntity> {
    return {
      packageCode: d.packageCode,
      vehicleType: d.vehicleType,
      contractPeriodMonths: d.contractPeriodMonths,
      annualMileageKm: d.annualMileageKm,
      monthlyCost: d.monthlyCost,
    };
  },
};

export const insuranceRateMapper = {
  toDomain(db: InsuranceRateDbEntity): InsuranceRateRow {
    return {
      vehicleType: db.vehicleType as VehicleTypeCode,
      annualMileageKm: db.annualMileageKm,
      coverTier: db.coverTier,
      annualPremium: db.annualPremium,
    };
  },
  toDb(d: InsuranceRateRow): Partial<InsuranceRateDbEntity> {
    return {
      vehicleType: d.vehicleType,
      annualMileageKm: d.annualMileageKm,
      coverTier: d.coverTier,
      annualPremium: d.annualPremium,
    };
  },
};

export const promotionMapper = {
  toDomain(db: PromotionDbEntity): PromotionRow {
    const row: PromotionRow = {
      code: db.code,
      amount: db.amount,
    };
    if (db.vehicleSlug) row.vehicleSlug = db.vehicleSlug;
    if (db.vehicleType) row.vehicleType = db.vehicleType as VehicleTypeCode;
    if (db.note) row.note = db.note;
    return row;
  },
  toDb(d: PromotionRow): Partial<PromotionDbEntity> {
    return {
      code: d.code,
      vehicleSlug: d.vehicleSlug ?? null,
      vehicleType: d.vehicleType ?? null,
      amount: d.amount,
      note: d.note ?? null,
    };
  },
};
