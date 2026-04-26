import Link from 'next/link';

export default function ProductNotFound(): JSX.Element {
  return (
    <main className="mx-auto min-w-[375px] max-w-[540px] px-5 py-20 text-center">
      <h1 className="text-xl font-bold text-slate-900">차량을 찾을 수 없습니다</h1>
      <p className="mt-3 text-sm text-slate-600">URL을 다시 확인하거나 메인으로 돌아가세요.</p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-[#5E2CB6] px-5 py-3 text-sm font-medium text-white"
      >
        메인으로 돌아가기
      </Link>
    </main>
  );
}
