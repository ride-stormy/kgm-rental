import type { VehicleSkuDto } from '@kgm-rental/api-contracts/product/vehicle-sku.schema.js';

export interface GetSkuDetailServiceInput {
  modelSlug: string;
  skuId: string;
}

export interface GetSkuDetailServiceOutput {
  sku: VehicleSkuDto;
}
