// RentalQuoteCalculatorDomainService — orchestrates the 7 cost services and
// returns a RentalQuote snapshot. Customer input (4 fields) + SKU preset +
// vehicle metadata + loaded reference dataset → full breakdown.

import {
  AnnualMileage,
  ContractPeriod,
  DepositRate,
  PrepaidRate,
} from '../value-objects/customer-input.value-object.js';
import {
  MaintenancePackage,
  MaturityOption,
  Region,
  VehicleType,
  WinterOption,
} from '../value-objects/sku-preset.value-object.js';
import { RentalQuote } from '../domain-entities/rental-quote.domain-entity.js';
import type {
  QuoteBreakdown,
  QuoteInputSnapshot,
} from '../domain-entities/rental-quote.domain-entity.js';
import { DepositPrepaidDomainService } from './deposit-prepaid.domain-service.js';
import { FixedCostDomainService } from './fixed-cost.domain-service.js';
import { InsuranceCostDomainService } from './insurance-cost.domain-service.js';
import { MaintenanceCostDomainService } from './maintenance-cost.domain-service.js';
import { PromotionDomainService } from './promotion.domain-service.js';
import { ResidualValueDomainService } from './residual-value.domain-service.js';
import { SupplyPriceDomainService } from './supply-price.domain-service.js';
import { VehicleRentCostDomainService } from './vehicle-rent-cost.domain-service.js';
import { VehicleTaxCostDomainService } from './vehicle-tax-cost.domain-service.js';
import { roundUp } from './utils/krw-round.js';
import type { ReferenceDataset, Vehicle } from '../../../reference-data/domain/domain-entities/reference-data.types.js';
import { UnsupportedVehicleException } from '../exceptions/rental-quote.exception.js';

export interface CalculateQuoteInput {
  skuId: string;
  vehicleSlug: string;
  contractPeriodMonths: number;
  annualMileageKm: number;
  prepaidRatePercent: number;
  depositRatePercent: number;
  preset: {
    maintenancePackage: string;
    maturityOption: string;
    winterOption: string;
    region: string;
  };
}

export class RentalQuoteCalculatorDomainService {
  private readonly residualSvc: ResidualValueDomainService;
  private readonly vehicleRentSvc: VehicleRentCostDomainService;
  private readonly vehicleTaxSvc: VehicleTaxCostDomainService;
  private readonly insuranceSvc: InsuranceCostDomainService;
  private readonly maintenanceSvc: MaintenanceCostDomainService;
  private readonly fixedCostSvc: FixedCostDomainService;
  private readonly supplySvc: SupplyPriceDomainService;
  private readonly depositPrepaidSvc: DepositPrepaidDomainService;
  private readonly promotionSvc: PromotionDomainService;

  constructor(private readonly reference: ReferenceDataset) {
    this.residualSvc = new ResidualValueDomainService(reference);
    this.vehicleRentSvc = new VehicleRentCostDomainService(reference);
    this.vehicleTaxSvc = new VehicleTaxCostDomainService();
    this.insuranceSvc = new InsuranceCostDomainService(reference);
    this.maintenanceSvc = new MaintenanceCostDomainService(reference);
    this.fixedCostSvc = new FixedCostDomainService(reference);
    this.supplySvc = new SupplyPriceDomainService();
    this.depositPrepaidSvc = new DepositPrepaidDomainService();
    this.promotionSvc = new PromotionDomainService(reference);
  }

