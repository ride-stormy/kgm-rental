import { NextResponse } from 'next/server';
import {
  InventoryListEnvelopeSchema,
  InventoryListResponseSchema,
} from '@kgm-rental/api-contracts/inventory/inventory.schema.js';
import { sanitize } from '@/lib/forbidden-expressions';
import { filterToAllowedModels } from '@/lib/inventory/filter-to-allowed';
import { normalizeTypo } from '@/lib/inventory/typo-normalizer';
import type { InventoryListResponse } from '@kgm-rental/api-contracts/inventory/inventory.schema.js';

const EXTERNAL_URL =
  process.env.INVENTORY_API_URL ??
  'https://server.sales.ride-office.kr/public/inventories';

const FALLBACK: InventoryListResponse = {
  items: [],
  totalElements: 0,
  timestamp: new Date(0).toISOString(),
  error: 'upstream_unavailable',
};

export const GET = async (): Promise<NextResponse<InventoryListResponse>> => {
  try {
    const res = await fetch(EXTERNAL_URL, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return NextResponse.json(FALLBACK);

    const raw = await res.json();
    const parsed = InventoryListEnvelopeSchema.safeParse(raw);
    if (!parsed.success) {
      // eslint-disable-next-line no-console
      console.error(
        '[inventories/route] schema mismatch',
        parsed.error.issues.slice(0, 3)
      );
      return NextResponse.json(FALLBACK);
    }

    const cleanedItems = parsed.data.data.content.map((it) => ({
      ...it,
      modelName: cleanText(it.modelName),
      colorName: cleanText(it.colorName),
      baseCustomizingDetail: it.baseCustomizingDetail.map((c) => ({
        ...c,
        name: cleanText(c.name),
      })),
      optionCustomizingDetail: it.optionCustomizingDetail.map((c) => ({
        ...c,
        name: cleanText(c.name),
      })),
    }));

    const filtered = filterToAllowedModels(cleanedItems);
    if (filtered.droppedCount > 0) {
      // eslint-disable-next-line no-console
      console.warn(
        '[inventories/route] dropped non-whitelisted items',
        { droppedCount: filtered.droppedCount, droppedModels: filtered.droppedModels }
      );
    }

    const body: InventoryListResponse = {
      items: filtered.kept,
      totalElements: filtered.kept.length,
      timestamp: parsed.data.timestamp,
    };

    const validated = InventoryListResponseSchema.safeParse(body);
    if (!validated.success) {
      // eslint-disable-next-line no-console
      console.error('[inventories/route] response shape invalid');
      return NextResponse.json(FALLBACK);
    }
    return NextResponse.json(validated.data);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[inventories/route] fetch error', err);
    return NextResponse.json(FALLBACK);
  }
};

const cleanText = (input: string): string =>
  sanitize(normalizeTypo(input).text).sanitized;
