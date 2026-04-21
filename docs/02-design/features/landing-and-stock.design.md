# Feature Design: landing-and-stock

| 항목 | 내용 |
|------|------|
| Epic | kgm-rental-platform |
| Feature | F5 / 5 |
| 선택 옵션 | **Option C — Pragmatic Balance** (F4 패턴과 동일) |
| 의존성 | F3 `product-catalog`, F4 `quote-configurator-ui` |
| 주 소스 | Figma `9sxH4k4w6tWb9QK7guDgzV` nodeId `4:9379` · `pre-docs/reference/2~3.png` |
| 작성일 | 2026-04-21 |

---

## 1. 개요

F5는 KGM 400대 한정 프로모션을 중심으로 한 **이벤트 톤의 랜딩 페이지** 구현 + **재고 API 프록시** + **UTM 수집** 3가지 축으로 구성된다.
Stage A는 기능·구조 완성에 집중하고 Stage B(피그마 시안 반영)가 이미 F4에서 입증된 분리 구조를 따른다.

**설계 3원칙**

1. **Figma 우선 재현** — 히어로/재고/운용솔루션 3 섹션은 Figma 스펙 그대로. 남은 4 섹션(비교/베네핏/요약/KGM공식)은 레퍼런스 이미지 구조만 차용하고 **컬러는 프로젝트 블루**로 치환.
2. **F4 스택 일관성** — Next.js 14 App Router + RSC + native fetch + AbortController. TanStack Query 미도입 유지.
3. **컨텐츠 분리** — 섹션별 상수를 `_content/landing.ts` 단일 파일에 그룹화 → 컨텐츠팀이 한 곳에서 수정.

---

## 2. 디렉토리 구조

### 2.1 신규·변경 파일

```
apps/frontend/b2c/
├─ app/
│  ├─ page.tsx                                (✏️ 전면 교체: 7 섹션 오케스트레이션)
│  ├─ _components/landing/                    (🆕)
│  │  ├─ HeroSection.tsx                      Figma S1 재현 (CTA 없음)
│  │  ├─ ProductSection.tsx                   Figma S2 + 재고 배지 결합
│  │  ├─ SolutionsHeading.tsx                 Figma S3 + 서브카피
│  │  ├─ ComparisonTable.tsx                  ref2 하단: 티볼리 vs 토레스 5행
│  │  ├─ BenefitCards.tsx                     ref2 하단: 4 카드 (초기비용/세금/관리/절세)
│  │  ├─ SummaryBanner.tsx                    ref2 맨 하단: ❌ vs ✅ 2줄
│  │  └─ TrustSection.tsx                     ref3 하단: "KGM 공식 리테일러" + 3 기둥
│  └─ _content/
│     └─ landing.ts                           (🆕) HERO·PRODUCT·SOLUTIONS·COMPARISON·BENEFITS·SUMMARY·TRUST 상수
│
├─ components/ui/                             (🆕)
│  └─ table.tsx                               ComparisonTable 프리미티브 (간소)
│
├─ lib/
│  ├─ api-client.ts                           (✏️ fetchStock 추가)
│  ├─ use-stock.ts                            (🆕) 60s 폴링 + AbortController
│  ├─ use-utm.ts                              (🆕) sessionStorage UTM 저장·헤더 주입
│  └─ utm.ts                                  (🆕) 순수 유틸 — getStoredUtm, captureUtm
│
└─ tailwind.config.ts                         (✏️ blue-600 + gray scale Figma 토큰 추가)

packages/api-contracts/src/stock/             (🆕)
├─ common.schema.ts
└─ stock.schema.ts                            GET /stock 응답 Zod

apps/backend/b2c/src/modules/stock/           (🆕, DDD 4-layer 경량)
├─ presentation/stock.controller.ts
├─ application/stock.service.ts
├─ infrastructure/external-stock.adapter.ts   (env API 호출 · 10~30s 메모리 캐시 · 타임아웃 3s)
├─ infrastructure/stock-memory-cache.ts
└─ stock.module.ts
```

### 2.2 의존 패키지

- 신규 설치 없음. 기존 react/next/zod/tailwind 사용.
- NestJS 백엔드는 기존 `@nestjs/common`, `@nestjs/config` 활용.

---

## 3. Figma 토큰 → Tailwind 매핑

`tailwind.config.ts` `theme.extend.colors` 에 추가:

