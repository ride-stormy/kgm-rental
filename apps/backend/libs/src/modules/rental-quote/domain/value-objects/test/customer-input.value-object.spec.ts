import { describe, it, expect } from 'vitest';
import {
  AnnualMileage,
  ContractPeriod,
  DepositRate,
  PrepaidRate,
} from '../customer-input.value-object.js';

describe('Customer input VOs — accept only allowed enum values', () => {
  it('ContractPeriod: 24/36/48/60 only', () => {
    for (const m of [24, 36, 48, 60]) expect(ContractPeriod.of(m).months).toBe(m);
    expect(() => ContractPeriod.of(12)).toThrow();
    expect(() => ContractPeriod.of(72)).toThrow();
  });
  it('AnnualMileage: 10k/15k/20k/25k/30k only', () => {
    for (const km of [10000, 15000, 20000, 25000, 30000]) expect(AnnualMileage.of(km).km).toBe(km);
    expect(() => AnnualMileage.of(5000)).toThrow();
    expect(() => AnnualMileage.of(40000)).toThrow();
  });
  it('PrepaidRate: 0/10/20/30 only; fraction accessor', () => {
    for (const p of [0, 10, 20, 30]) {
      const v = PrepaidRate.of(p);
      expect(v.percent).toBe(p);
      expect(v.fraction).toBe(p / 100);
    }
    expect(() => PrepaidRate.of(5)).toThrow();
    expect(() => PrepaidRate.of(40)).toThrow();
  });
  it('DepositRate: 0/10/20/30 only; fraction accessor', () => {
    for (const d of [0, 10, 20, 30]) {
      const v = DepositRate.of(d);
      expect(v.percent).toBe(d);
      expect(v.fraction).toBe(d / 100);
    }
    expect(() => DepositRate.of(50)).toThrow();
  });
});
