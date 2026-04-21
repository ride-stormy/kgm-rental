// Fixed preset tied to a ProductModel. Replaces F2's hardcoded DEFAULT_PRESET.
// All four fields are admin-decided at catalog level and injected into quote
// calculation (not chosen by the customer).

import {
  MAINTENANCE_PACKAGES,
  MATURITY_OPTIONS,
  REGIONS,
  WINTER_OPTIONS,
  type MaintenancePackageCode,
  type MaturityOptionCode,
  type RegionCode,
  type WinterOptionCode,
} from '@kgm-rental/backend-libs/modules/rental-quote/domain/value-objects/sku-preset.value-object.js';

export interface ProductPresetProps {
  maintenancePackage: MaintenancePackageCode;
  maturityOption: MaturityOptionCode;
  winterOption: WinterOptionCode;
  region: RegionCode;
}

export class ProductPreset {
  private constructor(private readonly _props: ProductPresetProps) {}

  static create(input: {
    maintenancePackage: string;
    maturityOption: string;
    winterOption: string;
    region: string;
  }): ProductPreset {
    if (!MAINTENANCE_PACKAGES.includes(input.maintenancePackage as MaintenancePackageCode)) {
      throw new Error(`ProductPreset: invalid maintenancePackage "${input.maintenancePackage}"`);
    }
    if (!MATURITY_OPTIONS.includes(input.maturityOption as MaturityOptionCode)) {
      throw new Error(`ProductPreset: invalid maturityOption "${input.maturityOption}"`);
    }
    if (!WINTER_OPTIONS.includes(input.winterOption as WinterOptionCode)) {
      throw new Error(`ProductPreset: invalid winterOption "${input.winterOption}"`);
    }
    if (!REGIONS.includes(input.region as RegionCode)) {
      throw new Error(`ProductPreset: invalid region "${input.region}"`);
    }
    return new ProductPreset({
      maintenancePackage: input.maintenancePackage as MaintenancePackageCode,
      maturityOption: input.maturityOption as MaturityOptionCode,
      winterOption: input.winterOption as WinterOptionCode,
      region: input.region as RegionCode,
    });
  }

  get maintenancePackage(): MaintenancePackageCode {
    return this._props.maintenancePackage;
  }
  get maturityOption(): MaturityOptionCode {
    return this._props.maturityOption;
  }
  get winterOption(): WinterOptionCode {
    return this._props.winterOption;
  }
  get region(): RegionCode {
    return this._props.region;
  }

  toPlain(): ProductPresetProps {
    return { ...this._props };
  }
}
