import { getFixtureProducts } from './products/xlsx/_fixtures/loader';
import { ActyonSection } from './_components/landing/ActyonSection';
import { HeroSection } from './_components/landing/HeroSection';
import { ProductsSection } from './_components/landing/ProductsSection';
import { TorresSection } from './_components/landing/TorresSection';
import { CalculatorSection } from './_components/landing/CalculatorSection';
import { MODEL_ORDER } from './_content/landing';
import { CAR_ITEM_DEFAULTS, computeCarItemPricing, findMinSku } from '@/lib/vehicle-pricing';
import type { ProductDetail } from '@kgm-rental/api-contracts/product/product-detail.schema.js';
import type { QuoteState } from '@/lib/use-quote-estimation';

const DEFAULT_CALCULATOR_MODEL_SLUG = '2025-torres';

const buildCalculatorInitial = (products: ProductDetail[]): QuoteState | null => {
  const defaultProduct = products.find((p) => p.slug === DEFAULT_CALCULATOR_MODEL_SLUG)
    ?? products[0];
  if (!defaultProduct) return null;
  const minSku = findMinSku(defaultProduct);
  if (!minSku) return null;
  return {
    modelSlug: defaultProduct.slug,
    skuId: minSku.skuId,
    contractMonths: CAR_ITEM_DEFAULTS.contractMonths,
    annualKm: CAR_ITEM_DEFAULTS.annualKm,
    prepaidPercent: CAR_ITEM_DEFAULTS.prepaidPercent,
    subsidyPercent: CAR_ITEM_DEFAULTS.subsidyPercent,
  };
};

const LandingPage = (): JSX.Element => {
  const allProducts = getFixtureProducts();
  const landingProducts = MODEL_ORDER
    .map((slug) => allProducts.find((p) => p.slug === slug))
    .filter((p): p is ProductDetail => p !== undefined);

  const pricing = computeCarItemPricing(landingProducts);
  const initial = buildCalculatorInitial(landingProducts);

  return (
    <main className="mx-auto min-w-[375px] max-w-[540px] bg-white">
      <HeroSection />
      <ActyonSection />
      <TorresSection />
      <ProductsSection pricing={pricing} />
      {initial ? (
        <CalculatorSection products={landingProducts} initial={initial} />
      ) : null}
    </main>
  );
};

export default LandingPage;
