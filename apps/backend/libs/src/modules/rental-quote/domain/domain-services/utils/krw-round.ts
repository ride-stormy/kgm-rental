// Excel ROUNDUP / ROUNDDOWN with negative digit argument.
// KRW quote calculator relies on the same rounding behavior as the Meritz xlsm,
// so this utility must match Excel's spec exactly.
//
// Negative num_digits rounds the integer part:
//   ROUNDUP(480170, -2)     = 480200
//   ROUNDDOWN(251562.5, -1) = 251560
//   ROUNDUP(12075000.3, -3) = 12076000
//
// Values stay finite integers (Korean won has no fractional sub-unit).

type RoundFn = (value: number, digits: number) => number;

const factor = (digits: number): number => {
  // digits = -2 → 100, digits = 0 → 1, digits = 2 → 0.01
  return Math.pow(10, -digits);
};

export const roundUp: RoundFn = (value, digits) => {
  if (!Number.isFinite(value)) throw new Error(`roundUp: non-finite value ${value}`);
  const f = factor(digits);
  if (value === 0) return 0;
  // Excel ROUNDUP rounds AWAY from zero.
  return value > 0 ? Math.ceil(value / f) * f : -Math.ceil(-value / f) * f;
};

export const roundDown: RoundFn = (value, digits) => {
  if (!Number.isFinite(value)) throw new Error(`roundDown: non-finite value ${value}`);
  const f = factor(digits);
  if (value === 0) return 0;
  // Excel ROUNDDOWN rounds TOWARD zero.
  return value > 0 ? Math.floor(value / f) * f : -Math.floor(-value / f) * f;
};
