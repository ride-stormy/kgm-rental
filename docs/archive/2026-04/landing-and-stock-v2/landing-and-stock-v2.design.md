# Design: landing-and-stock-v2

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | landing-and-stock-v2 |
| Epic | kgm-rental-platform |
| 작성일 | 2026-04-21 |
| 프로필 | blank (frontend-only) |
| Plan 참조 | `docs/01-plan/features/landing-and-stock-v2.plan.md` |
| 단일 소스 | Figma `9sxH4k4w6tWb9QK7guDgzV` · nodeId `8:1844` |
| Viewport | **min 375px / max 540px** (컨테이너 고정). 1024px+ 데스크톱 미대응 |

---

## 1. 아키텍처 옵션

### Option A — Minimal
섹션별 1파일 + 계산기/필터를 단일 파일로 인라인. 구현 빠르지만 Calculator가 400+ 줄로 비대화 우려.

### Option B — Clean Architecture
섹션별 하위 폴더 + Sub-컴포넌트 풀 분리 + 훅/유틸 전부 독립. 유지보수 최고, 파일 16+ / 초기 비용 큼.

### Option C — Pragmatic Balance ★ 선택
Figma 섹션 경계 그대로 파일 분리. 반복/복잡한 조각(CarItem, FilterTabs, Calculator 내부 Primitive)만 추가 분리. 파일 ~10, 오버엔지니어링 회피.

### 옵션 비교

| 기준 | Option A | Option B | Option C |
|------|:--------:|:--------:|:--------:|
| 구현 속도 | ★★★★★ | ★★ | ★★★★ |
| 유지보수성 | ★★ | ★★★★★ | ★★★★ |
| 확장성 | ★★ | ★★★★★ | ★★★★ |
| 리스크 | 낮음 | 높음 | 중간 |

**선택: Option C — Pragmatic Balance** (사용자 확정)

---

## 2. 상세 설계

### 2.1 디렉토리 구조

```
apps/frontend/b2c/
├── app/
│   ├── _components/landing/
│   │   ├── HeroSection.tsx              [S1 hero]
│   │   ├── ProductsSection.tsx          [S2 header + S3 filter + S4 6 CarItem]
│   │   ├── CarItem.tsx                  [6모델 공용 카드]
│   │   ├── FilterTabs.tsx               [sticky 가로스크롤 + 자동선택]
│   │   ├── CalculatorSection.tsx        [S5 계산기]
│   │   └── _calculator/
│   │       ├── SegmentedPicker.tsx      [기간/거리 선택]
│   │       └── PercentSlider.tsx        [선수금·보조금 0-50%]
│   ├── _content/landing.ts              [전체 카피 + 배지/모델 상수]
│   └── page.tsx                         [5섹션 조립 (RSC)]
├── lib/
│   ├── use-scroll-filter.ts             [IO + sticky 언핀 + anchor scroll]
│   ├── use-quote-estimation.ts          [계산 상태 + 제약 가드 + debounce]
│   └── vehicle-pricing.ts               [모델별 최저가 SKU + F4 공식 로컬 재구현]
└── public/images/landing/
    ├── heroimg.png
    ├── torres.png
    ├── actyon.png
    ├── musso.png
    ├── mussogrand.png
    ├── mussoev.png
    └── tivoli.png
```

### 2.2 핵심 컴포넌트

