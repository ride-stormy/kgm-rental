import { headers } from 'next/headers';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { ActyonSection } from './_components/landing/ActyonSection';
import { CalculatorSection } from './_components/landing/CalculatorSection';
import { ExperienceCenterSection } from './_components/landing/ExperienceCenterSection';
import { HeroSection } from './_components/landing/HeroSection';
import { ProductsSection } from './_components/landing/ProductsSection';
import { TorresSection } from './_components/landing/TorresSection';
import { INVENTORIES_QUERY_KEY } from './_components/landing/hooks/inventories-query-key';
import { groupByModel } from '@/lib/inventory/inventory-mapper';
import type { InventoriesQueryData } from './_components/landing/hooks/inventories-query-key';
import type { InventoryListResponse } from '@kgm-rental/api-contracts/inventory/inventory.schema.js';

const FALLBACK_DATA: InventoriesQueryData = {
  items: [],
  totalElements: 0,
  timestamp: new Date(0).toISOString(),
  rawResponse: {
    items: [],
    totalElements: 0,
    timestamp: new Date(0).toISOString(),
    error: 'prefetch_unavailable',
  },
};

const resolveOrigin = (): string => {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv;
  const h = headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'http';
  if (host) return `${proto}://${host}`;
  return 'http://localhost:4001';
};

const fetchInventoriesOnServer = async (): Promise<InventoriesQueryData> => {
  try {
    const origin = resolveOrigin();
    const res = await fetch(`${origin}/api/inventories`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return FALLBACK_DATA;
    const body = (await res.json()) as InventoryListResponse;
    return {
      items: groupByModel(body.items),
      totalElements: body.totalElements,
      timestamp: body.timestamp,
      rawResponse: body,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[page.tsx] inventories prefetch failed', err);
    return FALLBACK_DATA;
  }
};

const LandingPage = async (): Promise<JSX.Element> => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: [...INVENTORIES_QUERY_KEY],
    queryFn: fetchInventoriesOnServer,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="mx-auto min-w-[375px] max-w-[540px] bg-white">
        <HeroSection />
        <ActyonSection />
        <TorresSection />
        <ProductsSection />
        <CalculatorSection />
        <ExperienceCenterSection />
      </main>
    </HydrationBoundary>
  );
};

export default LandingPage;
