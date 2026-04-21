'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import {
  ConfiguratorSchema,
  INITIAL_VALUES,
  type ConfiguratorInput,
} from '@/lib/validators/configurator.schema';
import { ConfigForm } from '../../[modelSlug]/_components/ConfigForm';
import { PaymentPanel } from '../../[modelSlug]/_components/PaymentPanel';
import { SkuSection } from '../../[modelSlug]/_components/SkuSection';
import { computeMockQuote, computeMockResidualValue } from './mockQuote';
import type { ProductDetail } from '@kgm-rental/api-contracts/product/product-detail.schema.js';

interface MockConfiguratorClientProps {
  product: ProductDetail;
}

export const MockConfiguratorClient = ({
  product,
}: MockConfiguratorClientProps): JSX.Element => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialSkuId = useMemo(
    () => resolveInitialSkuId(product, searchParams.get('sku')),
    [product, searchParams],
  );
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(initialSkuId);

  const form = useForm<ConfiguratorInput>({
    resolver: zodResolver(ConfiguratorSchema),
    defaultValues: INITIAL_VALUES,
    mode: 'onChange',
  });

  const values = form.watch();
  const isValid = form.formState.isValid;

  const selectedSku = useMemo(
    () => product.skus.find((sku) => sku.id === selectedSkuId) ?? null,
    [product.skus, selectedSkuId],
  );
  const basePrice = selectedSku?.price ?? 0;

  const quote = useMemo(() => {
    if (!selectedSku || !isValid) return null;
    return computeMockQuote({
      basePrice,
      contractPeriod: Number(values.contractPeriod),
      annualMileage: Number(values.annualMileage),
      prepaidRate: Number(values.prepaidRate),
      depositRate: Number(values.depositRate),
    });
  }, [
    selectedSku,
    isValid,
    basePrice,
    values.contractPeriod,
    values.annualMileage,
    values.prepaidRate,
    values.depositRate,
  ]);

  const residualValue = useMemo(() => {
    if (!selectedSku) return null;
    return computeMockResidualValue({
      basePrice,
      contractPeriod: Number(values.contractPeriod),
      annualMileage: Number(values.annualMileage),
    });
  }, [selectedSku, basePrice, values.contractPeriod, values.annualMileage]);

  useEffect(() => {
    if (!selectedSkuId) return;
    const current = searchParams.get('sku');
    if (current === selectedSkuId) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('sku', selectedSkuId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams, selectedSkuId]);

  return (
    <Form {...form}>
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
        <div className="min-w-0">
          <SkuSection
            skus={product.skus}
            selectedSkuId={selectedSkuId}
            onSelectSku={setSelectedSkuId}
          />
          <ConfigForm basePrice={basePrice} />
        </div>
        <aside>
          <PaymentPanel
            result={quote}
            residualValue={residualValue}
            isLoading={false}
            isRetryable={false}
            errorCode={null}
          />
        </aside>
      </div>
    </Form>
  );
};

const resolveInitialSkuId = (
  product: ProductDetail,
  queryValue: string | null,
): string | null => {
  if (queryValue && product.skus.some((sku) => sku.id === queryValue)) {
    return queryValue;
  }
  return product.skus[0]?.id ?? null;
};