| 컴포넌트 | 역할 | 파일 |
|---------|------|------|
| `<LandingPage>` | 5 섹션 조립, RSC에서 fixture 로드 + pricing 계산 후 주입 | `app/page.tsx` |
| `<HeroSection>` | 배경 이미지 + 카피 + CTA (noop) | `app/_components/landing/HeroSection.tsx` |
| `<ProductsSection>` | S2 header + S3 FilterTabs + S4 6개 CarItem을 하나의 클라이언트 섹션에 묶음 | `app/_components/landing/ProductsSection.tsx` |
| `<FilterTabs>` | 7개 가로 스크롤 탭 + 스티키 + 자동선택 로직 사용 | `app/_components/landing/FilterTabs.tsx` |
| `<CarItem>` | 6 모델 공용 카드 (배지/가격/조건/견적내보기/썸네일) | `app/_components/landing/CarItem.tsx` |
| `<CalculatorSection>` | S5 계산기 UI + 선택 동기화 + 월납금 표시 | `app/_components/landing/CalculatorSection.tsx` |
| `<SegmentedPicker>` | 기간 3-segment · 거리 4-segment | `app/_components/landing/_calculator/SegmentedPicker.tsx` |
| `<PercentSlider>` | 0~50% / 10% step 슬라이더 | `app/_components/landing/_calculator/PercentSlider.tsx` |
| `useScrollFilter` | IntersectionObserver로 현재 모델 감지 + anchor scroll + unpin 이벤트 | `lib/use-scroll-filter.ts` |
| `useQuoteEstimation` | 상태(모델/트림/기간/거리/선수금/보조금) + 선수금+보조금≤50% 가드 + 월납금 debounce 재계산 | `lib/use-quote-estimation.ts` |
| `vehicle-pricing` | XLSX fixture에서 6모델 최저가 SKU·가격 추출 + F4 공식 로컬 함수 | `lib/vehicle-pricing.ts` |

### 2.3 데이터 흐름

```
[빌드/요청 시]
  page.tsx (RSC)
    ├─ getFixtureProducts()                → ProductDetail[6]
    ├─ computeCarItemPricing(products)     → CarItemPricing[6]   (60m/2만km/선납10%/보조10%)
    └─ findDefaultCalculatorState(products) → QuoteInitialState   (토레스 최저가 SKU)

[클라이언트]
  <ProductsSection pricing={...} models={...} />
      ↓ useScrollFilter
      ├─ <FilterTabs activeSlug onSelect />    스크롤 → IO → 활성 slug 갱신
      └─ <CarItem slug="2025-torres" />        "견적내보기" 클릭 → dispatchEvent('prefill-calculator')

  <CalculatorSection products={...} initial={...} />
      ↓ useQuoteEstimation
      ├─ window.addEventListener('prefill-calculator')  ← CarItem에서 방출
      ├─ 선수금+보조금 > 50% → 보조금 자동 클램프
      └─ debounce(200ms) → vehicle-pricing.computeMonthly() → monthly state
```

**CarItem ↔ Calculator 연결 방식**: `dispatchEvent(new CustomEvent('landing:prefill-calculator', { detail: { modelSlug, skuId } }))`.
→ URL 해시(`#calculator`)로 스크롤 + detail로 pre-select 동시 수행. 외부 라이브러리 불필요.

### 2.4 v1 잔존 코드 정리

#### 삭제 (v2 범위 외 — Do 1단계에서 일괄 삭제)

**Backend (NestJS 재고 모듈 전체 제거 — v2는 프론트 전용):**
- `apps/backend/b2c/src/modules/stock/` 디렉토리 전체
- `apps/backend/b2c/src/app.module.ts`에서 `StockModule` import 제거

**packages/api-contracts:**
- `packages/api-contracts/src/stock/stock.schema.ts`
- `packages/api-contracts/src/stock/` 디렉토리 (다른 파일 없으면 폴더 자체 삭제)

**apps/frontend/b2c/lib:**
- `stock-fixture.ts` (재고 계산 로직 불필요)
- `use-stock.ts` (재고 폴링 훅 불필요)
- `utm.ts`, `use-utm.ts` (UTM 수집 별도 feature로 분리)

**apps/frontend/b2c/app/api:**
- `app/api/stock/route.ts`
- `app/api/products/route.ts` (RSC에서 fixture 직접 사용)
- `app/api/` 폴더에 route 없으면 폴더 자체 삭제

