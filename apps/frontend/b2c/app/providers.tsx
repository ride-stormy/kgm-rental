'use client';

import { useState } from 'react';
import { LazyMotion } from 'motion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const loadFeatures = () => import('motion/react').then((r) => r.domAnimation);

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1 },
        },
      }),
  );

  return (
    <LazyMotion features={loadFeatures}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </LazyMotion>
  );
};
