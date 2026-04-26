import { notFound } from 'next/navigation';
import snapshot from '../../../products/_fixtures/inventory-snapshot.json';
import { ProductDetailSheet } from '@/app/products/[modelSlug]/_components/ProductDetailSheet';
import {
  isModelSlug,
  resolveThumbnail,
} from '@/app/products/[modelSlug]/_lib/resolveProductParams';
import { groupByModel } from '@/lib/inventory/inventory-mapper';
import { calculatorSchema } from '@/app/products/[modelSlug]/_components/CalculatorInputs/schema';
import type { InventoryItem } from '@kgm-rental/api-contracts/inventory/inventory.schema.js';
import type { CalculatorSchema } from '@/app/products/[modelSlug]/_components/CalculatorInputs/schema';

interface InterceptedProductPageProps {
  params: { modelSlug: string };
  searchParams: Record<string, string | string[] | undefined>;
}

const parseCalculatorDefaults = (
  searchParams: Record<string, string | string[] | undefined>,
): Partial<CalculatorSchema> => {
  const raw: Record<string, number> = {};
  if (searchParams.term) raw.contractMonths = Number(searchParams.term);
  if (searchParams.km) raw.annualKm = Number(searchParams.km);
  if (searchParams.prepaid) raw.prepaidPercent = Number(searchParams.prepaid);
  if (searchParams.subsidy) raw.subsidyPercent = Number(searchParams.subsidy);
  const result = calculatorSchema.partial().safeParse(raw);
  return result.success ? result.data : {};
};

export default function InterceptedProductPage({
  params,
  searchParams,
}: InterceptedProductPageProps): JSX.Element {
  if (!isModelSlug(params.modelSlug)) notFound();

  const items = snapshot.items as InventoryItem[];
  const grouped = groupByModel(items);
  const group = grouped.find((g) => g.slug === params.modelSlug);
  if (!group) notFound();

  const initial = {
    trimLabel: group.minPriceSku.trimLabel,
    colorCode: group.minPriceSku.colorCode,
  };

  const calculatorDefaults = parseCalculatorDefaults(searchParams);

  return (
    <ProductDetailSheet
      skus={group.skus}
      initial={initial}
      thumbnail={resolveThumbnail(params.modelSlug)}
      calculatorDefaults={calculatorDefaults}
    />
  );
}
