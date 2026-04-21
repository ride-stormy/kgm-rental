import { Inject, Injectable } from '@nestjs/common';
import type { ReferenceDataset } from '@kgm-rental/backend-libs/modules/reference-data/domain/domain-entities/reference-data.types.js';
import type { ReferenceDataReaderPort } from '../../../rental-quote/application/ports/reference-data-reader.port.js';
import {
  REFERENCE_DATA_REPOSITORY,
  type ReferenceDataRepositoryPort,
} from '../../domain/repositories/reference-data.repository.js';

@Injectable()
export class ReferenceDataReaderAdapter implements ReferenceDataReaderPort {
  constructor(
    @Inject(REFERENCE_DATA_REPOSITORY)
    private readonly repo: ReferenceDataRepositoryPort,
  ) {}

  async loadDataset(input: { vehicleSlug: string }): Promise<{ dataset: ReferenceDataset | null }> {
    return this.repo.loadByVehicleSlug({ vehicleSlug: input.vehicleSlug });
  }
}
