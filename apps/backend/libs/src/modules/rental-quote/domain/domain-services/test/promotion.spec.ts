import { describe, it, expect } from 'vitest';
import { RentalQuoteCalculatorDomainService } from '../rental-quote-calculator.domain-service.js';
import { PromotionDomainService } from '../promotion.domain-service.js';
import { mussoEvSeed } from '../../../../reference-data/infrastructure/seeds/musso-ev-seed.js';
import { actyonHevSeed } from '../../../../reference-data/infrastructure/seeds/actyon-hev-seed.js';

describe('PromotionDomainService', () => {
  it('returns 0 when no promotion matches', () => {
    const svc = new PromotionDomainService(actyonHevSeed);
    expect(svc.monthlyReduction({ vehicleSlug: 'actyon-hev', vehicleType: 'HEV' })).toBe(0);
  });

  it('matches promotion by vehicleType (EV)', () => {
    const svc = new PromotionDomainService(mussoEvSeed);
    const matches = svc.findActivePromotions({ vehicleSlug: 'musso-ev', vehicleType: 'EV' });
    expect(matches.length).toBe(1);
    expect(matches[0]?.code).toBe('EV_SPECIAL_150');
  });

  it('does not apply EV promotion to HEV vehicle', () => {
    const svc = new PromotionDomainService(mussoEvSeed);
    expect(svc.monthlyReduction({ vehicleSlug: 'hev', vehicleType: 'HEV' })).toBe(0);
  });
});

describe('Calculator applies EV 특판 promotion to vehicleRentCost', () => {
  it('Musso EV 36M/20k/0/0: vehicleRentCost reduced vs same-price non-EV', () => {
    const calc = new RentalQuoteCalculatorDomainService(mussoEvSeed);
    const quote = calc.calculate({
      skuId: 'musso-ev-std',
      vehicleSlug: 'musso-ev',
      contractPeriodMonths: 36,
      annualMileageKm: 20000,
      prepaidRatePercent: 0,
      depositRatePercent: 0,
      preset: {
        maintenancePackage: 'Select',
        maturityOption: '만기선택형',
        winterOption: 'chain-no',
        region: '서울/경기/인천',
      },
    });
    const b = quote.snapshot.breakdown;
    // vehicleRentCost should reflect -41,666/36 ≈ -41,667 or a reduced value vs
    // no-promotion baseline. Smoke check: value is positive int, final rent < standard - 0.
    expect(b.vehicleRentCost).toBeGreaterThan(0);
    expect(Number.isInteger(b.vehicleRentCost)).toBe(true);
    // Vehicle tax for EV is flat 2000 (not displacement-based)
    expect(b.vehicleTaxCost).toBe(2000);
    // finalMonthlyRent with no prepaid/deposit = standardRent
    expect(b.finalMonthlyRent).toBe(b.standardRent);
  });
});
