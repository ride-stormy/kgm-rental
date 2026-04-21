import { Inject, Injectable } from '@nestjs/common';
import { RentalQuoteCalculatorDomainService } from '@kgm-rental/backend-libs/modules/rental-quote/domain/domain-services/rental-quote-calculator.domain-service.js';
import {
  REFERENCE_DATA_READER,
  type ReferenceDataReaderPort,
} from '../ports/reference-data-reader.port.js';
import {
  PRODUCT_SKU_PROVIDER,
  type ProductSkuProviderPort,
} from '../ports/product-sku-provider.port.js';
import { VehicleNotFoundApplicationException } from '../exceptions/vehicle-not-found.application-exception.js';
import { ReferenceDataMissingApplicationException } from '../exceptions/reference-data-missing.application-exception.js';
import type {
  CalculateQuoteServiceInput,
  CalculateQuoteServiceOutput,
  CalculateQuoteServicePort,
} from './interfaces/calculate-quote.service.interface.js';

@Injectable()
export class CalculateQuoteService implements CalculateQuoteServicePort {
  constructor(
    @Inject(REFERENCE_DATA_READER)
    private readonly referenceReader: ReferenceDataReaderPort,
    @Inject(PRODUCT_SKU_PROVIDER)
    private readonly skuProvider: ProductSkuProviderPort,
  ) {}

  async execute(input: CalculateQuoteServiceInput): Promise<CalculateQuoteServiceOutput> {
    const sku = await this.skuProvider.findSku({ skuId: input.skuId });
    if (!sku) throw new VehicleNotFoundApplicationException(input.skuId);

    const { dataset } = await this.referenceReader.loadDataset({ vehicleSlug: sku.vehicleSlug });
    if (!dataset) throw new ReferenceDataMissingApplicationException(sku.vehicleSlug);

    const calculator = new RentalQuoteCalculatorDomainService(dataset);
    const quote = calculator.calculate({
      skuId: sku.skuId,
      vehicleSlug: sku.vehicleSlug,
      contractPeriodMonths: input.contractPeriod,
      annualMileageKm: input.annualMileage,
      prepaidRatePercent: input.prepaidRate,
      depositRatePercent: input.depositRate,
      preset: sku.preset,
    });

    const b = quote.snapshot.breakdown;
    return {
      breakdown: {
        standardRent: b.standardRent,
        discountTotal: b.discountTotal ?? 0,
        prepaidDeduction: b.prepaidDeduction,
        finalMonthlyRent: b.finalMonthlyRent,
        residualValue: b.residualValue,
        prepaidAmount: b.prepaidAmount,
        depositAmount: b.depositAmount,
        initialBurden: b.initialBurden,
        supplyPrice: b.supplyPrice ?? 0,
        vat: b.vat ?? 0,
      },
    };
  }
}