```ts
colors: {
  brand: { DEFAULT: '#0F172A', accent: '#2563EB' },     // 기존 유지 (F4 호환)
  blue: {
    50:  '#e6f4ff',
    100: '#cfeaff',
    500: '#0a93ff',
    600: '#0a93ff',                                      // Figma 액센트
    700: '#007fe0',
  },
  gray: {
    50:  '#f7f9fa',
    100: '#f1f4f6',
    200: '#e7edf0',
    300: '#cfd6d9',
    400: '#aeb7bc',
    500: '#6e777c',
    600: '#5e696e',
    700: '#4a5256',
    800: '#353c3f',
    900: '#222729',
  },
},
```

**룰**
- 새 랜딩 섹션은 `gray-*`, `blue-600` 사용 (Figma 일치)
- F4 컴포넌트(Button/SkuSlider 등)는 `brand-accent` 유지 (변경 리스크 방지)
- 경고/에러는 기존 red/amber 유지

**폰트**: Pretendard는 system fallback 이미 등록됨. Stage A에서 웹폰트 로드는 하지 않음(향후 최적화 대상).

---

## 4. 섹션 레이아웃 (반응형)

전체 컨테이너: `<main className="mx-auto max-w-[1100px] px-5 py-10 lg:px-10">` (Epic 표준)

| # | 섹션 | 모바일 (<768) | 태블릿 (768-1023) | 데스크톱 (≥1024) |
|---|---|---|---|---|
| S1 | Hero | 세로 스택 375w · 이미지 380h 상단 + 화이트 카드(rounded-t-[20px]) 하단 · 3 베네핏 세로 배치 | 중앙 정렬, 카드 넓이 ~600px | 중앙 정렬, 이미지 비율 16:9, 카드 최대 900px |
| S2 | ProductSection | 1열 (카드 풀폭) | 2열 grid | 2열 grid · 카드 크게 |
| S3 | SolutionsHeading | 좌측 정렬 텍스트 | 좌측 정렬 | 중앙 정렬 |
| S4 | ComparisonTable | `overflow-x-auto` 스크롤 | 풀폭 테이블 | 풀폭 테이블 중앙 |
| S5 | BenefitCards | 1열 | 2×2 | 1×4 |
| S6 | SummaryBanner | 세로 2줄 | 가로 인라인 | 가로 인라인, 가운데 정렬 |
| S7 | TrustSection | 3 기둥 세로 | 2-1 배치 | 1×3 |

---

## 5. 섹션별 명세

### 5.1 HeroSection (S1) — **CTA 없음**

**Figma 4:9379 / 6:2719** 재현.