**apps/frontend/b2c/app/_components/landing (v1 7섹션 중 5개):**
- `SolutionsHeading.tsx`
- `ComparisonTable.tsx`
- `BenefitCards.tsx`
- `SummaryBanner.tsx`
- `TrustSection.tsx`

**apps/frontend/b2c/components/ui:**
- `table.tsx` (ComparisonTable 전용이었으므로)

**apps/frontend/b2c/tailwind.config.ts:**
- 변경 없음 (blue/gray 토큰 재사용)

#### 수정

**apps/frontend/b2c/lib/api-client.ts:**
- `fetchStock`, `EMPTY_STOCK`, `STOCK_ENDPOINT` 제거
- `buildUtmHeaders`, `toUtmHeaders` 의존 제거 → stock/UTM 관련 호출부도 함께 제거
- `fetchProducts`, `fetchProductDetail`, `calculateQuote`, `fetchResidualValue`는 그대로 유지 (F4가 사용)

**apps/frontend/b2c/app/_components/landing/HeroSection.tsx:**
- v1 파일 삭제 후 재작성 (Figma 7:7764 기준)

**apps/frontend/b2c/app/_components/landing/ProductSection.tsx:**
- v1 파일 삭제 후 `ProductsSection.tsx`로 **rename 재작성** (Figma 7:7769~7:7787)
- Stock 의존 제거, filter + 6 CarItem 중심으로 전면 재작성

**apps/frontend/b2c/app/_content/landing.ts:**
- v1 7섹션 카피 전부 제거 → v2 5섹션 + 모델 배지 6건만 보존

**apps/frontend/b2c/app/page.tsx:**
- 5 섹션 조립 + fixture 기반 pricing 계산으로 재작성

#### 유지

- `apps/frontend/b2c/components/ui/button.tsx`, `card.tsx`, `skeleton.tsx`, `label.tsx`, `input.tsx` 등 범용 Primitive
- `apps/frontend/b2c/app/products/xlsx/_fixtures/` 전체 (XLSX 파싱 로직·JSON)
- `apps/frontend/b2c/app/products/xlsx/**` (F3 제품 상세 페이지 — 영향 없음)
- `packages/api-contracts/src/product/**`, `src/rental-quote/**`

### 2.5 신규 자산 배치

| 원본 | 대상 | 방법 |
|------|------|------|
| `asset/heroimg.png` | `apps/frontend/b2c/public/images/landing/heroimg.png` | Do 단계 최상단에서 복사 |
| `asset/torres.png` | `apps/frontend/b2c/public/images/landing/torres.png` | 동일 |
| `asset/actyon.png` | `apps/frontend/b2c/public/images/landing/actyon.png` | 동일 |
| `asset/musso.png` | `apps/frontend/b2c/public/images/landing/musso.png` | 동일 |
| `asset/mussogrand.png` | `apps/frontend/b2c/public/images/landing/mussogrand.png` | 동일 |
| `asset/mussoev.png` | `apps/frontend/b2c/public/images/landing/mussoev.png` | 동일 |
| `asset/tivoli.png` | `apps/frontend/b2c/public/images/landing/tivoli.png` | 동일 |

컴포넌트에서는 `next/image` + `/images/landing/{slug}.png`로 로드. Hero 배경은 `priority` 지정.

---

## 3. 구현 순서

