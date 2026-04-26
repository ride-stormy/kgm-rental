import { describe, expect, it } from 'vitest';
import { configurationReducer } from './configurationReducer';
import type { ConfigurationState } from './types';

const initial: ConfigurationState = { trimLabel: 'S8', colorCode: 'WAA', skuId: null };

describe('configurationReducer', () => {
  it('selects trim', () => {
    const next = configurationReducer(initial, { type: 'SELECT_TRIM', trimLabel: 'S7' });
    expect(next.trimLabel).toBe('S7');
    expect(next.colorCode).toBe('WAA');
  });

  it('selects color', () => {
    const next = configurationReducer(initial, { type: 'SELECT_COLOR', colorCode: 'LAK' });
    expect(next.trimLabel).toBe('S8');
    expect(next.colorCode).toBe('LAK');
  });

  it('returns state unchanged on unknown action', () => {
    const next = configurationReducer(initial, {
      type: 'UNKNOWN',
    } as unknown as Parameters<typeof configurationReducer>[1]);
    expect(next).toBe(initial);
  });
});
