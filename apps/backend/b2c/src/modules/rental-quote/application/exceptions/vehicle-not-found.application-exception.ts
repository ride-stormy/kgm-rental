export class VehicleNotFoundApplicationException extends Error {
  public readonly code = 'VEHICLE_NOT_FOUND' as const;
  constructor(public readonly skuId: string) {
    super(`Vehicle not found for SKU: ${skuId}`);
    this.name = 'VehicleNotFoundApplicationException';
  }
}
