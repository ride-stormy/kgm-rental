// Domain exceptions thrown by rental-quote domain services.
// Presentation layer maps these to HTTP 400 / 404 responses.

export type DepositPrepayLimitReason = 'LIMIT_40' | 'LIMIT_50' | 'LIMIT_SUM_50';

export class InvalidDepositPrepayCombinationException extends Error {
  constructor(
    public readonly reason: DepositPrepayLimitReason,
    public readonly details: { prepaidRate: number; depositRate: number },
  ) {
    super(
      `InvalidDepositPrepay: ${reason} (prepaid=${details.prepaidRate}%, deposit=${details.depositRate}%)`,
    );
    this.name = 'InvalidDepositPrepayCombinationException';
  }
}

export class UnsupportedVehicleException extends Error {
  constructor(public readonly vehicleSlug: string) {
    super(`Unsupported vehicle: ${vehicleSlug}`);
    this.name = 'UnsupportedVehicleException';
  }
}

export class InterestRateNotFoundException extends Error {
  constructor(
    public readonly vehicleType: string,
    public readonly contractPeriod: number,
  ) {
    super(`InterestRate not found: type=${vehicleType}, period=${contractPeriod}`);
    this.name = 'InterestRateNotFoundException';
  }
}

export class ResidualRateNotFoundException extends Error {
  constructor(
    public readonly vehicleType: string,
    public readonly contractPeriod: number,
    public readonly annualMileage: number,
  ) {
    super(
      `ResidualRate not found: type=${vehicleType}, period=${contractPeriod}, mileage=${annualMileage}`,
    );
    this.name = 'ResidualRateNotFoundException';
  }
}

export class InsuranceRateNotFoundException extends Error {
  constructor(public readonly vehicleType: string, public readonly annualMileage: number) {
    super(`InsuranceRate not found: type=${vehicleType}, mileage=${annualMileage}`);
    this.name = 'InsuranceRateNotFoundException';
  }
}

export class MaintenanceRateNotFoundException extends Error {
  constructor(public readonly packageCode: string, public readonly vehicleType: string) {
    super(`MaintenanceRate not found: package=${packageCode}, type=${vehicleType}`);
    this.name = 'MaintenanceRateNotFoundException';
  }
}
