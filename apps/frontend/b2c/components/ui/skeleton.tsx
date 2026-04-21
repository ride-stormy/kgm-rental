import * as React from 'react';
import { cn } from '@/lib/cn';

export const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): JSX.Element => (
  <div
    className={cn('animate-pulse rounded-md bg-slate-200', className)}
    {...props}
  />
);
