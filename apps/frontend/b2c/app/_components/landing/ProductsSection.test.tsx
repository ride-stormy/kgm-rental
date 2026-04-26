import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import type { GroupedInventory, InventorySku } from '@/lib/inventory/inventory-mapper';
import type { InventoriesQueryData } from './hooks/inventories-query-key';

vi.mock('./hooks/useInventoriesQuery', () => ({
  useInventoriesQuery: vi.fn(),
}));

vi.mock('./hooks/useMinPriceMonthlyQuery', () => ({
  useMinPriceMonthlyQuery: () => ({
    monthlyBySlug: {},
    isLoading: false,
  }),
}));

vi.mock('@/lib/use-scroll-filter', () => ({
  useScrollFilter: () => ({
    activeSlug: null,
    isFilterPinned: false,
    scrollToSlug: () => undefined,
  }),
}));

vi.mock('./CarItem', () => ({
  CarItem: (props: { modelSlug: string }) =>
    createElement(
      'div',
      { 'data-testid': 'car-item', 'data-slug': props.modelSlug },
      `car-item:${props.modelSlug}`,
    ),
}));

vi.mock('./FilterTabs', () => ({
  FilterTabs: () =>
    createElement('div', { 'data-testid': 'filter-tabs' }, 'filter-tabs'),
}));

vi.mock('next/image', () => ({
  default: (props: { alt: string }) => createElement('img', { alt: props.alt }),
}));

const FALLBACK_MESSAGE = '재고 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.';

const makeSku = (slug: GroupedInventory['slug']): InventorySku => ({
  slug,
  skuId: `${slug}:A1:BK01`,
  modelName: slug,
  trimLabel: 'T7',
  colorName: 'Black',
  colorCode: 'BK01',
  basePrice: 30_000_000,
  optionPrice: 0,
  baseCustomizing: [],
  optionCustomizing: [],
  price: 31_000_000,
  priceError: false,
  duplicateCount: 1,
  makeDates: ['26.03'],
});

const makeData = (slugs: GroupedInventory['slug'][]): InventoriesQueryData => ({
  items: slugs.map((slug) => {
    const sku = makeSku(slug);
    return { slug, skus: [sku], minPriceSku: sku, totalCount: 1 };
  }),
  totalElements: slugs.length,
  timestamp: '2026-04-22T00:00:00.000Z',
  rawResponse: {
    items: [],
    totalElements: slugs.length,
    timestamp: '2026-04-22T00:00:00.000Z',
  },
});

const mockHookReturn = async (
  overrides: Partial<{ data: InventoriesQueryData; isError: boolean }>,
) => {
  const mod = await import('./hooks/useInventoriesQuery');
  vi.mocked(mod.useInventoriesQuery).mockReturnValue({
    data: overrides.data,
    isError: overrides.isError ?? false,
  } as unknown as ReturnType<typeof mod.useInventoriesQuery>);
};

describe('ProductsSection', () => {
  it('renders fallback message when isError=true', async () => {
    await mockHookReturn({ isError: true });
    const { ProductsSection } = await import('./ProductsSection');
    const html = renderToString(createElement(ProductsSection));
    expect(html).toContain(FALLBACK_MESSAGE);
    expect(html).not.toContain('data-testid="car-item"');
  });

  it('renders fallback when items array is empty', async () => {
    await mockHookReturn({ data: makeData([]) });
    const { ProductsSection } = await import('./ProductsSection');
    const html = renderToString(createElement(ProductsSection));
    expect(html).toContain(FALLBACK_MESSAGE);
  });

  it('renders only CarItems whose slug is present in API response (slug filter)', async () => {
    await mockHookReturn({ data: makeData(['2025-torres', 'actyon-hev']) });
    const { ProductsSection } = await import('./ProductsSection');
    const html = renderToString(createElement(ProductsSection));
    expect(html).toContain('car-item:2025-torres');
    expect(html).toContain('car-item:actyon-hev');
    expect(html).not.toContain(FALLBACK_MESSAGE);
  });

  it('does not render the legacy "총 N대 / 기준일" header row', async () => {
    await mockHookReturn({ data: makeData(['2025-torres']) });
    const { ProductsSection } = await import('./ProductsSection');
    const html = renderToString(createElement(ProductsSection));
    expect(html).not.toMatch(/기준/);
    expect(html).not.toMatch(/총\s+\d/);
  });
});
