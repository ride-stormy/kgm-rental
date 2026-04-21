'use client';

import { SkuSlider } from '@/components/product/SkuSlider';
import type { VehicleSkuDto } from '@kgm-rental/api-contracts/product/vehicle-sku.schema.js';

interface SkuSectionProps {
  skus: VehicleSkuDto[];
  selectedSkuId: string | null;
  onSelectSku: (skuId: string) => void;
}

export const SkuSection = ({
  skus,
  selectedSkuId,
  onSelectSku,
}: SkuSectionProps): JSX.Element => (
  <section aria-labelledby="sku-section-heading" className="mb-10">
    <div className="mb-3 flex items-baseline justify-between">
      <h2
        id="sku-section-heading"
        className="text-lg font-semibold text-slate-900"
      >
        STEP 1. 차량 정보 확인
      </h2>
      <span className="text-xs text-slate-500">
        총 {skus.length}개 트림
      </span>
    </div>
    <SkuSlider
      skus={skus}
      selectedId={selectedSkuId}
      onSelect={onSelectSku}
    />
  </section>
);
