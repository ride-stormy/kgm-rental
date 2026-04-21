import { Inject, Injectable } from '@nestjs/common';
import {
  PRODUCT_SKU_PROVIDER,
  type ProductSkuProviderPort,
} from '../ports/product-sku-provider.port.js';
import type {
  ListVehiclesServiceInput,
  ListVehiclesServiceOutput,
  ListVehiclesServicePort,
} from './interfaces/list-vehicles.service.interface.js';

@Injectable()
export class ListVehiclesService implements ListVehiclesServicePort {
  constructor(
    @Inject(PRODUCT_SKU_PROVIDER)
    private readonly skuProvider: ProductSkuProviderPort,
  ) {}

  async execute(input: ListVehiclesServiceInput): Promise<ListVehiclesServiceOutput> {
    return this.skuProvider.listVehicles(input);
  }
}
