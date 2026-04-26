'use client';

import { ConfigurationProvider } from '../_context/ConfigurationContext';
import { CalculatorFormProvider, CalculatorInputs } from './CalculatorInputs';
import { SummaryBar } from './SummaryBar';
import { TrimChipList } from './TrimChipList';
import { ColorChipList } from './ColorChipList';
import { IncludedOptions } from './IncludedOptions';
import { BottomCTA } from './BottomCTA';
import type { InventorySku } from '@/lib/inventory/inventory-mapper';
import type { CalculatorSchema } from './CalculatorInputs/schema';

interface ProductDetailContentProps {
  skus: readonly InventorySku[];
  initial: { trimLabel: string; colorCode: string };
  thumbnail: string;
  calculatorDefaults?: Partial<CalculatorSchema>;
}

export const ProductDetailContent = ({
  skus,
  initial,
  thumbnail,
  calculatorDefaults,
}: ProductDetailContentProps) => (
  <ConfigurationProvider initial={{ ...initial, skuId: null }} skus={skus} thumbnail={thumbnail}>
    <CalculatorFormProvider defaults={calculatorDefaults}>
      <SummaryBar />
      <div className="flex flex-col gap-5 bg-white pt-3">
        <TrimChipList />
        <ColorChipList />
        <IncludedOptions />
      </div>
      <CalculatorInputs />
      <BottomCTA />
    </CalculatorFormProvider>
  </ConfigurationProvider>
);
