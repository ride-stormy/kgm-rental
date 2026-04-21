import { describe, it, expect } from 'vitest';
import { TrimParserDomainService } from '../trim-parser.domain-service.js';

describe('TrimParserDomainService', () => {
  const svc = new TrimParserDomainService();

  it('maps "EV" to EV with displacement 0', () => {
    const r = svc.parse({ trim: 'T7', modelName: '무쏘 EV' });
    expect(r.vehicleType).toBe('EV');
    expect(r.displacement).toBe(0);
    expect(r.confidence).toBe('high');
  });

  it('maps "하이브리드" to HEV', () => {
    const r = svc.parse({ trim: '하이브리드 프레스티지', modelName: '액티언' });
    expect(r.vehicleType).toBe('HEV');
    expect(r.confidence).toBe('high');
  });

  it('maps "HEV" to HEV', () => {
    const r = svc.parse({ trim: 'HEV 프레스티지', modelName: '액티언' });
    expect(r.vehicleType).toBe('HEV');
  });

  it('maps "L 디젤" to Diesel', () => {
    const r = svc.parse({ trim: 'L 디젤 무쏘 M9 4WD', modelName: '무쏘' });
    expect(r.vehicleType).toBe('Diesel');
    expect(r.confidence).toBe('high');
  });

  it('falls back to ICE with low confidence when no token matches', () => {
    const r = svc.parse({ trim: '블랙엣지', modelName: '토레스' });
    expect(r.vehicleType).toBe('ICE');
    expect(r.confidence).toBe('low');
  });

  it('extracts displacement from "1497cc"', () => {
    const r = svc.parse({ trim: '디젤 1497cc', modelName: '토레스' });
    expect(r.displacement).toBe(1497);
  });

  it('extracts displacement from "2.2L"', () => {
    const r = svc.parse({ trim: 'L 디젤 2.2L', modelName: '무쏘' });
    expect(r.displacement).toBe(2200);
  });

  it('uses model fallback when trim lacks displacement hint', () => {
    const r = svc.parse({ trim: '디젤', modelName: '무쏘' });
    expect(r.displacement).toBe(2157);
  });

  it('throws when both trim and modelName are empty', () => {
    expect(() => svc.parse({ trim: '', modelName: '' })).toThrow();
  });

  it('does not mis-classify HEV as EV', () => {
    const r = svc.parse({ trim: 'HEV', modelName: '액티언' });
    expect(r.vehicleType).toBe('HEV');
  });
});
