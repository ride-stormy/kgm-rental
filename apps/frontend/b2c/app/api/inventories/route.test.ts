import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_FETCH = globalThis.fetch;

const makeUpstream = (contentOverrides: unknown[] = []) => ({
  code: '200',
  message: 'ok',
  timestamp: '2026-04-22T00:00:00.000Z',
  data: {
    totalElements: contentOverrides.length,
    currentPage: 1,
    totalPages: 1,
    pageSize: 100,
    content: contentOverrides,
  },
});

const makeItem = (overrides: Record<string, unknown> = {}) => ({
  modelName: '액티언 하이브리드 S8',
  modelCode: 'OP5',
  specCode: 'A1',
  colorName: 'Space Black',
  colorCode: 'BK01',
  baseTotalAmount: 30000000,
  optionTotalAmount: 0,
  baseCustomizingDetail: [],
  optionCustomizingDetail: [],
  vehicleModelName: '액티언 하이브리드',
  duplicateCount: 1,
  makeDates: ['26.03'],
  ...overrides,
});

describe('GET /api/inventories', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    globalThis.fetch = ORIGINAL_FETCH;
    vi.restoreAllMocks();
  });

  it('returns fallback when upstream is non-OK', async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response('boom', { status: 503 })
    ) as typeof fetch;
    const { GET } = await import('./route');
    const res = await GET();
    const body = await res.json();
    expect(body.error).toBe('upstream_unavailable');
    expect(body.items).toHaveLength(0);
  });

  it('returns fallback when envelope schema fails', async () => {
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ invalid: 'shape' }), { status: 200 })
    ) as typeof fetch;
    const consoleErr = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const { GET } = await import('./route');
    const res = await GET();
    const body = await res.json();
    expect(body.error).toBe('upstream_unavailable');
    expect(consoleErr).toHaveBeenCalled();
  });

  it('returns fallback on network error / timeout', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('network error');
    }) as typeof fetch;
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { GET } = await import('./route');
    const res = await GET();
    const body = await res.json();
    expect(body.error).toBe('upstream_unavailable');
  });

  it('passes through allowed models and applies typo + sanitize pipeline', async () => {
    const upstream = makeUpstream([
      makeItem({ modelName: '토레스 볼랙엣지 2WD', vehicleModelName: '더 뉴 토레스', modelCode: 'MW5' }),
      makeItem({ modelName: '액티온 하이브리드 하이브리드 58', vehicleModelName: '액티언 하이브리드', modelCode: 'OP5' }),
    ]);
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify(upstream), { status: 200 })
    ) as typeof fetch;
    const { GET } = await import('./route');
    const res = await GET();
    const body = await res.json();
    expect(body.error).toBeUndefined();
    expect(body.items).toHaveLength(2);
    expect(body.items[0].modelName).toBe('토레스 블랙엣지 2WD');
    expect(body.items[1].modelName).toBe('액티언 하이브리드 하이브리드 S8');
  });

  it('sanitizes forbidden expressions in customizing name', async () => {
    const upstream = makeUpstream([
      makeItem({
        baseCustomizingDetail: [{ name: '최저가 보장 패키지', amount: 0 }],
      }),
    ]);
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify(upstream), { status: 200 })
    ) as typeof fetch;
    const { GET } = await import('./route');
    const res = await GET();
    const body = await res.json();
    expect(body.items[0].baseCustomizingDetail[0].name).toContain(
      '[표기 검토중]'
    );
  });

  it('drops non-whitelisted vehicleModelName entries and warns', async () => {
    const upstream = makeUpstream([
      makeItem({ vehicleModelName: '액티언 하이브리드', modelCode: 'OP5' }),
      makeItem({ vehicleModelName: '더 뉴 토레스', modelCode: 'MW5' }),
      makeItem({ vehicleModelName: '더 뉴 티볼리', modelCode: 'XW5' }),
      makeItem({ vehicleModelName: '무쏘', modelCode: 'UH5' }),
      makeItem({ vehicleModelName: '무쏘 EV', modelCode: 'MD5' }),
    ]);
    globalThis.fetch = vi.fn(async () =>
      new Response(JSON.stringify(upstream), { status: 200 })
    ) as typeof fetch;
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    const { GET } = await import('./route');
    const res = await GET();
    const body = await res.json();
    expect(body.items).toHaveLength(2);
    expect(body.totalElements).toBe(2);
    const allowed = new Set(['액티언 하이브리드', '더 뉴 토레스']);
    for (const it of body.items) {
      expect(allowed.has(it.vehicleModelName)).toBe(true);
    }
    expect(warnSpy).toHaveBeenCalledWith(
      '[inventories/route] dropped non-whitelisted items',
      expect.objectContaining({ droppedCount: 3 })
    );
  });
});
