// Customer-selectable quote inputs (4 fields, discrete enums).
// These are the only fields exposed on the b2c configurator UI.

export const CONTRACT_PERIODS = [24, 36, 48, 60] as const;
export type ContractPeriodMonths = (typeof CONTRACT_PERIODS)[number];

export const ANNUAL_MILEAGES = [10000, 15000, 20000, 25000, 30000] as const;
export type AnnualMileageKm = (typeof ANNUAL_MILEAGES)[number];

export const PREPAID_RATES = [0, 10, 20, 30] as const;
export type PrepaidRatePercent = (typeof PREPAID_RATES)[number];

export const DEPOSIT_RATES = [0, 10, 20, 30] as const;
export type DepositRatePercent = (typeof DEPOSIT_RATES)[number];

export class ContractPeriod {
  private constructor(public readonly months: ContractPeriodMonths) {}
  static of(months: number): ContractPeriod {
    if (!CONTRACT_PERIODS.includes(months as ContractPeriodMonths)) {
      throw new Error(`ContractPeriod.of: unsupported ${months}. Use ${CONTRACT_PERIODS.join('/')}`);
    }
    return new ContractPeriod(months as ContractPeriodMonths);
  }
}

export class AnnualMileage {
  private constructor(public readonly km: AnnualMileageKm) {}
  static of(km: number): AnnualMileage {
    if (!ANNUAL_MILEAGES.includes(km as AnnualMileageKm)) {
      throw new Error(`AnnualMileage.of: unsupported ${km}. Use ${ANNUAL_MILEAGES.join('/')}`);
    }
    return new AnnualMileage(km as AnnualMileageKm);
  }
}

export class PrepaidRate {
  private constructor(public readonly percent: PrepaidRatePercent) {}
  static of(percent: number): PrepaidRate {
    if (!PREPAID_RATES.includes(percent as PrepaidRatePercent)) {
      throw new Error(`PrepaidRate.of: unsupported ${percent}. Use ${PREPAID_RATES.join('/')}`);
    }
    return new PrepaidRate(percent as PrepaidRatePercent);
  }
  get fraction(): number {
    return this.percent / 100;
  }
}

export class DepositRate {
  private constructor(public readonly percent: DepositRatePercent) {}
  static of(percent: number): DepositRate {
    if (!DEPOSIT_RATES.includes(percent as DepositRatePercent)) {
      throw new Error(`DepositRate.of: unsupported ${percent}. Use ${DEPOSIT_RATES.join('/')}`);
    }
    return new DepositRate(percent as DepositRatePercent);
  }
  get fraction(): number {
    return this.percent / 100;
  }
}
