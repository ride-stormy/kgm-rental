// Kebab-case URL slug. Lowercase letters, digits, hyphen only.
// Examples: "2025-torres", "musso-ev", "tivoli"

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class Slug {
  private constructor(public readonly value: string) {}

  static of(input: string): Slug {
    const v = input.trim();
    if (!SLUG_PATTERN.test(v)) {
      throw new Error(`Slug.of: invalid slug "${input}". Must match ${SLUG_PATTERN}`);
    }
    return new Slug(v);
  }

  equals(other: Slug): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
