import { describe, it, expect } from 'vitest';
import {
  MaintenancePackage,
  MaturityOption,
  Region,
  VehicleType,
  WinterOption,
} from '../sku-preset.value-object.js';

describe('SKU preset VOs', () => {
  it('MaintenancePackage: accepts known codes; NONE marked excluded', () => {
    for (const code of ['Basic', 'Standard', 'Select', 'Platinum']) {
      expect(MaintenancePackage.of(code).isExcluded).toBe(false);
    }
    expect(MaintenancePackage.of('NONE').isExcluded).toBe(true);
    expect(() => MaintenancePackage.of('Gold')).toThrow();
  });

  it('MaturityOption: accepts 만기선택형/만기인수형; rejects others', () => {
    expect(MaturityOption.of('만기선택형').code).toBe('만기선택형');
    expect(MaturityOption.of('만기인수형').code).toBe('만기인수형');
    expect(() => MaturityOption.of('unknown')).toThrow();
  });

  it('WinterOption: accepts defined codes', () => {
    expect(WinterOption.of('chain-no').code).toBe('chain-no');
    expect(WinterOption.of('chain-yes').code).toBe('chain-yes');
    expect(WinterOption.of('tire-no').code).toBe('tire-no');
    expect(WinterOption.of('tire-yes').code).toBe('tire-yes');
    expect(() => WinterOption.of('none')).toThrow();
  });

  it('Region: accepts defined codes; NONE marked excluded', () => {
    expect(Region.of('서울/경기/인천').isExcluded).toBe(false);
    expect(Region.of('제주').isExcluded).toBe(false);
    expect(Region.of('NONE').isExcluded).toBe(true);
    expect(() => Region.of('부산')).toThrow();
  });

  it('VehicleType: isEv / isHev flags', () => {
    expect(VehicleType.of('EV').isEv).toBe(true);
    expect(VehicleType.of('EV').isHev).toBe(false);
    expect(VehicleType.of('HEV').isHev).toBe(true);
    expect(VehicleType.of('HEV').isEv).toBe(false);
    expect(VehicleType.of('ICE').isEv).toBe(false);
    expect(VehicleType.of('Diesel').isEv).toBe(false);
    expect(() => VehicleType.of('Hydrogen')).toThrow();
  });
});
