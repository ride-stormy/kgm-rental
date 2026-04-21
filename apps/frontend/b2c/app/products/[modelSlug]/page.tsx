import { notFound } from 'next/navigation';
import { fetchProductDetail } from '@/lib/api-client';
import { ColorSwatch } from '@/components/product/ColorSwatch';
import { sanitize } from '@/lib/forbidden-expressions';
import { ConfiguratorClient } from './_components/ConfiguratorClient';

interface ProductDetailPageProps {
  params: { modelSlug: string };
}

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps): Promise<JSX.Element> {
  const response = await fetchProductDetail(params.modelSlug);
  if (!response.success || !response.data) {
    notFound();
  }
  const detail = response.data;
  const desc = sanitize(detail.description).sanitized;

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-10 lg:px-10">
      <header className="mb-8 flex items-start justify-between gap-6">
        <div>
          <div className="text-xs font-medium text-slate-500">
            {detail.brandName}
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {detail.name}
          </h1>
          <p className="mt-3 max-w-prose text-sm text-slate-700">{desc}</p>
        </div>
        <ColorSwatch items={detail.colorSwatch} />
      </header>

      <div className="mb-10 aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
        <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
          {detail.heroImage.split('/').pop()}
        </div>
      </div>

      <ConfiguratorClient product={detail} />
    </main>
  );
}
