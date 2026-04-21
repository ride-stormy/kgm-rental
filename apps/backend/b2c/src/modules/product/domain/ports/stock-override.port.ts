import type { VehicleSku } from '@kgm-rental/backend-libs/modules/product-catalog/domain/domain-entities/vehicle-sku.domain-entity.js';

export const STOCK_OVERRIDE_PORT = Symbol('STOCK_OVERRIDE_PORT');

// F5 (landing-and-stock) will provide a real adapter that reads live stock
// from an external inventory API and overrides the SKU's stockBucket.
// Until then, NullStockOverrideAdapter is registered as a passthrough.
export interface StockOverridePort {
  applyTo(input: { skus: VehicleSku[] }): Promise<{ skus: VehicleSku[] }>;
}