**구조**:
```
<section class="relative -mx-5 lg:-mx-10 bg-gray-100">
  <!-- 상단: 배경 이미지 영역 380h (mobile) / aspect-[16/9] (desktop) -->
  <div class="relative aspect-[375/380] lg:aspect-[16/9] bg-gray-900">
    {/* hero.jpg placeholder (Stage B에서 실 에셋) */}
    <div className="absolute inset-x-5 top-[60px] lg:top-1/3 text-center">
      <p class="text-sm font-bold text-gray-900">{HERO.eyebrow}</p>  // "400대 한정 이벤트"
      <p class="mt-2 text-[22px] leading-[34px] font-bold lg:text-3xl">
        {HERO.titleLines.map(...)}                                     // 3줄
      </p>
    </div>
  </div>

  <!-- 하단: 화이트 카드 -->
  <div class="-mt-[40px] mx-auto max-w-[520px] rounded-t-[20px] bg-white p-5">
    <h2 class="text-xl font-bold text-gray-900">{HERO.h1}</h2>         // "400대 한정 역대급 기회"
    <div class="mt-4 rounded-[20px] bg-gray-50 p-4 flex flex-col gap-6">
      {HERO.benefits.map((b) => (
        <div>
          <div class="flex items-center gap-2">
            <div class="rounded-lg bg-gray-100 p-1">{icon}</div>
            <span class="text-base font-semibold text-gray-600">{b.title}</span>
          </div>
          <p class="mt-0.5 pl-9 text-[11px] leading-4 text-gray-500">{b.description}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

**주의**:
- `-mx-5 lg:-mx-10` 로 main 컨테이너 패딩을 **뚫고** full-bleed 배경 구현
- 3 베네핏 아이콘은 Stage A에서 **단색 emoji 또는 lucide-react 아이콘** (웹폰트 의존 회피). Stage B에서 커스텀 SVG 교체 대상.
- **CTA 버튼 없음** (피그마 스펙 확정)

### 5.2 ProductSection (S2)

**Figma 6:2628** + 재고 배지 결합.

**props**:
```ts
interface ProductSectionProps {
  products: ProductCard[];                // F3 fetchProducts 결과 (추천 2종으로 필터)
  initialStock: StockMap;                 // SSR prefetch 값
}
```

**구조**:
- 상단 헤더 `"400대 한정 수량 / 남은 재고를 확인하세요"` + 서브카피
- 카운트 줄: `<span class="text-blue-600 font-semibold">총 {N}</span>대 · {기준일} · ℹ️`
  - `N` = initialStock의 모든 slug 재고 합계 (client 폴링 시 갱신)
- 카드 2개 (`PRODUCT_SECTION_CONTENT.featuredSlugs` 순서 — `['2025-torres', 'actyon-hev']`)
- 각 카드:
  - 상단 썸네일 (140h, Figma 스펙; 플레이스홀더 회색 박스 + heroImage 파일명 텍스트)
  - "KGM" 라벨 + 우측 "**{N}대 남음**" (blue-600, 재고 훅 값)
  - 차량명 (19/26 SemiBold, gray-800)
  - 칩 2개: `트림 · {N}종` / `색상 · {N}종` (gray-100 배경, 13/18)
  - 가격 `월 {minMonthlyRent}원 부터` (blue-600, 20/30 SemiBold)
- **카드 전체 클릭 → `/products/{slug}`** (사용자 확정 사항)
- 재고 0/로딩/에러 대응:
  - loading → `Skeleton` (카드 고정 높이 유지)
  - remaining=0 → 배지 "재고 소진" (gray-400)
  - stock API error → 배지 숨김 (카드만 표시)

### 5.3 SolutionsHeading (S3)

**Figma 6:2893** — 단순 헤더.

```
<section class="py-10 text-center lg:text-center">
  <h2 class="text-xl lg:text-2xl font-bold text-gray-900">
    소유가 아니라, <span class="text-blue-600">운용 솔루션</span>입니다
  </h2>
  <p class="mt-3 text-sm text-gray-600 max-w-prose mx-auto">
    {SOLUTIONS_CONTENT.subtitle}
  </p>
</section>
```

"운용 솔루션" 에 blue-600 강조 (레퍼런스 이미지 패턴 반영).

### 5.4 ComparisonTable (S4)

**ref 2.png 하단**: 5행 비교 테이블.

**데이터** (`COMPARISON_CONTENT` 상수):
```ts
export const COMPARISON_CONTENT = {
  left:  { label: '티볼리 할부 60개월',       highlight: false },
  right: { label: '토레스 장기렌트 60개월',   highlight: true },   // 블루 테두리
  rows: [
    { item: '월 납입금',          left: '42만 원',       right: '39만 원',  emphasize: true },
    { item: '취등록세 (7%)',      left: '별도 부담',     right: '포함' },
    { item: '5년 자동차세',       left: '별도 부담',     right: '포함' },
    { item: '5년 보험료',         left: '별도 부담',     right: '포함' },
    { item: '5년 총 추가 부담',   left: '약 780만 원',  right: '0원',     emphasize: true },
  ],
};
```

**테이블 프리미티브** `components/ui/table.tsx`:
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` arrow export
- 스타일: border-gray-200, 헤더 bg-gray-900 text-white, 강조 행 bg-blue-50
- 모바일: 부모에 `overflow-x-auto` 래퍼 (테이블 최소폭 560px)

### 5.5 BenefitCards (S5)

**ref 2.png 하단**: 4 카드.

**데이터**:
```ts
export const BENEFITS_CONTENT = [
  { icon: 'sparkles',  title: '초기 비용 최소화', description: '계약금·취등록세 부담 없이 바로 차량 인수. 목돈 없이 시작하는 차량 운용.' },
  { icon: 'shield',    title: '세금·보험료 절감', description: '자동차세·보험료가 월 납입금에 포함. 5년간 약 780만 원 절감 효과.' },
  { icon: 'wrench',    title: '차량 관리·사고 처리 편의', description: '정비 일정·사고 처리까지 렌트사가 전담. 운전에만 집중.' },
  { icon: 'check',     title: '사업자 절세 혜택',  description: '월 납입금 전액 비용 처리 가능. 법인·개인사업자 모두 세제 혜택.' },
];
```