| 순서 | 파일 / 작업 | 유형 | 의존성 |
|------|------------|------|--------|
| 1 | v1 잔존 파일 삭제 (backend stock module, frontend 5 섹션, api routes, stock/utm libs) | 삭제 | — |
| 2 | `apps/frontend/b2c/public/images/landing/` 생성 + `asset/*.png` 7개 복사 | 신규 | — |
| 3 | `apps/frontend/b2c/lib/vehicle-pricing.ts` 작성 (모델별 최저가 + quote 공식 로컬 재구현) | 신규 | F3 fixture |
| 4 | `apps/frontend/b2c/app/_content/landing.ts` 재작성 (5 섹션 카피 + 배지 6건 + 세그먼트 기본값) | 재작성 | — |
| 5 | `apps/frontend/b2c/app/_components/landing/_calculator/PercentSlider.tsx` | 신규 | — |
| 6 | `apps/frontend/b2c/app/_components/landing/_calculator/SegmentedPicker.tsx` | 신규 | — |
| 7 | `apps/frontend/b2c/lib/use-quote-estimation.ts` (상태 + 제약 가드 + debounce) | 신규 | vehicle-pricing |
| 8 | `apps/frontend/b2c/lib/use-scroll-filter.ts` (IO + sticky unpin + anchor scroll) | 신규 | — |
| 9 | `apps/frontend/b2c/app/_components/landing/HeroSection.tsx` | 재작성 | _content |
| 10 | `apps/frontend/b2c/app/_components/landing/CarItem.tsx` | 신규 | vehicle-pricing, _content |
| 11 | `apps/frontend/b2c/app/_components/landing/FilterTabs.tsx` | 신규 | use-scroll-filter |
| 12 | `apps/frontend/b2c/app/_components/landing/ProductsSection.tsx` | 재작성 | 9, 10, 11 |
| 13 | `apps/frontend/b2c/app/_components/landing/CalculatorSection.tsx` | 신규 | 5, 6, 7 |
| 14 | `apps/frontend/b2c/app/page.tsx` | 재작성 | 모든 섹션 |
| 15 | `apps/frontend/b2c/lib/api-client.ts` 정리 (fetchStock·UTM 제거) | 수정 | — |
| 16 | Build / Typecheck / Lint / Smoke | 검증 | 전체 |

---

## 4. 인터페이스 명세

### 4.1 `lib/vehicle-pricing.ts`

```typescript
import type { ProductDetail } from '@kgm-rental/api-contracts/product/product-detail.schema.js';

const CAR_ITEM_DEFAULTS = {
  contractMonths: 60,
  annualKm: 20000,
  prepaidRate: 0.1,
  subsidyRate: 0.1,
} as const;

const CONTRACT_MONTHS = [36, 48, 60] as const;
type ContractMonths = (typeof CONTRACT_MONTHS)[number];

const ANNUAL_KM = [10000, 20000, 30000, 40000] as const;
type AnnualKm = (typeof ANNUAL_KM)[number];

const PERCENT_STEPS = [0, 10, 20, 30, 40, 50] as const;
type PercentStep = (typeof PERCENT_STEPS)[number];

interface CarItemPricing {
  modelSlug: string;          // '2025-torres' 등
  minMonthlyFromMinSku: number; // CAR_ITEM_DEFAULTS 조건으로 계산한 원화 (반올림)
  minSkuId: string;
  minSkuTrimName: string;
  minVehiclePrice: number;
}

interface MonthlyQuoteInput {
  vehiclePrice: number;         // SKU 실매가 (KRW)
  contractMonths: ContractMonths;
  annualKm: AnnualKm;
  prepaidPercent: PercentStep;  // 0..50
  subsidyPercent: PercentStep;  // 0..50
}

// F4 공식 로컬 재구현 (서버 호출 없음)
export const computeMonthlyQuote = (input: MonthlyQuoteInput): number => { ... };

// 6 모델 × CAR_ITEM_DEFAULTS → CarItemPricing[]
export const computeCarItemPricing = (products: ProductDetail[]): CarItemPricing[] => { ... };

// model slug 기준 최저가 SKU 조회
export const findMinSku = (product: ProductDetail) => ({ skuId, trimName, vehiclePrice });
```

### 4.2 `lib/use-quote-estimation.ts`

