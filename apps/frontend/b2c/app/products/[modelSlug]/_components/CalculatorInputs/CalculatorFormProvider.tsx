'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { calculatorSchema } from './schema';
import type { CalculatorSchema } from './schema';
import { CAR_ITEM_DEFAULTS } from '@/lib/vehicle-pricing';
import type { ReactNode } from 'react';

interface CalculatorFormProviderProps {
  children: ReactNode;
  defaults?: Partial<CalculatorSchema>;
}

export const CalculatorFormProvider = ({ children, defaults }: CalculatorFormProviderProps) => {
  const methods = useForm<CalculatorSchema>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: { ...CAR_ITEM_DEFAULTS, ...defaults },
    mode: 'onChange',
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};
