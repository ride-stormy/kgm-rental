// DepositPrepaidDomainService — 선납/보증 환산, 상한 검증, 월 환원(BR28).
// Excel constraints (applied to X8 = vehicle price, BEFORE discount):
//   prepaidRate > 40         → LIMIT_40 exception
//   depositRate > 50         → LIMIT_50 exception
//   prepaidRate + depositRate > 50 → LIMIT_SUM_50 exception
//
//   prepaidAmount  = ROUNDUP(X8 × prepaidRate, -3)    (CC21)
//   depositAmount  = ROUNDUP(X8 × depositRate, -3)    (CC8)
//   initialBurden  = prepaidAmount + depositAmount    (Y33)
//   prepaidDeduction = -ROUNDDOWN(prepaidAmount / contractPeriod, -1)  (BR28)

import { roundDown, roundUp } from './utils/krw-round.js';
import { InvalidDepositPrepayCombinationException } from '../exceptions/rental-quote.exception.js';

export interface DepositPrepaidInput {
  vehiclePrice: number; // X8 (pre-discount)
  prepaidRatePercent: number;
  depositRatePercent: number;
  contractPeriodMonths: number;
}

export class DepositPrepaidDomainService {
  validate(input: DepositPrepaidInput): void {
    if (input.prepaidRatePercent > 40) {
      throw new InvalidDepositPrepayCombinationException('LIMIT_40', {
        prepaidRate: input.prepaidRatePercent,
        depositRate: input.depositRatePercent,
      });
    }
    if (input.depositRatePercent > 50) {
      throw new InvalidDepositPrepayCombinationException('LIMIT_50', {
        prepaidRate: input.prepaidRatePercent,
        depositRate: input.depositRatePercent,
      });
    }
    if (input.prepaidRatePercent + input.depositRatePercent > 50) {
      throw new InvalidDepositPrepayCombinationException('LIMIT_SUM_50', {
        prepaidRate: input.prepaidRatePercent,
        depositRate: input.depositRatePercent,
      });
    }
  }

  calculate(input: DepositPrepaidInput): {
    prepaidAmount: number;
    depositAmount: number;
    initialBurden: number;
    prepaidDeduction: number;
  } {
    this.validate(input);
    const prepaidAmount = roundUp(input.vehiclePrice * (input.prepaidRatePercent / 100), -3);
    const depositAmount = roundUp(input.vehiclePrice * (input.depositRatePercent / 100), -3);
    const initialBurden = prepaidAmount + depositAmount;
    const prepaidDeduction =
      prepaidAmount === 0 ? 0 : -roundDown(prepaidAmount / input.contractPeriodMonths, -1);
    return { prepaidAmount, depositAmount, initialBurden, prepaidDeduction };
  }
}
