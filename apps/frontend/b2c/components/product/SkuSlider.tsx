'use client';

import { cn } from '@/lib/cn';
import { sanitize } from '@/lib/forbidden-expressions';
import type { VehicleSkuDto } from '@kgm-rental/api-contracts/product/vehicle-sku.schema.js';

interface SkuSliderProps {
  skus: VehicleSkuDto[];
  selectedId: string | null;
  onSelect: (skuId: string) => void;
}

export const SkuSlider = ({
  skus,
  selectedId,
  onSelect,
}: SkuSliderProps): JSX.Element => {
  if (skus.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
        선택할 수 있는 재고가 없어요.
      </div>
    );
  }

  return (
    <div
      role="listbox"
      aria-label="차량 트림 및 색상 선택"
      className="flex snap-x gap-3 overflow-x-auto pb-2"
    >
      {skus.map((sku) => {
        const isSelected = selectedId === sku.id;
        const optionSummary = sku.options.length > 0
          ? sanitize(sku.options.join(' · ')).sanitized
          : '기본 옵션';
        return (
          <button
            key={sku.id}
            type="button"
            role="option"
            aria-selected={isSelected}
            onClick={() => onSelect(sku.id)}
            className={cn(
              'flex min-w-[260px] snap-start flex-col gap-2 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
              isSelected
                ? 'border-brand-accent bg-blue-50 ring-2 ring-brand-accent'
                : 'border-slate-200 bg-white hover:border-slate-300',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-base font-semibold text-slate-900">
                  {formatKrw(sku.price)}원
                </div>
                <div className="mt-0.5 text-xs text-slate-500">{sku.trim}</div>
              </div>
              <StockBadge stock={sku.stockBucket} />
            </div>

            <div className="flex items-center gap-1.5">
              <VehicleTypeBadge type={sku.vehicleType} />
              {sku.displacement > 0 ? (
                <span className="text-xs text-slate-500">
                  {formatKrw(sku.displacement)}cc
                </span>
              ) : null}
            </div>

            <div className="line-clamp-2 text-xs text-slate-600">
              {optionSummary}
            </div>

            <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-2">
              <span
                aria-hidden
                className="h-4 w-4 rounded-full border border-slate-200 bg-slate-100"
              />
              <span className="text-xs text-slate-600">
                {sku.colorExteriorName}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

interface StockBadgeProps {
  stock: number;
}

const StockBadge = ({ stock }: StockBadgeProps): JSX.Element => {
  const label = stock === 0
    ? '재고 없음'
    : stock <= 2
      ? `${stock}대 남음`
      : '빠른 출고';
  const tone = stock === 0
    ? 'bg-slate-100 text-slate-500'
    : stock <= 2
      ? 'bg-amber-50 text-amber-700'
      : 'bg-emerald-50 text-emerald-700';
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
        tone,
      )}
    >
      {label}
    </span>
  );
};

interface VehicleTypeBadgeProps {
  type: VehicleSkuDto['vehicleType'];
}

const VehicleTypeBadge = ({ type }: VehicleTypeBadgeProps): JSX.Element => {
  const tone = type === 'EV'
    ? 'bg-emerald-50 text-emerald-700'
    : type === 'HEV'
      ? 'bg-sky-50 text-sky-700'
      : 'bg-slate-100 text-slate-700';
  return (
    <span className={cn('rounded px-1.5 py-0.5 text-[11px] font-medium', tone)}>
      {type}
    </span>
  );
};

const formatKrw = (value: number): string =>
  new Intl.NumberFormat('ko-KR').format(value);
