'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Tooltip = ({ content, children, className }: TooltipProps): JSX.Element => {
  const [open, setOpen] = React.useState(false);
  const show = (): void => setOpen(true);
  const hide = (): void => setOpen(false);
  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {open ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-xs -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-md"
        >
          {content}
        </span>
      ) : null}
    </span>
  );
};
