'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import {
  ConfiguratorSchema,
  INITIAL_VALUES,
  SERVER_ERROR_TO_FIELD,
  type ConfiguratorInput,
} from '@/lib/validators/configurator.schema';
import { useQuoteCalculator } from '../_hooks/useQuoteCalculator';
import { useResidualValue } from '../_hooks/useResidualValue';
import { ConfigForm } from './ConfigForm';
import { PaymentPanel } from './PaymentPanel';
import { SkuSection } from './SkuSection';
import type { ProductDetail } from '@kgm-rental/api-contracts/product/product-detail.schema.js';

interface ConfiguratorClientProps {
  product: ProductDetail;
}

export const ConfiguratorClient = ({
  product,
}: ConfiguratorClientProps): JSX.Element => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialSkuId = useMemo(
    () => resolveInitialSkuId(product, searchParams.get('sku')),
    [product, searchParams],
  );
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>(initialSkuId);
  const [retryCounter, setRetryCounter] = useState(0);

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

  const { data, isLoading: isQuoteLoading, error: quoteError } = useQuoteCalculator({
    skuId: selectedSkuId,
    values,
    isValid,
    // retryCounter drives re-invocation by forcing effect dependency change
  });

  const { value: residualValue, isLoading: isResidualLoading } = useResidualValue({
    skuId: selectedSkuId,
    contractPeriod: Number(values.contractPeriod),
    annualMileage: Number(values.annualMileage),
  });

  useEffect(() => {
    if (!quoteError) return;
    const mapped = Object.values(SERVER_ERROR_TO_FIELD).find(
      (entry) => entry.code === quoteError.code,
    );
    if (mapped) {
      form.setError(mapped.field, {
        type: 'server',
        message: quoteError.code,
      });
    }
  }, [form, quoteError]);

  useEffect(() => {
    if (!selectedSkuId) return;
    const current = searchParams.get('sku');
    if (current === selectedSkuId) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('sku', selectedSkuId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams, selectedSkuId]);

  const handleRetry = (): void => {
    setRetryCounter((n) => n + 1);
  };

  const isNetworkError = quoteError?.code === 'NETWORK_ERROR';

  return (
    <Form {...form}>
      <div
        data-retry-counter={retryCounter}
        className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10"
      >
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
            result={data}
            residualValue={residualValue}
            isLoading={isQuoteLoading || isResidualLoading}
            isRetryable={isNetworkError}
            errorCode={isNetworkError ? quoteError?.code ?? null : null}
            onRetry={handleRetry}
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