```typescript
interface QuoteState {
  modelSlug: string;
  skuId: string;
  contractMonths: ContractMonths;
  annualKm: AnnualKm;
  prepaidPercent: PercentStep;
  subsidyPercent: PercentStep;
}

interface UseQuoteEstimationProps {
  products: ProductDetail[];
  initial: QuoteState;           // page.tsx에서 Torres 최저가 SKU로 pre-computed
}

interface UseQuoteEstimationResult {
  state: QuoteState;
  monthly: number;               // debounce 200ms 결과
  vehiclePrice: number;
  trimOptionsForCurrentModel: { skuId: string; trimName: string }[];
  setModel: (modelSlug: string) => void;           // 트림 자동 재선택 (해당 모델 최저가)
  setSku: (skuId: string) => void;
  setContractMonths: (m: ContractMonths) => void;
  setAnnualKm: (km: AnnualKm) => void;
  setPrepaidPercent: (p: PercentStep) => void;     // 합계 > 50% → 보조금 자동 클램프
  setSubsidyPercent: (p: PercentStep) => void;     // 합계 > 50% → 요청값을 (50-prepaid)로 클램프
}

export const useQuoteEstimation = (
  props: UseQuoteEstimationProps,
): UseQuoteEstimationResult => { ... };
```

**가드 로직:**
```typescript
const clampPair = (prepaid: PercentStep, subsidy: PercentStep) => {
  if (prepaid + subsidy <= 50) return { prepaid, subsidy };
  return { prepaid, subsidy: (50 - prepaid) as PercentStep };
};
```

**prefill 이벤트 수신:**
```typescript
useEffect(() => {
  const onPrefill = (e: Event) => {
    const { modelSlug, skuId } = (e as CustomEvent<{ modelSlug: string; skuId: string }>).detail;
    setModel(modelSlug);
    setSku(skuId);
  };
  window.addEventListener('landing:prefill-calculator', onPrefill);
  return () => window.removeEventListener('landing:prefill-calculator', onPrefill);
}, []);
```

### 4.3 `lib/use-scroll-filter.ts`

```typescript
interface UseScrollFilterProps {
  modelSlugs: readonly string[];     // ['2025-torres', 'actyon-hev', ...] (Car-Item 순서와 동일)
  filterBarRef: RefObject<HTMLElement>;
  containerRef: RefObject<HTMLElement>;  // 6개 Car-Item을 감싸는 컨테이너 (마지막 sentinel 포함)
}

interface UseScrollFilterResult {
  activeSlug: string | 'all';        // 'all' = "전체" 활성
  scrollToSlug: (slug: string | 'all') => void;  // 탭 클릭 시 smooth scroll
  isFilterPinned: boolean;           // sticky 유지 여부
}

export const useScrollFilter = (
  props: UseScrollFilterProps,
): UseScrollFilterResult => { ... };
```

**IO 설정:**
- 각 `CarItem`에 `data-model-slug` 속성 + `id={slug}` 부여
- rootMargin: `'-45% 0px -45% 0px'` (뷰포트 중앙 10% 밴드)
- threshold: `0`
- 상단 sentinel (`#landing-products-top`): 보일 때 `activeSlug='all'`
- 하단 sentinel (`#landing-products-end`): 보일 때 `activeSlug=<마지막 slug>` 유지 + `isFilterPinned=false`

**스크롤 동작:**
- `scrollToSlug('all')` → `#landing-products-top`으로 이동
- `scrollToSlug(slug)` → `#${slug}`로 이동 + `scroll-margin-top` 값(필터바 높이)로 오프셋 보정

### 4.4 `_content/landing.ts` 스키마 (요지)

