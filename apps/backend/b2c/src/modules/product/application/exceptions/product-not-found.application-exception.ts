export class ProductNotFoundApplicationException extends Error {
  public readonly code = 'PRODUCT_NOT_FOUND' as const;
  constructor(public readonly slug: string) {
    super(`Product not found for slug: ${slug}`);
    this.name = 'ProductNotFoundApplicationException';
  }
}

export class SkuNotFoundApplicationException extends Error {
  public readonly code = 'SKU_NOT_FOUND' as const;
  constructor(public readonly skuId: string, public readonly modelSlug?: string) {
    super(`SKU not found: ${skuId}${modelSlug ? ` (model ${modelSlug})` : ''}`);
    this.name = 'SkuNotFoundApplicationException';
  }
}
