'use client';

import { Tooltip } from '@/components/ui/tooltip';
import type { ReactNode } from 'react';

interface GuardTooltipProps {
  reason: string;
  children: ReactNode;
}

export const GuardTooltip = ({
  reason,
  children,
}: GuardTooltipProps): JSX.Element => (
  <Tooltip content={reason}>{children}</Tooltip>
);
