// Mapper round-trip tests. Construct a domain row, map to DB, map back, compare.
// No actual DB; only exercises the class-level translation logic.

import { describe, it, expect } from 'vitest';
import { VehicleDbEntity } from '../../db-entities/vehicle.db-entity.js';
import { InterestRateDbEntity } from '../../db-entities/interest-rate.db-entity.js';
import { ResidualRateDbEntity } from '../../db-entities/residual-rate.db-entity.js';
import {
  interestRateMapper,
  residualRateMapper,
  vehicleMapper,
} from '../reference-data.mappers.js';
import type { Vehicle } from '../../../domain/domain-entities/reference-data.types.js';

describe('reference-data mappers — round trip preserves values', () => {
  it('vehicle domain → db → domain', () => {
    const domain: Vehicle = {
      slug: 'actyon-hev',
      modelCode: 'MW5',
      specCode: 'ND0J5C',
      name: '액티언 1.5T HEV',
      vehicleType: 'HEV',
      displacement: 1497,
      price: 40690000,
      priceAfterDiscount: 37790000,
      acquisitionCost: 35218372.42,
    };
    const db = vehicleMapper.toDb(domain);
    // Simulate PG round-trip: bigint/numeric come back as strings
    const rehydrated = Object.assign(new VehicleDbEntity(), {
      ...db,
      id: 'fake',
      createdAt: new Date(),
      updatedAt: new Date(),
    }) as VehicleDbEntity;
    const back = vehicleMapper.toDomain(rehydrated);
    expect(back).toEqual(domain);
  });

  it('interest rate preserves precision', () => {
    const domain = { vehicleType: 'HEV' as const, contractPeriodMonths: 36, annualRate: 0.05295700423125657 };
    const db = interestRateMapper.toDb(domain);
    const rehydrated = Object.assign(new InterestRateDbEntity(), { ...db, id: 'fake' }) as InterestRateDbEntity;
    const back = interestRateMapper.toDomain(rehydrated);
    expect(back.vehicleType).toBe(domain.vehicleType);
    expect(back.contractPeriodMonths).toBe(domain.contractPeriodMonths);
    expect(back.annualRate).toBeCloseTo(domain.annualRate, 10);
  });

  it('residual rate preserves fraction', () => {
    const domain = {
      vehicleType: 'HEV' as const,
      contractPeriodMonths: 36,
      annualMileageKm: 20000,
      residualFraction: 0.72,
    };
    const db = residualRateMapper.toDb(domain);
    const rehydrated = Object.assign(new ResidualRateDbEntity(), { ...db, id: 'fake' }) as ResidualRateDbEntity;
    expect(residualRateMapper.toDomain(rehydrated)).toEqual(domain);
  });
});
