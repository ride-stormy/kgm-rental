import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ProductNotFound(): JSX.Element {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-900">모델을 찾을 수 없습니다</h1>
      <p className="mt-3 text-slate-600">URL을 다시 확인하거나 카탈로그로 돌아가세요.</p>
      <div className="mt-8">
        <Link href="/products">
          <Button variant="outline">카탈로그로 돌아가기</Button>
        </Link>
      </div>
    </main>
  );
}