```typescript
const MODEL_ORDER = [
  'actyon-hev',
  '2025-torres',
  'musso',
  'musso-grand',
  'musso-ev',
  'tivoli',
] as const;

type ModelSlug = (typeof MODEL_ORDER)[number];

const MODEL_DISPLAY: Record<ModelSlug, { name: string; badge: string; thumbnail: string }> = {
  '2025-torres':  { name: '토레스',       badge: '베스트셀러 SUV', thumbnail: '/images/landing/torres.png' },
  'actyon-hev':   { name: '액티언 HEV',    badge: '실용과 스타일',  thumbnail: '/images/landing/actyon.png' },
  'musso':        { name: '무쏘',         badge: '정통 픽업',     thumbnail: '/images/landing/musso.png' },
  'musso-grand':  { name: '무쏘그랜드',    badge: '프리미엄 픽업',  thumbnail: '/images/landing/mussogrand.png' },
  'musso-ev':     { name: '무쏘 EV',      badge: '전기 픽업',     thumbnail: '/images/landing/mussoev.png' },
  'tivoli':       { name: '티볼리',       badge: '엔트리 SUV',    thumbnail: '/images/landing/tivoli.png' },
};

const LANDING_CONTENT = {
  hero: {
    bgImage: '/images/landing/heroimg.png',
    eyebrow: '400대 한정 이벤트',
    titleLines: ['...'], // Figma 3줄
    cta: '상담 신청하기',
  },
  productsHeader: {
    title: '티볼리보다 싼 토레스, 월 18만 원대 액티언 하이브리드',
    subtitle: '한정 수량으로 소진 시 즉시 마감될 수 있습니다',
    totalCount: 400,
    asOfLabel: '2026. 04. 15 기준',
  },
  carItem: {
    priceSuffix: '원 부터',
    conditions: '계약기간 5년 · 선납:10% · 주행거리:2만 km 기준',
    cta: '견적내보기',
  },
  calculator: {
    title: '예상 월 납입금',
    monthlyUnit: '원/월',
    subtitle: '차종과 조건을 선택하면 대략적인 월 납입금을 즉시 확인할 수 있습니다',
    contractLabel: '계약 기간',
    annualKmLabel: '연간 주행거리',
    prepaidLabel: '선수금 비율',
    subsidyLabel: '보조금 비율',
    vehiclePriceLabel: '차량 가격',
    cta: '이 조건으로 상담 신청',
    contractOptions: [36, 48, 60] as const,
    contractDefault: 60,
    annualKmOptions: [10000, 20000, 30000, 40000] as const,
    annualKmDefault: 20000,
    percentStep: 10,
    percentMax: 50,
    percentDefault: 10,
  },
} as const;
```

### 4.5 CarItem → Calculator 전달 이벤트

```typescript
// CarItem.tsx 내부
const handleQuoteClick = () => {
  window.dispatchEvent(
    new CustomEvent('landing:prefill-calculator', {
      detail: { modelSlug, skuId: minSkuId },
    }),
  );
  // 해시 업데이트 + 부드러운 스크롤
  window.location.hash = 'calculator';
};
```

---

## 5. 검증 기준 (Acceptance Criteria)

### 5.1 API 검증

v2는 백엔드 API를 사용하지 않는다. **N/A**.
(quote 관련 API(`/api/quotes/*`)는 F4 범위 — v2에서 호출하지 않음)

### 5.2 UI 검증

