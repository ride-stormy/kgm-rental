import { notFound } from 'next/navigation';
import snapshot from '../_fixtures/inventory-snapshot.json';
import { ProductDetailContent } from './_components/ProductDetailContent';
import { isModelSlug, resolveThumbnail } from './_lib/resolveProductParams';
import { groupByModel } from '@/lib/inventory/inventory-mapper';
import { calculatorSchema } from './_components/CalculatorInputs/schema';
import type { InventoryItem } from '@kgm-rental/api-contracts/inventory/inventory.schema.js';
import type { CalculatorSchema } from './_components/CalculatorInputs/schema';

interface ProductDetailPageProps {
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

export default function ProductDetailPage({
  params,
  searchParams,
}: ProductDetailPageProps): JSX.Element {
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
    <main className="mx-auto flex min-h-screen min-w-[375px] max-w-[540px] flex-col bg-white">
      <ProductDetailContent
        skus={group.skus}
        initial={initial}
        thumbnail={resolveThumbnail(params.modelSlug)}
        calculatorDefaults={calculatorDefaults}
      />
    </main>
  );
}
