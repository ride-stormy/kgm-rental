import type { VehicleTypeCode } from '@kgm-rental/backend-libs/modules/rental-quote/domain/value-objects/sku-preset.value-object.js';
import { ProductModel } from '../../domain/domain-entities/product-model.domain-entity.js';
import { VehicleSku } from '../../domain/domain-entities/vehicle-sku.domain-entity.js';
import { ProductPreset } from '../../domain/value-objects/product-preset.value-object.js';
import { ProductModelDbEntity } from '../db-entities/product-model.db-entity.js';
import { VehicleSkuDbEntity } from '../db-entities/vehicle-sku.db-entity.js';

const toBigintString = (n: number): string => n.toString();
const parseBigint = (s: string | number): number => (typeof s === 'number' ? s : Number(s));

export class ProductModelMapper {
  static toDomain(db: ProductModelDbEntity): ProductModel {
    const preset = ProductPreset.create({
      maintenancePackage: db.presetMaintenancePackage,
      maturityOption: db.presetMaturityOption,
      winterOption: db.presetWinterOption,
      region: db.presetRegion,
    });
    return ProductModel.restore({
      id: db.id,
      slug: db.slug,
      name: db.name,
      brandName: db.brandName,
      heroImage: db.heroImage,
      description: db.description,
      vehicleTypeDefault: db.vehicleTypeDefault as VehicleTypeCode,
      fixedPreset: preset,
      minMonthlyRent: parseBigint(db.minMonthlyRent),
      promotionTags: db.promotionTags ?? [],
    });
  }

  static toOrm(domain: ProductModel): Partial<ProductModelDbEntity> {
    const preset = domain.fixedPreset.toPlain();
    return {
      id: domain.id,
      slug: domain.slug,
      name: domain.name,
      brandName: domain.brandName,
      heroImage: domain.heroImage,
      description: domain.description,
      vehicleTypeDefault: domain.vehicleTypeDefault,
      presetMaintenancePackage: preset.maintenancePackage,
      presetMaturityOption: preset.maturityOption,
      presetWinterOption: preset.winterOption,
      presetRegion: preset.region,
      minMonthlyRent: toBigintString(domain.minMonthlyRent),
      promotionTags: domain.promotionTags,
    };
  }
}

export class VehicleSkuMapper {
  static toDomain(db: VehicleSkuDbEntity): VehicleSku {
    return VehicleSku.restore({
      id: db.id,
      productModelId: db.productModelId,
      specCode: db.specCode,
      modelCode: db.modelCode,
      trim: db.trim,
      vehicleType: db.vehicleType as VehicleTypeCode,
      displacement: db.displacement,
      colorExteriorCode: db.colorExteriorCode,
      colorExteriorName: db.colorExteriorName,
      colorInteriorCode: db.colorInteriorCode,
      options: db.options ?? [],
      price: parseBigint(db.price),
      stockBucket: db.stockBucket,
      productionPeriods: db.productionPeriods ?? [],
    });
  }

  static toOrm(domain: VehicleSku): Partial<VehicleSkuDbEntity> {
    return {
      id: domain.id,
      productModelId: domain.productModelId,
      specCode: domain.specCode,
      modelCode: domain.modelCode,
      trim: domain.trim,
      vehicleType: domain.vehicleType,
      displacement: domain.displacement,
      colorExteriorCode: domain.colorExteriorCode,
      colorExteriorName: domain.colorExteriorName,
      colorInteriorCode: domain.colorInteriorCode,
      options: domain.options,
      price: toBigintString(domain.price),
      stockBucket: domain.stockBucket,
      productionPeriods: domain.productionPeriods,
    };
  }
}