| # | 화면/컴포넌트 | 동작 | 기대 결과 |
|---|-------------|------|-----------|
| 1 | 랜딩 `/` | 페이지 로드 | S1 Hero → S2 ProductsHeader → S3 Filter → S4 6 CarItem → S5 Calculator 순서로 5 섹션 렌더 |
| 2 | 컨테이너 | 350~540px·540~800px 뷰포트 확인 | `max-w-[540px] min-w-[375px] mx-auto px-5` 유지 (좌우 여백 20px) |
| 3 | S1 Hero | DOM 검사 | `img[src="/images/landing/heroimg.png"]` + eyebrow "400대 한정 이벤트" + 3줄 타이틀 + CTA "상담 신청하기" |
| 4 | S1 Hero CTA | 클릭 | 핸들러 호출(`console.debug('hero-cta')` 정도의 noop). 네비게이션 없음 |
| 5 | S2 Header | DOM 검사 | "티볼리보다 싼 토레스..." 타이틀 + 서브 "한정 수량..." + "총 400대 · 2026. 04. 15 기준" (400 고정) |
| 6 | S3 FilterTabs | 렌더 | 탭 7개 (`전체`, `액티언 HEV`, `토레스`, `무쏘`, `무쏘그랜드`, `무쏘 EV`, `티볼리`) 가로 스크롤 |
| 7 | S3 초기 상태 | 페이지 진입 직후 | `활성=전체` |
| 8 | S3 sticky | 아래로 스크롤하여 필터바가 뷰포트 상단에 닿음 | `position: sticky; top: 0` 유지, 카드 위에 오버레이 |
| 9 | S3 언핀 | 마지막 CarItem(티볼리) 하단 경계를 지남 | 필터바가 static으로 돌아가 일반 흐름에 복귀 |
| 10 | S3 클릭 → scroll | 탭 클릭 | 해당 모델 `#{slug}` 위치로 smooth scroll, 필터바 높이만큼 `scroll-margin-top` 오프셋 |
| 11 | S3 자동선택 | 각 CarItem이 뷰포트 중앙 10% 밴드에 진입 | IO가 감지 → 활성 탭이 해당 모델로 토글 |
| 12 | S3 "전체" 규칙 | 첫 CarItem 위쪽에서 스크롤 | `활성=전체` |
| 13 | S3 마지막 규칙 | 마지막(티볼리) 아래로 스크롤 | `활성=티볼리` 유지 (전체로 돌아가지 않음) |
| 14 | S4 순서 | CarItem DOM 순서 | 액티언 HEV → 토레스 → 무쏘 → 무쏘그랜드 → 무쏘 EV → 티볼리 (Figma 순서) |
| 15 | S4 CarItem | 각 카드 렌더 | 모델명 + 모델별 배지 + 가격 "{원}원 부터" + 조건 "계약기간 5년 · 선납:10% · 주행거리:2만 km 기준" + "견적내보기 →" + 썸네일 |
| 16 | S4 가격 계산 | XLSX 최저가 SKU 사용 | `computeMonthlyQuote({vehiclePrice, 60, 20000, 0.1, 0.1})` 값으로 표기 |
| 17 | S4 배지 카피 | 각 모델 배지 텍스트 | 2025-torres=베스트셀러 SUV / actyon-hev=실용과 스타일 / musso=정통 픽업 / musso-grand=프리미엄 픽업 / musso-ev=전기 픽업 / tivoli=엔트리 SUV |
| 18 | S4 "견적내보기" | 클릭 | `#calculator`로 smooth scroll + Calculator의 모델·트림이 해당 값으로 pre-select |
| 19 | S5 초기값 | 페이지 진입 | 모델=토레스, 트림=토레스 최저가 SKU, 60개월, 2만km, 선수금 10%, 보조금 10% |
| 20 | S5 모델 변경 | Dropdown에서 다른 모델 선택 | 트림 dropdown이 해당 모델 최저가 SKU로 자동 재선택, 차량가격 라벨 갱신 |
| 21 | S5 기간 세그먼트 | 36/48/60 클릭 | 선택 상태 토글 + 월납금 재계산 |
| 22 | S5 거리 세그먼트 | 1만/2만/3만/4만 클릭 | 선택 상태 토글 + 월납금 재계산 |
| 23 | S5 선수금 슬라이더 | 값 변경 | 0~50% 사이, 10% 간격(6 steps), 우측에 "{%} {차량가×%}원" 표시 |
| 24 | S5 보조금 슬라이더 | 값 변경 | 0~50% 사이, 10% 간격, 우측 금액 표기 |
| 25 | S5 합계 제약 | 선수금 30% → 보조금 30% 시도 | 보조금이 자동 클램프되어 20% 유지 (30+20=50) |
| 26 | S5 합계 제약 | 선수금 50% | 보조금 0%로 자동 클램프 |
| 27 | S5 debounce | 슬라이더 빠르게 이동 | 200ms 내 여러 값 변경은 한 번만 재계산 |
| 28 | S5 CTA | "이 조건으로 상담 신청" 클릭 | 핸들러 호출(noop), 네비게이션/alert 없음 |
| 29 | 이미지 로드 | DevTools Network | 7장 모두 200 OK (`/images/landing/*.png`) |
| 30 | Build | `pnpm --filter @kgm-rental/frontend-b2c build` | exit 0 |
| 31 | Typecheck | `pnpm --filter @kgm-rental/frontend-b2c typecheck` | exit 0 |
| 32 | Lint | `pnpm --filter @kgm-rental/frontend-b2c lint` | exit 0 |
| 33 | v1 코드 잔존 | `grep -r "TrustSection\|ComparisonTable\|BenefitCards\|SummaryBanner\|SolutionsHeading"` | apps/frontend/b2c 아래 0건 |
| 34 | v1 backend 잔존 | `ls apps/backend/b2c/src/modules/stock/` | 디렉토리 없음 |
| 35 | UTM 잔존 | `grep "utm" apps/frontend/b2c/lib/` | 0건 (또는 api-contracts에만 잔존 가능) |

