import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { VehicleNotFoundApplicationException } from '../modules/rental-quote/application/exceptions/vehicle-not-found.application-exception.js';
import { ReferenceDataMissingApplicationException } from '../modules/rental-quote/application/exceptions/reference-data-missing.application-exception.js';
import {
  ProductNotFoundApplicationException,
  SkuNotFoundApplicationException,
} from '../modules/product/application/exceptions/product-not-found.application-exception.js';

type AppException =
  | VehicleNotFoundApplicationException
  | ReferenceDataMissingApplicationException
  | ProductNotFoundApplicationException
  | SkuNotFoundApplicationException;

@Catch(
  VehicleNotFoundApplicationException,
  ReferenceDataMissingApplicationException,
  ProductNotFoundApplicationException,
  SkuNotFoundApplicationException,
)
export class ApplicationExceptionFilter implements ExceptionFilter {
  catch(exception: AppException, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    res.status(404).json({
      success: false,
      data: null,
      error: { code: exception.code, message: exception.message },
    });
  }
}
