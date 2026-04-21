import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorSwatch } from './ColorSwatch';
import type { ProductCard as ProductCardDto } from '@kgm-rental/api-contracts/product/product-card.schema.js';

export const ProductCard = ({ card }: { card: ProductCardDto }): JSX.Element => {
  return (
    <Link
      href={`/products/${card.slug}`}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-xl"
    >
      <Card className="h-full transition-shadow hover:shadow-md">
        <div className="aspect-[16/10] w-full overflow-hidden rounded-t-xl bg-slate-100">
          {/* Stage A: placeholder — Stage B will swap in optimized <Image>. */}
          <div className="flex h-full w-full items-center justify-center text-slate-400 text-sm">
            {card.heroImage ? card.heroImage.split('/').pop() : 'no image'}
          </div>
        </div>
        <CardHeader>
          <div className="text-xs font-medium text-slate-500">{card.brandName}</div>
          <CardTitle>{card.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 text-sm">
            <span className="font-semibold text-slate-900">
              월 {formatKrw(card.minMonthlyRent)}원
            </span>
            <span className="text-slate-500">부터~</span>
          </div>
          <div className="flex items-center justify-between">
            <ColorSwatch items={card.colorSwatch} />
            <div className="flex flex-wrap gap-1">
              {card.promotionTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const formatKrw = (value: number): string =>
  new Intl.NumberFormat('ko-KR').format(value);
