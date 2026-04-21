import { Injectable } from '@nestjs/common';
import type { StockOverridePort } from '../../domain/ports/stock-override.port.js';
import type { VehicleSku } from '@kgm-rental/backend-libs/modules/product-catalog/domain/domain-entities/vehicle-sku.domain-entity.js';

// Passthrough stock adapter used until F5 wires in real-time inventory.
@Injectable()
export class NullStockOverrideAdapter implements StockOverridePort {
  async applyTo(input: { skus: VehicleSku[] }): Promise<{ skus: VehicleSku[] }> {
    return { skus: input.skus };
  }
}
