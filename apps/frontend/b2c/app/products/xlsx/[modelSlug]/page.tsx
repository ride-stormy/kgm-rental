import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ColorSwatch } from '@/components/product/ColorSwatch';
import { sanitize } from '@/lib/forbidden-expressions';
import { getFixtureProductBySlug } from '../_fixtures/loader';
import { MockConfiguratorClient } from '../_components/MockConfiguratorClient';

interface XlsxProductDetailPageProps {
  params: { modelSlug: string };
}

export const dynamic = 'force-dynamic';

export default function XlsxProductDetailPage({
  params,
}: XlsxProductDetailPageProps): JSX.Element {
  const product = getFixtureProductBySlug(params.modelSlug);
  if (!product) notFound();
  const desc = sanitize(product.description).sanitized;

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-10 lg:px-10">
      <nav className="mb-4 text-xs text-slate-500">
        <Link href="/products/xlsx" className="hover:text-brand-accent">
          ← 차량 목록
        </Link>
        <span className="mx-2">·</span>
        <span className="rounded bg-amber-50 px-1.5 py-0.5 font-medium text-amber-700">
          XLSX 프리뷰 — 견적은 근사값
        </span>
      </nav>

      <header className="mb-8 flex items-start justify-between gap-6">
        <div>
          <div className="text-xs font-medium text-slate-500">
            {product.brandName}
          </div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {product.name}
          </h1>
          <p className="mt-3 max-w-prose text-sm text-slate-700">{desc}</p>
        </div>
        <ColorSwatch items={product.colorSwatch} />
      </header>

      <div className="mb-10 aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100">
        <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
          {product.heroImage.split('/').pop()}
        </div>
      </div>

      <MockConfiguratorClient product={product} />
    </main>
  );
}