**카드 구조**:
```
<div class="rounded-xl border border-gray-200 bg-white p-4">
  <div class="rounded-lg bg-blue-50 p-2 w-fit">{icon}</div>    // blue-50 (레드 → 블루 치환)
  <h3 class="mt-3 text-base font-semibold text-gray-900">{title}</h3>
  <p class="mt-1 text-xs text-gray-600 leading-[18px]">{description}</p>
</div>
```

아이콘은 `lucide-react`(경량) — Stage A 설치, Stage B에서 커스텀 SVG 교체 가능.

### 5.6 SummaryBanner (S6)

**ref 2.png 맨 하단**: 2줄 메시지.

```
<section class="py-6 text-center">
  <div class="flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-4 text-sm lg:text-base">
    <span class="text-gray-600">장기렌트 = 단순 대여 ❌</span>
    <span class="text-gray-400">/</span>
    <span class="font-semibold text-blue-600">차량 취득부터 세금·보험·관리까지 포함된 차량 운용 솔루션 ✅</span>
  </div>
</section>
```

### 5.7 TrustSection (S7)

**ref 3.png 하단**: "공식 리테일러 · KGM 공식 리테일러가 직접 운영합니다" + 3 기둥.

**데이터**:
```ts
export const TRUST_CONTENT = {
  eyebrow: '공식 리테일러',
  title: { prefix: 'KGM ', highlight: '공식 리테일러', suffix: '가 직접 운영합니다' },
  subtitle: 'KGM의 공식사업자만이 운영할 수 있는 KGM Experience Center 2호점 중 한 곳을 (주)라이드가 운영합니다.',
  pillars: [
    { icon: '🏢', title: 'KGM Experience Center',      statsValue: '2',  statsLabel: '호점 중 1호점' },
    { icon: '📅', title: '7년 Experience Center 운영', statsValue: '7년', statsLabel: '누적 운영' },
    { icon: '🚚', title: '대량 캐파로 독점 제공',      statsValue: '독점', statsLabel: '수급 보장' },
  ],
};
```

**섹션 배경**: `bg-gray-900 text-white` (레퍼런스 다크 톤 유지, 블루 악센트)

```
<section class="-mx-5 lg:-mx-10 bg-gray-900 px-5 py-12 text-white lg:px-10">
  <div class="mx-auto max-w-[1100px] text-center">
    <p class="text-xs text-blue-500">공식 리테일러</p>
    <h2 class="mt-2 text-xl lg:text-2xl font-bold">
      KGM <span class="text-blue-500">공식 리테일러</span>가 직접 운영합니다
    </h2>
    <p class="mt-2 text-sm text-gray-400">{TRUST.subtitle}</p>
    <div class="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {TRUST.pillars.map((p) => (
        <div class="rounded-xl bg-gray-800 p-5 text-left">
          <div class="text-2xl">{p.icon}</div>
          <h3 class="mt-2 font-semibold text-white">{p.title}</h3>
          <div class="mt-3 border-t border-gray-700 pt-3">
            <div class="text-3xl font-bold text-blue-500">{p.statsValue}</div>
            <div class="text-xs text-gray-400">{p.statsLabel}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

---

## 6. 데이터 흐름

```
[Browser] /  (RSC page.tsx)
   │
   ├─ await fetchStock()           → GET /api/stock  (b2c 백엔드 프록시)
   ├─ await fetchProducts()        → GET /api/products (F3)
   │
   ▼
<main>
  <HeroSection />                  (순수 UI, 컨텐츠 상수만)
  <ProductSection                  (클라이언트 훅으로 60s 폴링)
    products={featured2}
    initialStock={stockRes.data} />
  <SolutionsHeading />
  <ComparisonTable />
  <BenefitCards />
  <SummaryBanner />
  <TrustSection />
</main>

(Client) use-utm.ts → mount 시 URL ?utm_* 캡처 → sessionStorage
(Client) api-client.ts → 모든 fetch 호출 전 getStoredUtm() → X-UTM-* 헤더 부착
```

---

## 7. API 계약 · Zod 스키마

### 7.1 `packages/api-contracts/src/stock/stock.schema.ts`

```ts
import { z } from 'zod';
import { envelope } from '../rental-quote/common.schema.js';

