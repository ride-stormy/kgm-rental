// Case #1 golden verification — Acktyon 1.5T HEV 36M / 20000km / prepaid 30% / deposit 0%.
// Expected values come from the Meritz xlsm cached state (1원 unit match).

import { describe, it, expect } from 'vitest';
import { RentalQuoteCalculatorDomainService } from '../rental-quote-calculator.domain-service.js';
import { actyonHevSeed } from '../../../../reference-data/infrastructure/seeds/actyon-hev-seed.js';
import { InvalidDepositPrepayCombinationException } from '../../exceptions/rental-quote.exception.js';

const calculator = new RentalQuoteCalculatorDomainService(actyonHevSeed);

describe('RentalQuoteCalculator — case #1 (Acktyon HEV 36M/20k/30/0)', () => {
  const input = {
    skuId: 'actyon-hev-s8',
    vehicleSlug: 'actyon-hev',
    contractPeriodMonths: 36,
    annualMileageKm: 20000,
    prepaidRatePercent: 30,
    depositRatePercent: 0,
    preset: {
      maintenancePackage: 'Select',
      maturityOption: '만기선택형',
      winterOption: 'chain-no',
      region: '서울/경기/인천',
    },
  };

  it('matches xlsm cached values to 1 KRW', () => {
    const quote = calculator.calculate(input);
    const b = quote.snapshot.breakdown;

    // Component-by-component vs xlsm
    expect(b.vehicleRentCost).toBe(375970); // EG7
    expect(b.vehicleTaxCost).toBe(2300); // EG8
    expect(b.insuranceCost).toBe(51700); // EG9
    expect(b.maintenanceCost).toBe(49000); // EG10
    expect(b.parkingCost).toBe(500); // EG11
    expect(b.associationCost).toBe(700); // EG12
    expect(b.membershipCost).toBe(0); // EG13

    expect(b.supplyPrice).toBe(480200); // BR26
    expect(b.vat).toBe(48020); // BR27
    expect(b.standardRent).toBe(528220); // BR23
    expect(b.prepaidDeduction).toBe(-339080); // BR28
    expect(b.finalMonthlyRent).toBe(189140); // Y30 ← headline
    expect(b.residualValue).toBe(29297000); // CC9
    expect(b.prepaidAmount).toBe(12207000); // CC21
    expect(b.depositAmount).toBe(0); // CC8
    expect(b.initialBurden).toBe(12207000); // Y33
  });
});

describe('RentalQuoteCalculator — 0/0 variant (no prepaid, no deposit)', () => {
  it('final rent equals standard rent (no discount applied)', () => {
    const quote = calculator.calculate({
      skuId: 'actyon-hev-s8',
      vehicleSlug: 'actyon-hev',
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
    expect(quote.snapshot.breakdown.finalMonthlyRent).toBe(528220);
    expect(quote.snapshot.breakdown.prepaidAmount).toBe(0);
    expect(quote.snapshot.breakdown.depositAmount).toBe(0);
    expect(quote.snapshot.breakdown.prepaidDeduction).toBe(0);
    expect(quote.snapshot.breakdown.initialBurden).toBe(0);
  });
});

describe('RentalQuoteCalculator — preset NONE (maintenance excluded)', () => {
  it('drops maintenance cost to 0 and lowers standard rent', () => {
    const quote = calculator.calculate({
      skuId: 'actyon-hev-no-maint',
      vehicleSlug: 'actyon-hev',
      contractPeriodMonths: 36,
      annualMileageKm: 20000,
      prepaidRatePercent: 30,
      depositRatePercent: 0,
      preset: {
        maintenancePackage: 'NONE',
        maturityOption: '만기선택형',
        winterOption: 'chain-no',
        region: '서울/경기/인천',
      },
    });
    // Sum without maintenance: 375970+2300+51700+0+500+700+0 = 431170
    // → supplyPrice ROUNDUP(-2) = 431200
    // → VAT ROUNDDOWN(43120, -1) = 43120
    // → standardRent = 474320
    // → final = 474320 - 339080 = 135240
    expect(quote.snapshot.breakdown.maintenanceCost).toBe(0);
    expect(quote.snapshot.breakdown.supplyPrice).toBe(431200);
    expect(quote.snapshot.breakdown.vat).toBe(43120);
    expect(quote.snapshot.breakdown.standardRent).toBe(474320);
    expect(quote.snapshot.breakdown.finalMonthlyRent).toBe(135240);
  });
});

describe('RentalQuoteCalculator — deposit/prepaid limit exceptions', () => {
  const base = {
    skuId: 'actyon-hev-s8',
    vehicleSlug: 'actyon-hev',
    contractPeriodMonths: 36 as const,
    annualMileageKm: 20000 as const,
    preset: {
      maintenancePackage: 'Select',
      maturityOption: '만기선택형',
      winterOption: 'chain-no',
      region: '서울/경기/인천',
    },
  };

  it('throws LIMIT_SUM_50 when prepaid + deposit exceed 50', () => {
    try {
      calculator.calculate({ ...base, prepaidRatePercent: 30, depositRatePercent: 30 });
      throw new Error('expected exception');
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidDepositPrepayCombinationException);
      expect((e as InvalidDepositPrepayCombinationException).reason).toBe('LIMIT_SUM_50');
    }
  });
});