  calculate(input: CalculateQuoteInput): RentalQuote {
    const vehicle = this.findVehicle(input.vehicleSlug);

    // Parse/validate VOs — raises domain errors if out of enum.
    const contract = ContractPeriod.of(input.contractPeriodMonths);
    const mileage = AnnualMileage.of(input.annualMileageKm);
    const prepaid = PrepaidRate.of(input.prepaidRatePercent);
    const deposit = DepositRate.of(input.depositRatePercent);
    const maintenance = MaintenancePackage.of(input.preset.maintenancePackage);
    const maturity = MaturityOption.of(input.preset.maturityOption);
    const winter = WinterOption.of(input.preset.winterOption);
    const region = Region.of(input.preset.region);
    const vehicleType = VehicleType.of(vehicle.vehicleType);

    // 1. Residual value (CC9)
    const { residualValue } = this.residualSvc.calculate({
      vehiclePrice: vehicle.price,
      vehicleType: vehicleType.code,
      contractPeriodMonths: contract.months,
      annualMileageKm: mileage.km,
    });

    // 2. Vehicle rent cost (EG7) using PMT
    const { vehicleRentCost: baseVehicleRentCost } = this.vehicleRentSvc.calculate({
      vehicleType: vehicleType.code,
      contractPeriodMonths: contract.months,
      acquisitionCost: vehicle.acquisitionCost,
      residualValue,
    });

    // 2.5 Apply promotions (EV 특판 150만원, etc.). Reductions are monthly KRW,
    // subtracted from 차량분 before the supply-price roll-up. Result is clamped
    // to a non-negative integer via ROUNDUP(-1) for xlsm parity.
    const promotionReduction = this.promotionSvc.monthlyReduction({
      vehicleSlug: vehicle.slug,
      vehicleType: vehicleType.code,
    });
    const vehicleRentCost = Math.max(0, roundUp(baseVehicleRentCost - promotionReduction, -1));

    // 3. Vehicle tax (EG8)
    const { vehicleTaxCost } = this.vehicleTaxSvc.calculate({
      vehicleType: vehicleType.code,
      displacement: vehicle.displacement,
    });

    // 4. Insurance (EG9)
    const { insuranceCost } = this.insuranceSvc.calculate({
      vehicleType: vehicleType.code,
      annualMileageKm: mileage.km,
    });

    // 5. Maintenance (EG10) — preset 'NONE' → 0
    const { maintenanceCost } = this.maintenanceSvc.calculate({
      packageCode: maintenance.code,
      vehicleType: vehicleType.code,
      contractPeriodMonths: contract.months,
      annualMileageKm: mileage.km,
    });

    // 6. Fixed costs (EG11/EG12/EG13 + winter)
    const { parkingCost, associationCost, membershipCost, winterCost } = this.fixedCostSvc.calculate({
      region: region.code,
      winterOption: winter.code,
      vehicleType: vehicleType.code,
    });

    // 7. Supply price, VAT, standard rent (BR26, BR27, BR23)
    const { supplyPrice, vat, standardRent } = this.supplySvc.calculate({
      vehicleRentCost,
      vehicleTaxCost,
      insuranceCost,
      maintenanceCost,
      parkingCost,
      associationCost,
      membershipCost,
      winterCost,
    });

    // 8. Deposit/prepaid (CC8, CC21, BR28, Y33)
    const {
      prepaidAmount,
      depositAmount,
      initialBurden,
      prepaidDeduction,
    } = this.depositPrepaidSvc.calculate({
      vehiclePrice: vehicle.price,
      prepaidRatePercent: prepaid.percent,
      depositRatePercent: deposit.percent,
      contractPeriodMonths: contract.months,
    });

    // 9. Final monthly rent (Y30)
    const discountTotal = 0; // reserved: explicit manual adjustments
    const finalMonthlyRent = standardRent + discountTotal + prepaidDeduction;

    // Assemble snapshot
    const inputSnapshot: QuoteInputSnapshot = {
      skuId: input.skuId,
      vehicleSlug: vehicle.slug,
      vehicleType: vehicleType.code,
      vehiclePrice: vehicle.price,
      vehiclePriceAfterDiscount: vehicle.priceAfterDiscount,
      displacement: vehicle.displacement,
      contractPeriod: contract.months,
      annualMileage: mileage.km,
      prepaidRate: prepaid.percent,
      depositRate: deposit.percent,
      preset: {
        maintenancePackage: maintenance.code,
        maturityOption: maturity.code,
        winterOption: winter.code,
        region: region.code,
      },
    };
    const breakdown: QuoteBreakdown = {
      vehicleRentCost,
      vehicleTaxCost,
      insuranceCost,
      maintenanceCost,
      parkingCost,
      associationCost,
      membershipCost,
      supplyPrice,
      vat,
      standardRent,
      discountTotal,
      prepaidDeduction,
      finalMonthlyRent,
      residualValue,
      prepaidAmount,
      depositAmount,
      initialBurden,
    };
    return RentalQuote.from({ input: inputSnapshot, breakdown });
  }

  private findVehicle(slug: string): Vehicle {
    const vehicle = this.reference.vehicles.find((v) => v.slug === slug);
    if (!vehicle) throw new UnsupportedVehicleException(slug);
    return vehicle;
  }
}