### 5.3 엣지케이스

| # | 상황 | 기대 동작 |
|---|------|-----------|
| 1 | XLSX에서 특정 모델 slug 누락 (ex. `musso-grand` 데이터 없음) | 해당 CarItem에 가격 "— 원 부터" 대신 **그 카드만 렌더 건너뜀**. Filter 탭도 해당 모델 제거. 빌드는 성공 |
| 2 | 모든 SKU 가격이 0/음수 | `computeMonthlyQuote` 결과 0 반환, 카드에 "준비 중" 플레이스홀더 표기. 빌드 성공 유지 |
| 3 | 사용자 뷰포트 540px 초과 (예: 1024px) | 컨테이너가 `max-w-[540px]` 유지 → 좌우 여백이 넓게 생김. 레이아웃 깨짐 없음 |
| 4 | 사용자 뷰포트 375px 미만 (예: 320px 레거시) | 컨테이너가 `min-w-[375px]`이므로 가로 스크롤 발생. 내용 잘림 없음 |
| 5 | IntersectionObserver 미지원 브라우저 | `window.IntersectionObserver` 존재 체크 → 없으면 자동선택·언핀 비활성 + 스티키만 유지. 탭 클릭 scroll은 동작 |
| 6 | 해시 `#calculator` 직접 접근 | 페이지 로드 직후 Calculator 위치로 스크롤. pre-select는 기본값(토레스) |
| 7 | CarItem 견적내보기 연속 클릭 (서로 다른 모델) | 마지막 클릭 모델이 Calculator에 반영 (이벤트 최신 값 우선) |
| 8 | 선수금 50% 상태에서 사용자가 보조금 슬라이더 드래그 시도 | 보조금은 0%만 유효. 슬라이더는 0% 스텝에 고정 클램프 |
| 9 | 모바일 Safari sticky + scroll-margin 조합 | `scroll-margin-top: {filterBarHeight}px`가 앵커 스크롤 오프셋 처리. 대체 수단: `Element.scrollIntoView({behavior:'smooth', block:'start'})` + 수동 offset 조정 |
| 10 | Hero 배경 이미지 미로드 | `<Image priority>` + `placeholder="empty"` + 배경색 `bg-gray-900` 폴백 |

### 5.4 런타임 연동 검증

v2는 외부 서비스(Supabase/Firebase/외부 API)를 사용하지 않는다. **N/A**.

---

*이 문서는 `/harness:design landing-and-stock-v2` 단계의 산출물입니다.*
*다음 단계: `/harness:do landing-and-stock-v2`*
