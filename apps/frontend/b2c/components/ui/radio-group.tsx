'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps {
  name: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  'aria-labelledby'?: string;
}

export const RadioGroup = ({
  name,
  value,
  defaultValue,
  onValueChange,
  disabled,
  children,
  className,
  ...rest
}: RadioGroupProps): JSX.Element => {
  const [internal, setInternal] = React.useState<string | undefined>(defaultValue);
  const current = value !== undefined ? value : internal;
  const handleChange = React.useCallback(
    (next: string) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    },
    [onValueChange, value],
  );
  const ctx = React.useMemo(
    () => ({ name, value: current, onChange: handleChange, disabled }),
    [name, current, handleChange, disabled],
  );
  return (
    <RadioGroupContext.Provider value={ctx}>
      <div
        role="radiogroup"
        className={cn('grid gap-2', className)}
        {...rest}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

export interface RadioGroupItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'name' | 'value' | 'onChange'> {
  value: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ value, label, description, disabled, className, id, ...props }, ref) => {
    const ctx = React.useContext(RadioGroupContext);
    if (!ctx) throw new Error('RadioGroupItem must be used within RadioGroup');

    const checked = ctx.value === value;
    const isDisabled = disabled || ctx.disabled;
    const inputId = id ?? `${ctx.name}-${value}`;

    return (
      <label
        htmlFor={inputId}
        aria-disabled={isDisabled || undefined}
        className={cn(
          'flex cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm transition-colors',
          checked
            ? 'border-brand-accent bg-blue-50 text-slate-900'
            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
          isDisabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <input
            ref={ref}
            id={inputId}
            type="radio"
            name={ctx.name}
            value={value}
            checked={checked}
            disabled={isDisabled}
            onChange={() => ctx.onChange(value)}
            className="h-4 w-4 cursor-pointer border-slate-300 text-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent disabled:cursor-not-allowed"
            {...props}
          />
          <span className="font-medium">{label}</span>
        </div>
        {description ? (
          <span className="text-xs text-slate-500">{description}</span>
        ) : null}
      </label>
    );
  },
);
RadioGroupItem.displayName = 'RadioGroupItem';