export const StockColorSchema = z.object({
  code: z.string(),
  name: z.string(),
  remaining: z.number().int().nonnegative(),
  isLowStock: z.boolean(),
});
export type StockColor = z.infer<typeof StockColorSchema>;

export const StockPerProductSchema = z.object({
  totalRemaining: z.number().int().nonnegative(),
  colors: z.array(StockColorSchema),
  lastUpdatedAt: z.string().datetime(),
});
export type StockPerProduct = z.infer<typeof StockPerProductSchema>;

export const StockDataSchema = z.object({
  stock: z.record(z.string(), StockPerProductSchema),   // { [slug]: {...} }
  asOf: z.string().datetime(),
});
export type StockData = z.infer<typeof StockDataSchema>;

export const StockResponseSchema = envelope(StockDataSchema);
export type StockResponse = z.infer<typeof StockResponseSchema>;
```

### 7.2 프록시 엔드포인트

**Controller** `GET /stock`
- 응답: `StockResponseSchema`
- fail-open: 외부 API 실패 시 `{ success: true, data: { stock: {}, asOf: <now> }, error: null }`

**Adapter** `external-stock.adapter.ts`
- env 기반: `EXTERNAL_STOCK_API_URL`, `EXTERNAL_STOCK_API_KEY`
- 타임아웃 3s (`AbortController.setTimeout`)
- 응답 정규화: 외부 스펙 → 내부 `StockDataSchema`
- 실패 시 `null` 반환 (service 단에서 빈 객체 fallback)

**Memory Cache** `stock-memory-cache.ts`
- `Map<cacheKey, { data, expiresAt }>`
- TTL 20s (설정 가능), serve-stale-while-revalidate는 Stage B

---

## 8. 훅 설계

### 8.1 `lib/use-stock.ts`

```ts
interface UseStockParams {
  initial?: StockData;          // SSR prefetch 주입
  pollingMs?: number;           // 기본 60_000
  slugs?: string[];             // 필터 (옵션)
}
interface UseStockResult {
  data: StockData | null;
  isLoading: boolean;
  error: string | null;
}
export const useStock = (params?: UseStockParams): UseStockResult;
```

- `useRef<AbortController>` — 이전 요청 취소
- `useEffect(setInterval)` — 60s 주기
- unmount / pollingMs 변경 시 cleanup

### 8.2 `lib/use-utm.ts` + `lib/utm.ts`

```ts
// utm.ts (순수)
export const UTM_KEYS = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'] as const;
export const captureUtm = (search: string): Partial<UtmMap> => { /* parse + write sessionStorage if first */ };
export const getStoredUtm = (): Partial<UtmMap> => { /* read sessionStorage */ };
export const toHeaders = (utm: Partial<UtmMap>): Record<string,string> => { /* X-UTM-Source, ... */ };

// use-utm.ts
export const useUtm = (): Partial<UtmMap> => {
  const [utm, setUtm] = useState<Partial<UtmMap>>({});
  useEffect(() => { setUtm(captureUtm(window.location.search)); }, []);
  return utm;
};
```

`api-client.ts` 모든 fetch 호출 시:
```ts
headers: { ...toHeaders(getStoredUtm()), ...restHeaders }
```

---

## 9. 컨텐츠 상수 (`app/_content/landing.ts`)

**7 섹션 상수를 한 파일에 그룹화**. 컨텐츠팀이 한 곳에서 수정.

```ts
export const HERO_CONTENT = {
  eyebrow: '400대 한정 이벤트',
  titleLines: ['티볼리 가격으로 토레스,', '하루 커피 한 잔 값으로', '액티언 하이브리드를'],
  h1: '400대 한정 역대급 기회',
  heroImage: '/images/landing/hero.jpg',  // 플레이스홀더 경로, Stage B 교체
  benefits: [
    { title: '초기비용 없이',     description: '무보증, 무선납, 보험료, 취등록세 0원으로 시작', icon: 'circle-dollar' },
    { title: '정비 보험 올인원', description: '소모품부터 사고처리까지, 월 렌트료 안에',       icon: 'shield-check' },
    { title: '만기엔 선택',       description: '반납 연장 인수 만기 뒤 원하는 방향으로',        icon: 'refresh-cw' },
  ],
} as const;

