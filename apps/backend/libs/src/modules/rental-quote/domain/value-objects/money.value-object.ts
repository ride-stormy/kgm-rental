// KRW money value object. Internal representation is integer won.
// `includesVat` records whether the amount is VAT-inclusive so that accidental
// mixing of gross/net amounts fails at the type level.

export type MoneyJson = { amount: number; includesVat: boolean };

export class Money {
  private constructor(
    public readonly amount: number,
    public readonly includesVat: boolean,
  ) {}

  static of(amount: number, includesVat = true): Money {
    if (!Number.isFinite(amount)) throw new Error(`Money.of: non-finite amount ${amount}`);
    if (!Number.isInteger(amount)) throw new Error(`Money.of: KRW must be integer, got ${amount}`);
    if (amount < 0) throw new Error(`Money.of: negative amount ${amount}`);
    return new Money(amount, includesVat);
  }

  static zero(includesVat = true): Money {
    return new Money(0, includesVat);
  }

  add(other: Money): Money {
    this.requireSameVatFlag(other);
    return new Money(this.amount + other.amount, this.includesVat);
  }

  subtract(other: Money): Money {
    this.requireSameVatFlag(other);
    const next = this.amount - other.amount;
    if (next < 0) throw new Error('Money.subtract: result would be negative');
    return new Money(next, this.includesVat);
  }

  multiply(factor: number): Money {
    const next = Math.round(this.amount * factor);
    return new Money(next, this.includesVat);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.includesVat === other.includesVat;
  }

  toJSON(): MoneyJson {
    return { amount: this.amount, includesVat: this.includesVat };
  }

  private requireSameVatFlag(other: Money): void {
    if (this.includesVat !== other.includesVat) {
      throw new Error('Money: VAT-inclusive and VAT-exclusive amounts cannot mix');
    }
  }
}
