import { describe, expect, it } from 'vitest';
import { normalizeTypo } from './typo-normalizer';

describe('normalizeTypo', () => {
  it('passes through correct text without changes', () => {
    expect(normalizeTypo('무쏘 EV 블랙엣지 2WD')).toEqual({
      text: '무쏘 EV 블랙엣지 2WD',
      hit: 0,
    });
  });

  it('fixes 블랙엔지 → 블랙엣지', () => {
    expect(normalizeTypo('무쏘 EV 블랙엔지 2WD')).toEqual({
      text: '무쏘 EV 블랙엣지 2WD',
      hit: 1,
    });
  });

  it('fixes 볼랙엣지 → 블랙엣지', () => {
    expect(normalizeTypo('토레스 볼랙엣지 2WD')).toEqual({
      text: '토레스 블랙엣지 2WD',
      hit: 1,
    });
  });

  it('fixes 액티온 → 액티언 only before 하이브리드', () => {
    expect(normalizeTypo('액티온 하이브리드 하이브리드 S8')).toEqual({
      text: '액티언 하이브리드 하이브리드 S8',
      hit: 1,
    });
  });

  it('does not touch 액티온 outside 하이브리드 context', () => {
    expect(normalizeTypo('액티온빈')).toEqual({ text: '액티온빈', hit: 0 });
  });

  it('fixes trim suffix 58 → S8 in 하이브리드 context', () => {
    expect(normalizeTypo('액티언 하이브리드 하이브리드 58')).toEqual({
      text: '액티언 하이브리드 하이브리드 S8',
      hit: 1,
    });
  });

  it('fixes leading 무소 → 무쏘 only when followed by space', () => {
    expect(normalizeTypo('무소 EV MX 2WD')).toEqual({
      text: '무쏘 EV MX 2WD',
      hit: 1,
    });
  });

  it('returns empty for empty input', () => {
    expect(normalizeTypo('')).toEqual({ text: '', hit: 0 });
  });
});
