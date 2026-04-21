import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import type { Response } from 'express';

import {
  InvalidDepositPrepayCombinationException,
  UnsupportedVehicleException,
  InterestRateNotFoundException,
  ResidualRateNotFoundException,
  InsuranceRateNotFoundException,
  MaintenanceRateNotFoundException,
} from '@kgm-rental/backend-libs/modules/rental-quote/domain/exceptions/rental-quote.exception.js';

type DomainErrorShape = { status: number; code: string };

function mapDomainException(exception: unknown): DomainErrorShape | null {
  if (exception instanceof InvalidDepositPrepayCombinationException) {
    const code = exception.reason === 'LIMIT_SUM_50' ? 'SUM_50' : exception.reason;
    return { status: 400, code };
  }
  if (exception instanceof UnsupportedVehicleException) {
    return { status: 400, code: 'INVALID_VEHICLE_TYPE' };
  }
  if (exception instanceof InterestRateNotFoundException) {
    return { status: 400, code: 'INVALID_CONTRACT_PERIOD' };
  }
  if (exception instanceof ResidualRateNotFoundException) {
    return { status: 400, code: 'INVALID_ANNUAL_MILEAGE' };
  }
  if (exception instanceof InsuranceRateNotFoundException) {
    return { status: 400, code: 'INVALID_ANNUAL_MILEAGE' };
  }
  if (exception instanceof MaintenanceRateNotFoundException) {
    return { status: 400, code: 'INVALID_ANNUAL_MILEAGE' };
  }
  if (exception instanceof Error && exception.message?.startsWith('ContractPeriod.of')) {
    return { status: 400, code: 'INVALID_CONTRACT_PERIOD' };
  }
  if (exception instanceof Error && exception.message?.startsWith('AnnualMileage.of')) {
    return { status: 400, code: 'INVALID_ANNUAL_MILEAGE' };
  }
  return null;
}

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      res.status(status).json(
        typeof payload === 'object'
          ? payload
          : {
              success: false,
              data: null,
              error: { code: 'HTTP_ERROR', message: String(payload) },
            },
      );
      return;
    }

    const mapped = mapDomainException(exception);
    if (mapped) {
      const err = exception as Error;
      res.status(mapped.status).json({
        success: false,
        data: null,
        error: { code: mapped.code, message: err.message },
      });
      return;
    }

    const err = exception as Error;
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message ?? 'Unexpected server error',
      },
    });
  }
}
