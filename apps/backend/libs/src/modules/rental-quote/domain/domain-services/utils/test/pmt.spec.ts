import { describe, it, expect } from 'vitest';
import { pmt } from '../pmt.js';

// Reference values verified against Excel PMT().
// All fixtures were taken from the Meritz xlsm so the engine reproduces
// the exact cached cells.
describe('pmt() — Excel PMT parity', () => {
  it('zero rate: -(pv + fv) / nper', () => {
    expect(pmt(0, 36, -40690000, 29297000)).toBeCloseTo(-(-40690000 + 29297000) / 36, 6);
  });

  it('reproduces xlsm M49 for Acktyon HEV 36M / residual 72%', () => {
    // xlsm: PMT(BR32/12, 36, -H21, ROUND(CC9/1.1, 0), 0)
    //   BR32 = 0.05295700423125657, H21 ≈ 35218372.42, CC9 = 29297000
    //   ROUND(29297000/1.1, 0) = 26633636
    const rate = 0.05295700423125657 / 12;
    const result = pmt(rate, 36, -35218372.42, 26633636, 0);
    // Excel cached value for this input: ~375969.99 (EG7 after ROUNDUP(-1) → 375970)
    expect(result).toBeGreaterThan(375960);
    expect(result).toBeLessThan(375980);
  });

  it('rejects non-finite inputs', () => {
    expect(() => pmt(NaN, 36, -100000, 0)).toThrow();
    expect(() => pmt(0.05, 0, -100000, 0)).toThrow();
  });

  it('preserves Excel sign convention (loan pv = -X → payment positive)', () => {
    // Standard car loan: 30,000,000 at 6% annual over 60 months, no residual
    const payment = pmt(0.06 / 12, 60, -30000000, 0, 0);
    expect(payment).toBeGreaterThan(0);
    expect(payment).toBeCloseTo(579984.05, 2);
  });
});
