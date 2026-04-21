import {
  ListProductsResponseSchema,
  type ListProductsResponse,
} from '@kgm-rental/api-contracts/product/product-card.schema.js';
import {
  ProductDetailResponseSchema,
  type ProductDetailResponse,
} from '@kgm-rental/api-contracts/product/product-detail.schema.js';
import {
  CalculateQuoteRequestSchema,
  CalculateQuoteResponseSchema,
  type CalculateQuoteRequest,
  type CalculateQuoteResponse,
} from '@kgm-rental/api-contracts/rental-quote/calculate-quote.schema.js';
import {
  ResidualValueResponseSchema,
  type ResidualValueResponse,
} from '@kgm-rental/api-contracts/rental-quote/residual-value.schema.js';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api';

const EMPTY_LIST: ListProductsResponse = {
  success: true,
  data: { items: [] },
  error: null,
};

export const fetchProducts = async (): Promise<ListProductsResponse> => {
  try {
    const res = await fetch(`${API_BASE}/products`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn(`[api-client] GET /products ${res.status} — returning empty list`);
      return EMPTY_LIST;
    }
    const json = await res.json();
    return ListProductsResponseSchema.parse(json);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[api-client] fetchProducts error — returning empty list:', e);
    return EMPTY_LIST;
  }
};

export const fetchProductDetail = async (
  modelSlug: string,
): Promise<ProductDetailResponse> => {
  try {
    const res = await fetch(
      `${API_BASE}/products/${encodeURIComponent(modelSlug)}`,
      { next: { revalidate: 60 } },
    );
    if (res.status === 404) {
      return {
        success: false,
        data: null,
        error: { code: 'PRODUCT_NOT_FOUND', message: modelSlug },
      };
    }
    if (!res.ok) {
      return {
        success: false,
        data: null,
        error: { code: 'UPSTREAM_ERROR', message: `status ${res.status}` },
      };
    }
    const json = await res.json();
    return ProductDetailResponseSchema.parse(json);
  } catch (e) {
    return {
      success: false,
      data: null,
      error: { code: 'UPSTREAM_ERROR', message: String(e) },
    };
  }
};

export interface CalculateQuoteClientRequest {
  skuId: string;
  contractPeriod: number;
  annualMileage: number;
  prepaidRate: number;
  depositRate: number;
}

export const calculateQuote = async (
  input: CalculateQuoteClientRequest,
  options: { signal?: AbortSignal } = {},
): Promise<CalculateQuoteResponse> => {
  const body: CalculateQuoteRequest = CalculateQuoteRequestSchema.parse(input);
  try {
    const res = await fetch(`${API_BASE}/quotes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: options.signal,
      cache: 'no-store',
    });
    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const err = extractApiError(json);
      return {
        success: false,
        data: null,
        error: {
          code: err?.code ?? `HTTP_${res.status}`,
          message: err?.message ?? `status ${res.status}`,
        },
      };
    }
    return CalculateQuoteResponseSchema.parse(json);
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    return {
      success: false,
      data: null,
      error: { code: 'NETWORK_ERROR', message: String(e) },
    };
  }
};

export interface FetchResidualValueRequest {
  skuId: string;
  contractPeriod: number;
  annualMileage: number;
}

export const fetchResidualValue = async (
  input: FetchResidualValueRequest,
  options: { signal?: AbortSignal } = {},
): Promise<ResidualValueResponse> => {
  const params = new URLSearchParams({
    skuId: input.skuId,
    contractPeriod: String(input.contractPeriod),
    annualMileage: String(input.annualMileage),
  });
  try {
    const res = await fetch(
      `${API_BASE}/quotes/residual-value?${params.toString()}`,
      { signal: options.signal, cache: 'no-store' },
    );
    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const err = extractApiError(json);
      return {
        success: false,
        data: null,
        error: {
          code: err?.code ?? `HTTP_${res.status}`,
          message: err?.message ?? `status ${res.status}`,
        },
      };
    }
    return ResidualValueResponseSchema.parse(json);
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    return {
      success: false,
      data: null,
      error: { code: 'NETWORK_ERROR', message: String(e) },
    };
  }
};

const extractApiError = (
  payload: unknown,
): { code?: string; message?: string } | null => {
  if (!payload || typeof payload !== 'object') return null;
  const err = (payload as { error?: unknown }).error;
  if (!err || typeof err !== 'object') return null;
  const code = (err as { code?: unknown }).code;
  const message = (err as { message?: unknown }).message;
  return {
    code: typeof code === 'string' ? code : undefined,
    message: typeof message === 'string' ? message : undefined,
  };
};
