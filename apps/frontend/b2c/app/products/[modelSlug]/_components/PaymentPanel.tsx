'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { sanitize } from '@/lib/forbidden-expressions';
import type { QuoteBreakdown } from '@kgm-rental/api-contracts/rental-quote/calculate-quote.schema.js';

interface PaymentPanelProps {
  result: QuoteBreakdown | null;
  residualValue: number | null;
  isLoading: boolean;
  isRetryable: boolean;
  errorCode: string | null;
  onRetry?: () => void;
}

export const PaymentPanel = ({
  result,
  residualValue,
  isLoading,
  isRetryable,
  errorCode,
  onRetry,
}: PaymentPanelProps): JSX.Element => (
  <Card className="lg:sticky lg:top-24">
    <CardHeader>
      <CardTitle>결제 내역</CardTitle>
    </CardHeader>
    <CardContent aria-live="polite">
      {errorCode && isRetryable ? (
        <PaymentError code={errorCode} onRetry={onRetry} />
      ) : (
        <dl className="space-y-3">
          <PaymentRow
            label="초기 납입금"
            value={result?.initialBurden}
            isLoading={isLoading}
          />
          <PaymentRow
            label="표준 렌탈료"
            value={result?.standardRent}
            isLoading={isLoading}
          />
          <PaymentRow
            label="할인 합계"
            value={result?.discountTotal}
            isLoading={isLoading}
            tone="discount"
          />
          <PaymentRow
            label="월 선납금 차감"
            value={result?.prepaidDeduction}
            isLoading={isLoading}
            tone="discount"
          />
          <PaymentRow
            label="잔존가치"
            value={residualValue ?? undefined}
            isLoading={isLoading && residualValue === null}
            tone="muted"
          />
          <div className="mt-4 border-t border-slate-200 pt-4">
            <dt className="text-sm font-medium text-slate-600">최종 월 렌탈료</dt>
            <dd
              aria-label="최종 월 렌탈료"
              className="mt-1 text-2xl font-bold text-slate-900"
            >
              {isLoading && !result ? (
                <Skeleton className="h-8 w-32" />
              ) : result ? (
                `${formatKrw(result.finalMonthlyRent)}원`
              ) : (
                <span className="text-base text-slate-400">
                  옵션을 선택하면 결제 내역을 확인할 수 있어요.
                </span>
              )}
            </dd>
          </div>
        </dl>
      )}

      <Button className="mt-6 w-full" disabled>
        상담 신청 (추후 활성화)
      </Button>
    </CardContent>
  </Card>
);

interface PaymentRowProps {
  label: string;
  value: number | undefined;
  isLoading: boolean;
  tone?: 'default' | 'discount' | 'muted';
}

const PaymentRow = ({
  label,
  value,
  isLoading,
  tone = 'default',
}: PaymentRowProps): JSX.Element => {
  const isDiscount = tone === 'discount';
  const isMuted = tone === 'muted';
  const valueClass = isDiscount
    ? 'text-emerald-600'
    : isMuted
      ? 'text-slate-500'
      : 'text-slate-900';
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-sm text-slate-600">{label}</dt>
      <dd className={`text-sm font-medium ${valueClass}`}>
        {isLoading && value === undefined ? (
          <Skeleton className="h-4 w-20" />
        ) : value === undefined ? (
          <span className="text-slate-400">—</span>
        ) : (
          `${formatKrw(value)}원`
        )}
      </dd>
    </div>
  );
};

interface PaymentErrorProps {
  code: string;
  onRetry?: () => void;
}

const PaymentError = ({ code, onRetry }: PaymentErrorProps): JSX.Element => (
  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm">
    <div className="font-medium text-red-700">
      결제 정보를 불러오지 못했어요.
    </div>
    <div className="mt-1 text-xs text-red-600">{sanitize(code).sanitized}</div>
    {onRetry ? (
      <Button className="mt-3 w-full" variant="outline" onClick={onRetry}>
        다시 시도
      </Button>
    ) : null}
  </div>
);

const formatKrw = (value: number): string =>
  new Intl.NumberFormat('ko-KR').format(value);
