import { describe, it, expect } from 'vitest';
import { roundUp, roundDown } from '../krw-round.js';

describe('krwRound — roundUp (Excel ROUNDUP parity)', () => {
  it('rounds 100 won unit up (digits = -2)', () => {
    expect(roundUp(480170, -2)).toBe(480200);
  });
  it('rounds 1000 won unit up (digits = -3)', () => {
    expect(roundUp(12075000.3, -3)).toBe(12076000);
    expect(roundUp(29296800, -3)).toBe(29297000);
  });
  it('preserves already-rounded values', () => {
    expect(roundUp(480200, -2)).toBe(480200);
  });
  it('zero is zero', () => {
    expect(roundUp(0, -2)).toBe(0);
  });
  it('rounds negatives AWAY from zero (Excel semantic)', () => {
    expect(roundUp(-480170, -2)).toBe(-480200);
  });
});

describe('krwRound — roundDown (Excel ROUNDDOWN parity)', () => {
  it('rounds 10 won unit down (digits = -1)', () => {
    expect(roundDown(251562.5, -1)).toBe(251560);
    expect(roundDown(339083.33, -1)).toBe(339080);
  });
  it('already-aligned values unchanged', () => {
    expect(roundDown(48020, -1)).toBe(48020);
  });
  it('zero is zero', () => {
    expect(roundDown(0, -1)).toBe(0);
  });
  it('rounds negatives TOWARD zero (Excel semantic)', () => {
    expect(roundDown(-251562.5, -1)).toBe(-251560);
  });
});
