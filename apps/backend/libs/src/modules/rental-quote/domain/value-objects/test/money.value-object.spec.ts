import { describe, it, expect } from 'vitest';
import { Money } from '../money.value-object.js';

describe('Money VO', () => {
  it('of() accepts non-negative integers', () => {
    expect(Money.of(0).amount).toBe(0);
    expect(Money.of(189140).amount).toBe(189140);
  });
  it('zero() returns 0 with includesVat default true', () => {
    const m = Money.zero();
    expect(m.amount).toBe(0);
    expect(m.includesVat).toBe(true);
    expect(Money.zero(false).includesVat).toBe(false);
  });
  it('rejects non-finite, non-integer, negative', () => {
    expect(() => Money.of(NaN)).toThrow();
    expect(() => Money.of(1.5)).toThrow();
    expect(() => Money.of(-1)).toThrow();
  });
  it('add/subtract preserve VAT flag', () => {
    const a = Money.of(100000, true);
    const b = Money.of(30000, true);
    expect(a.add(b).amount).toBe(130000);
    expect(a.subtract(b).amount).toBe(70000);
  });
  it('rejects mixing VAT flags', () => {
    const a = Money.of(100000, true);
    const b = Money.of(30000, false);
    expect(() => a.add(b)).toThrow();
    expect(() => a.subtract(b)).toThrow();
  });
  it('subtract never goes negative', () => {
    expect(() => Money.of(100).subtract(Money.of(200))).toThrow();
  });
  it('multiply rounds to integer', () => {
    expect(Money.of(100).multiply(0.333).amount).toBe(33);
  });
  it('equals + toJSON', () => {
    const a = Money.of(123);
    expect(a.equals(Money.of(123))).toBe(true);
    expect(a.equals(Money.of(123, false))).toBe(false);
    expect(a.toJSON()).toEqual({ amount: 123, includesVat: true });
  });
});
