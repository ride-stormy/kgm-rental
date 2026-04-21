// Excel PMT function ported 1:1.
// Monthly loan payment = PMT(rate, nper, pv, fv, type)
//
// rate   : periodic rate (monthly = annual / 12)
// nper   : total number of periods
// pv     : present value (negative = money received, positive = money paid)
// fv     : future value (residual). Default 0.
// type   : 0 = end of period, 1 = beginning. Default 0.
//
// Excel sign convention is preserved: a loan you receive as pv=-X returns a
// positive payment amount per period.

export function pmt(
  rate: number,
  nper: number,
  pv: number,
  fv: number = 0,
  type: 0 | 1 = 0,
): number {
  if (!Number.isFinite(rate) || !Number.isFinite(nper) || !Number.isFinite(pv) || !Number.isFinite(fv)) {
    throw new Error('pmt: non-finite input');
  }
  if (nper === 0) throw new Error('pmt: nper must be non-zero');
  if (rate === 0) return -(pv + fv) / nper;
  const pvif = Math.pow(1 + rate, nper);
  return -(rate * (pv * pvif + fv)) / ((1 + rate * type) * (pvif - 1));
}
