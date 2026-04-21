// In-app translators: Domain entities → api-contracts DTO shapes.
// Kept inside the application layer because the output format is a
// Presentation/Application concern, not a Domain concern.

import type { ProductModel } from '@kgm-rental/backend-libs/modules/product-catalog/domain/domain-entities/product-model.domain-entity.js';
import type { VehicleSku } from '@kgm-rental/backend-libs/modules/product-catalog/domain/domain-entities/vehicle-sku.domain-entity.js';
import type { ProductCard } from '@kgm-rental/api-contracts/product/product-card.schema.js';
import type { ProductDetail } from '@kgm-rental/api-contracts/product/product-detail.schema.js';
import type { VehicleSkuDto } from '@kgm-rental/api-contracts/product/vehicle-sku.schema.js';
import { lookupColor } from '@kgm-rental/backend-libs/modules/product-catalog/infrastructure/color-codes.map.js';

export function skuToDto(sku: VehicleSku): VehicleSkuDto {
  return {
    id: sku.id,
    productModelId: sku.productModelId,
    specCode: sku.specCode,
    modelCode: sku.modelCode,
    trim: sku.trim,
    vehicleType: sku.vehicleType,
    displacement: sku.displacement,
    colorExteriorCode: sku.colorExteriorCode,
    colorExteriorName: sku.colorExteriorName,
    colorInteriorCode: sku.colorInteriorCode,
    options: sku.options,
    price: sku.price,
    stockBucket: sku.stockBucket,
    productionPeriods: sku.productionPeriods,
  };
}

function buildSwatch(skus: VehicleSku[]): ProductCard['colorSwatch'] {
  const seen = new Map<string, ProductCard['colorSwatch'][number]>();
  for (const s of skus) {
    if (seen.has(s.colorExteriorCode)) continue;
    const color = lookupColor(s.colorExteriorCode);
    seen.set(s.colorExteriorCode, {
      code: s.colorExteriorCode,
      name: s.colorExteriorName,
      hex: color?.hex ?? null,
    });
  }
  return [...seen.values()];
}

export function modelToCard(model: ProductModel, skus: VehicleSku[]): ProductCard {
  return {
    id: model.id,
    slug: model.slug,
    name: model.name,
    brandName: model.brandName,
    heroImage: model.heroImage,
    vehicleTypeDefault: model.vehicleTypeDefault,
    minMonthlyRent: model.minMonthlyRent,
    colorSwatch: buildSwatch(skus),
    promotionTags: model.promotionTags,
  };
}

export function modelToDetail(model: ProductModel, skus: VehicleSku[]): ProductDetail {
  return {
    ...modelToCard(model, skus),
    description: model.description,
    fixedPreset: model.fixedPreset.toPlain(),
    skus: skus.map(skuToDto),
  };
}
