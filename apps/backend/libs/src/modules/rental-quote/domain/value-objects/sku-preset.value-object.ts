// SKU-fixed presets. Customer does NOT choose these. Each SKU carries one
// maintenance / maturity / winter / region preset decided by the product admin.
//
// Setting a preset to 'NONE' deliberately excludes that cost component
// (e.g. cheaper product tier without maintenance). The calculator will treat
// 'NONE' as 0 in cost computation.

export const MAINTENANCE_PACKAGES = ['Basic', 'Standard', 'Select', 'Platinum', 'NONE'] as const;
export type MaintenancePackageCode = (typeof MAINTENANCE_PACKAGES)[number];

export const MATURITY_OPTIONS = ['만기선택형', '만기인수형'] as const;
export type MaturityOptionCode = (typeof MATURITY_OPTIONS)[number];

export const WINTER_OPTIONS = ['chain-yes', 'chain-no', 'tire-yes', 'tire-no'] as const;
export type WinterOptionCode = (typeof WINTER_OPTIONS)[number];

export const REGIONS = [
  '서울/경기/인천',
  '충남',
  '충북',
  '경북',
  '경남',
  '전북',
  '전남',
  '강원(영서)',
  '강원(영동)',
  '제주',
  'NONE',
] as const;
export type RegionCode = (typeof REGIONS)[number];

export const VEHICLE_TYPES = ['ICE', 'HEV', 'EV', 'Diesel'] as const;
export type VehicleTypeCode = (typeof VEHICLE_TYPES)[number];

export class MaintenancePackage {
  private constructor(public readonly code: MaintenancePackageCode) {}
  static of(code: string): MaintenancePackage {
    if (!MAINTENANCE_PACKAGES.includes(code as MaintenancePackageCode)) {
      throw new Error(`MaintenancePackage.of: unknown code ${code}`);
    }
    return new MaintenancePackage(code as MaintenancePackageCode);
  }
  get isExcluded(): boolean {
    return this.code === 'NONE';
  }
}

export class MaturityOption {
  private constructor(public readonly code: MaturityOptionCode) {}
  static of(code: string): MaturityOption {
    if (!MATURITY_OPTIONS.includes(code as MaturityOptionCode)) {
      throw new Error(`MaturityOption.of: unknown code ${code}`);
    }
    return new MaturityOption(code as MaturityOptionCode);
  }
}

export class WinterOption {
  private constructor(public readonly code: WinterOptionCode) {}
  static of(code: string): WinterOption {
    if (!WINTER_OPTIONS.includes(code as WinterOptionCode)) {
      throw new Error(`WinterOption.of: unknown code ${code}`);
    }
    return new WinterOption(code as WinterOptionCode);
  }
}

export class Region {
  private constructor(public readonly code: RegionCode) {}
  static of(code: string): Region {
    if (!REGIONS.includes(code as RegionCode)) {
      throw new Error(`Region.of: unknown code ${code}`);
    }
    return new Region(code as RegionCode);
  }
  get isExcluded(): boolean {
    return this.code === 'NONE';
  }
}

export class VehicleType {
  private constructor(public readonly code: VehicleTypeCode) {}
  static of(code: string): VehicleType {
    if (!VEHICLE_TYPES.includes(code as VehicleTypeCode)) {
      throw new Error(`VehicleType.of: unknown code ${code}`);
    }
    return new VehicleType(code as VehicleTypeCode);
  }
  get isEv(): boolean {
    return this.code === 'EV';
  }
  get isHev(): boolean {
    return this.code === 'HEV';
  }
}
