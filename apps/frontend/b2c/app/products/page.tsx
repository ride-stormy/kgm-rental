import { fetchProducts } from '@/lib/api-client';
import { ProductCard } from '@/components/product/ProductCard';

// Stage A: render at request time. API is not available during `next build`.
// Stage B will switch to ISR with `revalidate = 60` once deploy wiring lands.
export const dynamic = 'force-dynamic';

export default async function ProductsPage(): Promise<JSX.Element> {
  const response = await fetchProducts();
  const items = response.data?.items ?? [];
  return (
    <main className="mx-auto max-w-[1100px] px-5 py-10 lg:px-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">차량 카탈로그</h1>
        <p className="mt-1 text-sm text-slate-600">{items.length}대 모델 · Stage A 레이아웃</p>
      </header>
      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          등록된 차량이 없습니다. 시더를 먼저 실행하세요.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((card) => (
            <ProductCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </main>
  );
}
