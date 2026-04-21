import { CalculateQuoteService } from '../calculate-quote.service.js';
import { VehicleNotFoundApplicationException } from '../../exceptions/vehicle-not-found.application-exception.js';
import { ReferenceDataMissingApplicationException } from '../../exceptions/reference-data-missing.application-exception.js';
import type { ReferenceDataReaderPort } from '../../ports/reference-data-reader.port.js';
import type { ProductSkuProviderPort } from '../../ports/product-sku-provider.port.js';
import { actyonHevSeed } from '@kgm-rental/backend-libs/modules/reference-data/infrastructure/seeds/actyon-hev-seed.js';

const MOCK_PRESET = {
  maintenancePackage: 'Select',
  maturityOption: '만기선택형',
  winterOption: 'chain-no',
  region: '서울/경기/인천',
} as const;

describe('CalculateQuoteService', () => {
  const skuProvider: ProductSkuProviderPort = {
    findSku: jest.fn(),
    listVehicles: jest.fn(),
  };
  const reader: ReferenceDataReaderPort = {
    loadDataset: jest.fn(),
  };

  const service = new CalculateQuoteService(reader, skuProvider);

  afterEach(() => jest.resetAllMocks());

  it('throws VehicleNotFound when SKU not found', async () => {
    (skuProvider.findSku as jest.Mock).mockResolvedValue(null);
    await expect(
      service.execute({ skuId: 'x', contractPeriod: 36, annualMileage: 20000, prepaidRate: 0, depositRate: 0 }),
    ).rejects.toBeInstanceOf(VehicleNotFoundApplicationException);
  });

  it('throws ReferenceDataMissing when dataset not found', async () => {
    (skuProvider.findSku as jest.Mock).mockResolvedValue({
      skuId: 'actyon-hev',
      vehicleSlug: 'actyon-hev',
      price: 1,
      vehicleType: 'HEV',
      preset: MOCK_PRESET,
    });
    (reader.loadDataset as jest.Mock).mockResolvedValue({ dataset: null });
    await expect(
      service.execute({ skuId: 'actyon-hev', contractPeriod: 36, annualMileage: 20000, prepaidRate: 0, depositRate: 0 }),
    ).rejects.toBeInstanceOf(ReferenceDataMissingApplicationException);
  });

  it('returns 10-field breakdown when happy path', async () => {
    (skuProvider.findSku as jest.Mock).mockResolvedValue({
      skuId: 'actyon-hev',
      vehicleSlug: 'actyon-hev',
      price: actyonHevSeed.vehicles[0]!.price,
      vehicleType: 'HEV',
      preset: MOCK_PRESET,
    });
    (reader.loadDataset as jest.Mock).mockResolvedValue({ dataset: actyonHevSeed });

    const out = await service.execute({
      skuId: 'actyon-hev',
      contractPeriod: 36,
      annualMileage: 20000,
      prepaidRate: 30,
      depositRate: 0,
    });
    expect(out.breakdown.finalMonthlyRent).toBe(189140);
    expect(out.breakdown.residualValue).toBe(29297000);
    expect(out.breakdown.prepaidAmount).toBe(12207000);
  });
});
