import type { VehicleSummary } from '@kgm-rental/api-contracts/rental-quote/list-vehicles.schema.js';

export interface ListVehiclesServiceInput {
  take: number;
  skip: number;
}

export interface ListVehiclesServiceOutput {
  items: VehicleSummary[];
  total: number;
}

export interface ListVehiclesServicePort {
  execute(input: ListVehiclesServiceInput): Promise<ListVehiclesServiceOutput>;
}
