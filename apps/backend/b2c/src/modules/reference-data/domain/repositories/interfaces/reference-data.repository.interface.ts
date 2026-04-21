import type { ReferenceDataset } from '@kgm-rental/backend-libs/modules/reference-data/domain/domain-entities/reference-data.types.js';

export interface ReferenceDataRepositoryPort {
  loadByVehicleSlug(input: { vehicleSlug: string }): Promise<{ dataset: ReferenceDataset | null }>;
  listVehicles(input: { take: number; skip: number }): Promise<{
    items: Array<{ slug: string; name: string; price: number; vehicleType: string }>;
    total: number;
  }>;
  findVehicleBySlug(input: { slug: string }): Promise<{
    slug: string;
    name: string;
    vehicleType: string;
    price: number;
  } | null>;
}
