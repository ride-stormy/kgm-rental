import { describe, expect, it } from 'vitest';
import { resolveModelSlug } from './slug-mapper';

const base = {
  modelName: '',
  modelCode: '',
  vehicleModelName: null as string | null,
};

describe('resolveModelSlug', () => {
  it('maps 액티언 하이브리드', () => {
    expect(
      resolveModelSlug({
        ...base,
        vehicleModelName: '액티언 하이브리드',
        modelCode: 'OP5',
        modelName: '액티언 하이브리드 S8',
      })
    ).toBe('actyon-hev');
  });

  it('maps 더 뉴 토레스', () => {
    expect(
      resolveModelSlug({
        ...base,
        vehicleModelName: '더 뉴 토레스',
        modelCode: 'MW5',
        modelName: '토레스 블랙엣지 2WD',
      })
    ).toBe('2025-torres');
  });

  it('returns undefined for null vehicleModelName', () => {
    expect(
      resolveModelSlug({ ...base, vehicleModelName: null })
    ).toBeUndefined();
  });

  it('returns undefined for 더 뉴 티볼리 (no longer supported)', () => {
    expect(
      resolveModelSlug({
        ...base,
        vehicleModelName: '더 뉴 티볼리',
        modelCode: 'XW5',
        modelName: '더 뉴 티볼리 1.5 V7',
      })
    ).toBeUndefined();
  });

  it('returns undefined for 무쏘 (no longer supported)', () => {
    expect(
      resolveModelSlug({
        ...base,
        vehicleModelName: '무쏘',
        modelCode: 'UH5',
        modelName: '무쏘 L 디젤 무쏘 M7 4WD',
      })
    ).toBeUndefined();
  });

  it('returns undefined for 무쏘 EV (no longer supported)', () => {
    expect(
      resolveModelSlug({
        ...base,
        vehicleModelName: '무쏘 EV',
        modelCode: 'MD5',
        modelName: '무쏘 EV MX 2WD',
      })
    ).toBeUndefined();
  });

  it('returns undefined for unknown vehicleModelName', () => {
    expect(
      resolveModelSlug({
        ...base,
        vehicleModelName: '신규모델',
        modelCode: 'ZZ5',
        modelName: 'anything',
      })
    ).toBeUndefined();
  });
});
