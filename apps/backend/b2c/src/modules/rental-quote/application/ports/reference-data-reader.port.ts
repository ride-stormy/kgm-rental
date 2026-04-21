import type { ReferenceDataset } from '@kgm-rental/backend-libs/modules/reference-data/domain/domain-entities/reference-data.types.js';

export const REFERENCE_DATA_READER = Symbol('REFERENCE_DATA_READER');

export interface ReferenceDataReaderPort {
  loadDataset(input: { vehicleSlug: string }): Promise<{ dataset: ReferenceDataset | null }>;
}
