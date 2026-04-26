'use client';

import { Drawer } from 'vaul';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { ProductDetailContent } from './ProductDetailContent';
import type { InventorySku } from '@/lib/inventory/inventory-mapper';
import type { CalculatorSchema } from './CalculatorInputs/schema';

interface ProductDetailSheetProps {
  skus: readonly InventorySku[];
  initial: { trimLabel: string; colorCode: string };
  thumbnail: string;
  calculatorDefaults?: Partial<CalculatorSchema>;
}

export const ProductDetailSheet = ({ skus, initial, thumbnail, calculatorDefaults }: ProductDetailSheetProps) => {
  const router = useRouter();

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) router.back();
    },
    [router],
  );

  return (
    <Drawer.Root open onOpenChange={handleOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[85vh] min-w-[375px] max-w-[540px] flex-col overflow-hidden rounded-t-[20px] bg-white outline-none">
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-gray-200" aria-hidden />
          <Drawer.Title className="sr-only">차량 상세</Drawer.Title>
          <Drawer.Description className="sr-only">
            트림과 색상을 선택하고 예상 월 납입금을 확인하세요.
          </Drawer.Description>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <ProductDetailContent skus={skus} initial={initial} thumbnail={thumbnail} calculatorDefaults={calculatorDefaults} />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
