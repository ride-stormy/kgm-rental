export const PRODUCT_SKU_PROVIDER = Symbol('PRODUCT_SKU_PROVIDER');

export interface ProductSkuProviderSkuPreset {
  maintenancePackage: string;
  maturityOption: string;
  winterOption: string;
  region: string;
}

export interface ProductSkuProviderPort {
  findSku(input: { skuId: string }): Promise<{
    skuId: string;
    vehicleSlug: string;
    price: number;
    vehicleType: string;
    preset: ProductSkuProviderSkuPreset;
  } | null>;

  listVehicles(input: { take: number; skip: number }): Promise<{
    items: Array<{ slug: string; name: string; price: number; isEv: boolean; isHev: boolean }>;
    total: number;
  }>;
}
