import Link from 'next/link';
import { getFixtureProducts } from './_fixtures/loader';

export const dynamic = 'force-dynamic';

export default function XlsxProductListPage(): JSX.Element {
  const products = getFixtureProducts();
  const formatKrw = (n: number): string => new Intl.NumberFormat('ko-KR').format(n);

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-10 lg:px-10">
      <header className="mb-8">
        <div className="text-xs font-medium text-slate-500">XLSX 프리뷰</div>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          실제 차량 견적기 체험
        </h1>
        <p className="mt-3 max-w-prose text-sm text-slate-700">
          백엔드/DB 없이 <code>pre-docs/vehicle-groups-20260420.xlsx</code>의 실제 차량 데이터로
          견적 구성 UI를 체험할 수 있습니다. 결제 내역은 로컬에서 근사 계산된 값이에요.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/products/xlsx/${p.slug}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-brand-accent"
            >
              <div className="text-xs font-medium text-slate-500">{p.brandName}</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{p.name}</div>
              <div className="mt-3 text-sm text-slate-600">
                월 {formatKrw(p.minMonthlyRent)}원 부터
              </div>
              <div className="mt-1 text-xs text-slate-500">
                트림 {p.skus.length}종 · 색상 {p.colorSwatch.length}종
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