export const PRODUCT_SECTION_CONTENT = {
  title: ['400대 한정 수량', '남은 재고를 확인하세요'],
  subtitle: '특별 재고 확보를 통해 한정 수량으로 진행되는 상품입니다. 준비된 수량이 소진되면 즉시 마감됩니다.',
  totalPrefix: '총',
  totalSuffix: '대',
  asOfLabel: '2026. 04. 15 기준',
  featuredSlugs: ['2025-torres', 'actyon-hev'] as const,
} as const;

export const SOLUTIONS_CONTENT = { ... } as const;
export const COMPARISON_CONTENT = { ... } as const;
export const BENEFITS_CONTENT = [ ... ] as const;
export const SUMMARY_BANNER = { ... } as const;
export const TRUST_CONTENT = { ... } as const;
```

---

## 10. 검증 기준 (Acceptance Criteria)

| # | 기준 | 검증 방법 |
|---|---|---|
| AC-1 | `/` 페이지가 S1~S7 7 섹션을 순서대로 렌더 | 수동 브라우저 확인 + 각 섹션 `<section>` 마크업 존재 |
| AC-2 | S1 Hero가 Figma 스펙 재현 (eyebrow + 3줄 타이틀 + H1 + 3 베네핏 카드) + **CTA 버튼 없음** | 렌더 + Figma 대비 수동 |
| AC-3 | S2 Product가 Figma 재현 + 2개 Car-Item(`2025-torres`, `actyon-hev`) + `카드 전체 클릭 → /products/{slug}` 이동 | 클릭 → URL 변경 확인 |
| AC-4 | S2 재고 배지가 useStock 훅 데이터로 갱신. 60s 주기 폴링 | 네트워크 탭 + 시간 경과 관찰 |
| AC-5 | 재고 API 실패/타임아웃 시 배지 **숨김** (카드는 정상 렌더) | mock 에러 주입 |
| AC-6 | S4 ComparisonTable이 5행 + 강조 행(월 납입금·총 추가 부담) 하이라이트 | 렌더 + 스타일 확인 |
| AC-7 | S5 BenefitCards 4개 (데스크톱 1×4, 모바일 1열) | 뷰포트 375/1440 |
| AC-8 | S7 TrustSection `bg-gray-900` + 3 기둥 + blue-500 stats | 렌더 확인 |
| AC-9 | UTM 쿼리(`?utm_source=...`) 첫 방문 시 sessionStorage 저장 | DevTools Application 탭 |
| AC-10 | 모든 백엔드 호출에 `X-UTM-*` 헤더 포함 (UTM 있을 때) | 네트워크 탭 Request Headers |
| AC-11 | 백엔드 `GET /api/stock` 정상 응답 (Zod 파싱 통과) + 실패 시 fail-open | supertest + 외부 API mock |
| AC-12 | 서버 프록시 20s 메모리 캐시 동작 (2번째 요청 외부 API 미호출) | adapter mock spy |
| AC-13 | 컨테이너 `max-w-[1100px] mx-auto px-5 lg:px-10` 전 섹션 준수 | 뷰포트 확인 |
| AC-14 | 컬러: blue-600(#0a93ff)을 액센트로 사용 · 레퍼런스 red는 어디에도 없음 | 코드 검색 `red-` 없음 |
| AC-15 | 금지 표현 가드 통과 (모든 텍스트 렌더 전 `sanitize`) | 단위 확인 |
| AC-16 | Build / Typecheck / Lint 전체 PASS | `pnpm --filter @kgm-rental/frontend-b2c *` |
| AC-17 | LCP 2.5s 이하 (4G 로컬) · Hero 이미지 `loading="eager"`, 이하 섹션 lazy | Lighthouse 또는 수동 측정 |

---

## 11. 구현 순서 (14단계)

1. **`tailwind.config.ts`** — blue-600 + gray scale 추가. `globals.css` 배경 슬레이트 토큰 조정.
2. **`app/_content/landing.ts`** — 7 섹션 상수 작성
3. **`packages/api-contracts/src/stock/`** — Zod 스키마 (`common`, `stock`)
4. **`apps/backend/b2c/src/modules/stock/`** — DDD 4-layer (controller, service, adapter, memory-cache, module). env `EXTERNAL_STOCK_API_URL`/`EXTERNAL_STOCK_API_KEY` 읽기. 외부 API 미연결 상태에서는 어댑터가 `null` 반환 → fail-open 빈 객체 응답
5. **`app.module.ts`** — StockModule 등록
6. **`apps/frontend/b2c/lib/utm.ts` + `use-utm.ts`** + `api-client.ts` 헤더 주입
7. **`lib/api-client.ts`** — `fetchStock()` 추가
8. **`lib/use-stock.ts`** — 60s 폴링 훅
9. **`components/ui/table.tsx`** — 테이블 프리미티브
10. **`_components/landing/`** 7 섹션 — `HeroSection → ProductSection → SolutionsHeading → ComparisonTable → BenefitCards → SummaryBanner → TrustSection`
11. **`app/page.tsx`** — 기존 홈 교체, RSC prefetch (fetchStock + fetchProducts)
12. **Build / Typecheck / Lint**
13. **dev 서버 확인** 4뷰포트 (375/768/1024/1440)
14. **Lighthouse** LCP 측정

---

## 12. 리스크 & 대응

| 리스크 | 영향 | 대응 |
|---|---|---|
| 외부 재고 API 미연결 상태 | 배지 전부 숨김 상태 | 어댑터 null 반환 → fail-open 빈 객체. 페이지 정상. 환경 변수 설정 문서화 |
| 재고 값 튐 (깜빡임) | UX 저하 | 이전 값 유지 + 부드러운 transition (Stage A). Stage B에 서버 SSE 또는 stale-while-revalidate 검토 |
| Figma 모바일(375)만 있음 → 데스크톱 파생 | 디자인 편차 논란 | §4 반응형 규칙을 Design 문서에 명시. Stage B에서 데스크톱 시안 수령 시 업데이트 |
| 웹폰트(Pretendard) 미로드 | 타이포그래피 편차 | Stage A는 system fallback. Stage B에서 webfont 최적화 적용 |
| lucide-react 의존 추가 | 번들 사이즈 | lucide는 트리셰이킹 지원, 아이콘 6~8개만 import → 영향 ~10 KB. 허용 |
| 컨텐츠 확정 지연 | 리뷰 반복 | 모든 카피를 `_content/landing.ts` 단일 파일에 집중 → 수정 곧바로 반영 |
| 외부 API 레이트 리밋 | 프록시 부담 | 서버 메모리 캐시 20s + 프론트 폴링 60s. 필요시 50ms 재시도 한 번 |
| UTM PII 우려 | 컴플라이언스 | UTM 5키만 수집, 세션 한정, 쿠키 미사용. PII 아님 문서화 |

---

## 13. 핸드오프 예정

**다음 에픽 `kgm-rental-consultation`에 넘길 자원**
- `HeroSection` 의 "상담 신청" 자리는 **현재 비어있음** (CTA 자체 없음). 추후 상담 CTA 추가 시 Hero Layout 조정 필요
- `useUtm`, `getStoredUtm`, `toHeaders` 유틸 — 상담 폼 제출 payload 에 UTM 첨부 시 재사용
- `components/ui/table.tsx` 프리미티브 — FAQ / 약관 비교 등에 재사용

**Epic Report 에 반영할 사실**
- 랜딩 7 섹션 완성, 재고 배지 60s 폴링, UTM 헤더 자동 주입
- 외부 재고 API 환경 변수 미설정 시 fail-open 동작
- Stage B 대상 항목: 히어로 웹폰트·이미지·아이콘 커스텀, 데스크톱 시안 반영, 컨텐츠팀 카피 확정

---

## 14. 참고

- Plan: `docs/01-plan/features/landing-and-stock.plan.md` (Figma 수령 후 확장본)
- F4 Report: `docs/archive/2026-04/quote-configurator-ui/quote-configurator-ui.report.md` — 핸드오프 자산 (컬러 토큰, useResidualValue 패턴, UI 프리미티브)
- Figma: `9sxH4k4w6tWb9QK7guDgzV` nodeId `4:9379`
- 레퍼런스: `pre-docs/reference/1~4.png` (1 = Figma와 동일, 2·3 = 이후 섹션 구조, 4 = 다음 에픽 자료)

---

> 상태 전이: `plan` → **`design`** (이 문서 저장 시점)
> 다음: `/harness:do` — 위 14단계 구현 순서대로 실행
