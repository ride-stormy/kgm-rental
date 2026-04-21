import { Inject, Injectable } from '@nestjs/common';
import { ResidualValueDomainService } from '@kgm-rental/backend-libs/modules/rental-quote/domain/domain-services/residual-value.domain-service.js';
import type { VehicleTypeCode } from '@kgm-rental/backend-libs/modules/rental-quote/domain/value-objects/sku-preset.value-object.js';
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
  GetResidualValueServiceInput,
  GetResidualValueServiceOutput,
  GetResidualValueServicePort,
} from './interfaces/get-residual-value.service.interface.js';

@Injectable()
export class GetResidualValueService implements GetResidualValueServicePort {
  constructor(
    @Inject(REFERENCE_DATA_READER)
    private readonly referenceReader: ReferenceDataReaderPort,
    @Inject(PRODUCT_SKU_PROVIDER)
    private readonly skuProvider: ProductSkuProviderPort,
  ) {}

  async execute(input: GetResidualValueServiceInput): Promise<GetResidualValueServiceOutput> {
    const sku = await this.skuProvider.findSku({ skuId: input.skuId });
    if (!sku) throw new VehicleNotFoundApplicationException(input.skuId);

    const { dataset } = await this.referenceReader.loadDataset({ vehicleSlug: sku.vehicleSlug });
    if (!dataset) throw new ReferenceDataMissingApplicationException(sku.vehicleSlug);

    // Residual uses the reference vehicle price (per-vehicle-type xlsm-sourced),
    // not the per-SKU catalog price — same as POST /quotes/calculate internally.
    const referenceVehicle = dataset.vehicles.find((v) => v.slug === sku.vehicleSlug);
    if (!referenceVehicle) throw new ReferenceDataMissingApplicationException(sku.vehicleSlug);

    const svc = new ResidualValueDomainService(dataset);
    const { residualValue } = svc.calculate({
      vehiclePrice: referenceVehicle.price,
      vehicleType: referenceVehicle.vehicleType as VehicleTypeCode,
      contractPeriodMonths: input.contractPeriod,
      annualMileageKm: input.annualMileage,
    });
    return { residualValue };
  }
}
