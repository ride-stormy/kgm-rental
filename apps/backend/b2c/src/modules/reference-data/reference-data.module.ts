import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VehicleDbEntity } from '@kgm-rental/backend-libs/modules/reference-data/infrastructure/db-entities/vehicle.db-entity.js';
import { InterestRateDbEntity } from '@kgm-rental/backend-libs/modules/reference-data/infrastructure/db-entities/interest-rate.db-entity.js';
import { ResidualRateDbEntity } from '@kgm-rental/backend-libs/modules/reference-data/infrastructure/db-entities/residual-rate.db-entity.js';
import { DeliveryRateDbEntity } from '@kgm-rental/backend-libs/modules/reference-data/infrastructure/db-entities/delivery-rate.db-entity.js';
import { MaintenancePackageRateDbEntity } from '@kgm-rental/backend-libs/modules/reference-data/infrastructure/db-entities/maintenance-package-rate.db-entity.js';
import { InsuranceRateDbEntity } from '@kgm-rental/backend-libs/modules/reference-data/infrastructure/db-entities/insurance-rate.db-entity.js';
import { PromotionDbEntity } from '@kgm-rental/backend-libs/modules/reference-data/infrastructure/db-entities/promotion.db-entity.js';

import { REFERENCE_DATA_REPOSITORY } from './domain/repositories/reference-data.repository.js';
import { ReferenceDataTypeormRepository } from './infrastructure/repositories/reference-data.typeorm.repository.js';
import { ReferenceDataReaderAdapter } from './infrastructure/adapters/reference-data-reader.adapter.js';
import { REFERENCE_DATA_READER } from '../rental-quote/application/ports/reference-data-reader.port.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VehicleDbEntity,
      InterestRateDbEntity,
      ResidualRateDbEntity,
      DeliveryRateDbEntity,
      MaintenancePackageRateDbEntity,
      InsuranceRateDbEntity,
      PromotionDbEntity,
    ]),
  ],
  providers: [
    {
      provide: REFERENCE_DATA_REPOSITORY,
      useClass: ReferenceDataTypeormRepository,
    },
    {
      provide: REFERENCE_DATA_READER,
      useClass: ReferenceDataReaderAdapter,
    },
  ],
  exports: [REFERENCE_DATA_READER],
})
export class ReferenceDataModule {}
