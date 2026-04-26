import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { CalculatorInputs } from './CalculatorInputs';
import { CalculatorFormProvider } from './CalculatorFormProvider';
import { ConfigurationProvider } from '../../_context/ConfigurationContext';
import type { InventorySku } from '@/lib/inventory/inventory-mapper';

const SKU: InventorySku = {
  slug: 'actyon-hev',
  skuId: 'a',
  modelName: 'x',
  trimLabel: 'S8',
  colorName: 'white',
  colorCode: 'WAA',
  basePrice: 30_000_000,
  optionPrice: 0,
  baseCustomizing: [],
  optionCustomizing: [],
  price: 30_000_000,
  priceError: false,
  duplicateCount: 1,
  makeDates: [],
};

const renderForm = () =>
  render(
    <ConfigurationProvider
      initial={{ trimLabel: 'S8', colorCode: 'WAA', skuId: null }}
      skus={[SKU]}
      thumbnail="/t.png"
    >
      <CalculatorFormProvider>
        <CalculatorInputs />
      </CalculatorFormProvider>
    </ConfigurationProvider>,
  );

describe('CalculatorInputs', () => {
  it('renders 4 inputs with defaults from CAR_ITEM_DEFAULTS', () => {
    renderForm();
    expect(screen.getByRole('radiogroup', { name: '계약 기간' })).toBeTruthy();
    expect(screen.getByRole('radiogroup', { name: '연간 주행거리' })).toBeTruthy();
    expect(screen.getByRole('slider', { name: '선수금 비율' })).toBeTruthy();
    expect(screen.getByRole('slider', { name: '보조금 비율' })).toBeTruthy();
  });

  it('renders 견적 section heading', () => {
    renderForm();
    expect(screen.getByRole('heading', { name: '견적' })).toBeTruthy();
  });

  it('toggles contract months when segment clicked', () => {
    renderForm();
    const months36 = screen.getByRole('radio', { name: '36개월' });
    act(() => {
      fireEvent.click(months36);
    });
    expect(months36.getAttribute('aria-checked')).toBe('true');
  });

  it('updates prepaid slider value on change', () => {
    renderForm();
    const slider = screen.getByRole('slider', { name: '선수금 비율' }) as HTMLInputElement;
    act(() => {
      fireEvent.change(slider, { target: { value: '30' } });
    });
    expect(slider.value).toBe('30');
  });
});
