import fixture from './vehicles.json';
import type { ProductDetail } from '@kgm-rental/api-contracts/product/product-detail.schema.js';

interface FixtureFile {
  products: ProductDetail[];
}

export const getFixtureProducts = (): ProductDetail[] => (fixture as FixtureFile).products;

export const getFixtureProductBySlug = (slug: string): ProductDetail | null => {
  const products = getFixtureProducts();
  return products.find((p) => p.slug === slug) ?? null;
};
