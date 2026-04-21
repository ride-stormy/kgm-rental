import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import type { ReferenceDataRepositoryPort } from '../../domain/repositories/interfaces/reference-data.repository.interface.js';
import type { ReferenceDataset } from '@kgm-rental/backend-libs/modules/reference-data/domain/domain-entities/reference-data.types.js';

import { VehicleDbEntity } from '@kgm-rental/backend-libs/modules/reference-data/infrastructure/db-entities/vehicle.db-entity.js';
import { InterestRateDbEntity } from '@kgm-rental/backend-libs/modules/reference-data/infrastructure/db-entities/interest-rate.db-entity.js';
import { ResidualRateDbEntity } from '@kgm-rental/backend-libs/modules/reference-data/infrastructure/db-entities/residual-rate.db-entity.js';
import { DeliveryRateDbEntity } from '@kgm-rental/backend-libs/modules/reference-data/infrastructure/db-entities/delivery-rate.db-entity.js';
import { MaintenancePackageRateDbEntity } from '@kgm-rental/backend-libs/modules/reference-data/infrastructure/db-entities/maintenance-package-rate.db-entity.js';
import { InsuranceRateDbEntity } from '@kgm-rental/backend-libs/modules/reference-data/infrastructure/db-entities/insurance-rate.db-entity.js';
import { PromotionDbEntity } from '@kgm-rental/backend-libs/modules/reference-data/infrastructure/db-entities/promotion.db-entity.js';

import {
  vehicleMapper,
  interestRateMapper,
  residualRateMapper,
  deliveryRateMapper,
  maintenancePackageRateMapper,
  insuranceRateMapper,
  promotionMapper,
} from '@kgm-rental/backend-libs/modules/reference-data/infrastructure/mappers/reference-data.mappers.js';

@Injectable()
export class ReferenceDataTypeormRepository implements ReferenceDataRepositoryPort {
  private readonly vehicles: Repository<VehicleDbEntity>;
  private readonly interests: Repository<InterestRateDbEntity>;
  private readonly residuals: Repository<ResidualRateDbEntity>;
  private readonly deliveries: Repository<DeliveryRateDbEntity>;
  private readonly maintenances: Repository<MaintenancePackageRateDbEntity>;
  private readonly insurances: Repository<InsuranceRateDbEntity>;
  private readonly promotions: Repository<PromotionDbEntity>;

  constructor(@InjectDataSource() dataSource: DataSource) {
    this.vehicles = dataSource.getRepository(VehicleDbEntity);
    this.interests = dataSource.getRepository(InterestRateDbEntity);
    this.residuals = dataSource.getRepository(ResidualRateDbEntity);
    this.deliveries = dataSource.getRepository(DeliveryRateDbEntity);
    this.maintenances = dataSource.getRepository(MaintenancePackageRateDbEntity);
    this.insurances = dataSource.getRepository(InsuranceRateDbEntity);
    this.promotions = dataSource.getRepository(PromotionDbEntity);
  }

  async loadByVehicleSlug(input: { vehicleSlug: string }): Promise<{ dataset: ReferenceDataset | null }> {
    const vehicleDb = await this.vehicles.findOne({ where: { slug: input.vehicleSlug } });
    if (!vehicleDb) return { dataset: null };

    const vehicle = vehicleMapper.toDomain(vehicleDb);

    const [interests, residuals, deliveries, maintenances, insurances, promotions] = await Promise.all([
      this.interests.find({ where: { vehicleType: vehicle.vehicleType } }),
      this.residuals.find({ where: { vehicleType: vehicle.vehicleType } }),
      this.deliveries.find(),
      this.maintenances.find({ where: { vehicleType: vehicle.vehicleType } }),
      this.insurances.find({ where: { vehicleType: vehicle.vehicleType } }),
      this.promotions.find(),
    ]);

    const dataset: ReferenceDataset = {
      vehicles: [vehicle],
      interestRates: interests.map((r) => interestRateMapper.toDomain(r)),
      residualRates: residuals.map((r) => residualRateMapper.toDomain(r)),
      deliveryRates: deliveries.map((r) => deliveryRateMapper.toDomain(r)),
      maintenanceRates: maintenances.map((r) => maintenancePackageRateMapper.toDomain(r)),
      insuranceRates: insurances.map((r) => insuranceRateMapper.toDomain(r)),
      promotions: promotions
        .map((r) => promotionMapper.toDomain(r))
        .filter((p) => !p.vehicleSlug || p.vehicleSlug === vehicle.slug || p.vehicleType === vehicle.vehicleType),
      winterOptionRates: [{ winterOption: 'chain-no', vehicleType: vehicle.vehicleType, monthlyCost: 0 }],
    };

    return { dataset };
  }

  async listVehicles(input: { take: number; skip: number }): Promise<{
    items: Array<{ slug: string; name: string; price: number; vehicleType: string }>;
    total: number;
  }> {
    const [rows, total] = await this.vehicles.findAndCount({
      take: input.take,
      skip: input.skip,
      order: { slug: 'ASC' },
    });
    const items = rows.map((r) => {
      const d = vehicleMapper.toDomain(r);
      return { slug: d.slug, name: d.name, price: d.price, vehicleType: d.vehicleType };
    });
    return { items, total };
  }

  async findVehicleBySlug(input: { slug: string }): Promise<{
    slug: string;
    name: string;
    vehicleType: string;
    price: number;
  } | null> {
    const row = await this.vehicles.findOne({ where: { slug: input.slug } });
    if (!row) return null;
    const d = vehicleMapper.toDomain(row);
    return { slug: d.slug, name: d.name, vehicleType: d.vehicleType, price: d.price };
  }
}
