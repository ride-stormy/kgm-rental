import { describe, it, expect } from 'vitest';
import {
  InsuranceRateNotFoundException,
  InterestRateNotFoundException,
  InvalidDepositPrepayCombinationException,
  MaintenanceRateNotFoundException,
  ResidualRateNotFoundException,
  UnsupportedVehicleException,
} from '../rental-quote.exception.js';

describe('Rental quote domain exceptions', () => {
  it('InvalidDepositPrepayCombination preserves reason/details', () => {
    const e = new InvalidDepositPrepayCombinationException('LIMIT_SUM_50', {
      prepaidRate: 30,
      depositRate: 30,
    });
    expect(e).toBeInstanceOf(Error);
    expect(e.reason).toBe('LIMIT_SUM_50');
    expect(e.details.prepaidRate).toBe(30);
    expect(e.message).toContain('LIMIT_SUM_50');
    expect(e.name).toBe('InvalidDepositPrepayCombinationException');
  });

  it('UnsupportedVehicleException exposes slug', () => {
    const e = new UnsupportedVehicleException('unknown-slug');
    expect(e.vehicleSlug).toBe('unknown-slug');
    expect(e.message).toContain('unknown-slug');
  });

  it('InterestRateNotFoundException', () => {
    const e = new InterestRateNotFoundException('HEV', 24);
    expect(e.vehicleType).toBe('HEV');
    expect(e.contractPeriod).toBe(24);
  });

  it('ResidualRateNotFoundException', () => {
    const e = new ResidualRateNotFoundException('EV', 60, 30000);
    expect(e.annualMileage).toBe(30000);
  });

  it('InsuranceRateNotFoundException', () => {
    const e = new InsuranceRateNotFoundException('ICE', 40000);
    expect(e.message).toContain('40000');
  });

  it('MaintenanceRateNotFoundException', () => {
    const e = new MaintenanceRateNotFoundException('Basic', 'ICE');
    expect(e.packageCode).toBe('Basic');
  });
});
