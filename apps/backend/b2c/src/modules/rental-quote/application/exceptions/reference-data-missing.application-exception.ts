export class ReferenceDataMissingApplicationException extends Error {
  public readonly code = 'REFERENCE_DATA_MISSING' as const;
  constructor(public readonly vehicleSlug: string) {
    super(`Reference data missing for vehicle: ${vehicleSlug}`);
    this.name = 'ReferenceDataMissingApplicationException';
  }
}
