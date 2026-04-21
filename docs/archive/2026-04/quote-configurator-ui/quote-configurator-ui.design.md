# Feature Design: quote-configurator-ui

| 항목 | 내용 |
|------|------|
| Epic | kgm-rental-platform |
| Feature | F4 / 5 |
| 선택 옵션 | **Option C — Pragmatic Balance** |
| 의존성 | 선행 F2(quote-api), F3(product-catalog) · 후행 없음(Epic 내) |
| 작성일 | 2026-04-21 |

---

## 1. 개요

F4는 차량 상세 페이지(`/products/[modelSlug]`)의 **견적 구성 UI 전체**를 구현한다. 고객이 SKU 카드를 고르고 4필드(계약기간·주행거리·선납%·보증%)를 조작하면, 300ms debounce로 F2의 `POST /quotes/calculate`를 호출하여 우측 결제 패널이 실시간으로 갱신된다. Stage A는 **기능 완성**이 목표이고, Stage B는 Claude Design 시안 수령 후 **UI 정교화**로 분리 진행한다.

**설계 3원칙**

1. **기존 스택 일관성** — F3와 동일하게 Next.js 14 App Router + RSC + native fetch. TanStack Query 미도입.
2. **Zod 단일 정본** — 4필드 검증 규칙(3개)을 `lib/validators/configurator.schema.ts`에 모으고, 클라/서버 에러 매핑을 동일 키로 통일.
3. **레이어 분리 (관찰·변경 용이)** — 화면(`_components`) / 로직(`_hooks`) / 검증(`lib/validators`) 3계층. Stage B에서 UI만 교체 가능하도록.

---

## 2. 디렉토리 구조

### 2.1 신규·변경 파일 (`apps/frontend/b2c/`)

```
app/products/[modelSlug]/
├─ page.tsx                              (✏️ 수정: ConfiguratorClient 삽입)
├─ not-found.tsx                         (유지)
├─ _components/                          (🆕)
│  ├─ ConfiguratorClient.tsx             RHFProvider + 조립 + URL ?sku= 동기화
│  ├─ SkuSection.tsx                     STEP1: SkuSlider + 선택 상태 컨테이너
│  ├─ ConfigForm.tsx                     STEP2: 4필드 (계약/주행/선납/보증)
│  ├─ PaymentPanel.tsx                   결제 내역 (aria-live="polite")
│  └─ GuardTooltip.tsx                   선납·보증 제한 안내 툴팁
└─ _hooks/                               (🆕)
   ├─ useQuoteCalculator.ts              debounce(300ms) + POST /quotes/calculate + AbortController + 에러 매핑
   └─ useResidualValue.ts                GET /quotes/residual-value + Map 캐시

components/product/
├─ SkuSlider.tsx                         (✏️ Stage A 정식화: 가로 스크롤, 재고 배지, 선택 상태)
├─ ProductCard.tsx                       (유지)
└─ ColorSwatch.tsx                       (유지)

components/ui/                           (🆕 shadcn/ui 추가)
├─ button.tsx, card.tsx                  (기존)
├─ form.tsx                              RHF 통합 프리미티브
├─ input.tsx / label.tsx
├─ radio-group.tsx                       4필드 선택지
├─ tooltip.tsx                           GuardTooltip
└─ skeleton.tsx                          로딩 상태

lib/
├─ api-client.ts                         (✏️ 확장: calculateQuote, fetchResidualValue)
├─ use-debounce.ts                       (🆕)
├─ forbidden-expressions.ts              (유지 · SkuSlider·PaymentPanel 렌더에 적용)
└─ validators/
   └─ configurator.schema.ts             (🆕 Zod 단일 정본: 4필드 enum + 3규칙 refine)
```

### 2.2 의존 패키지

- 추가 설치: `react-hook-form`, `@hookform/resolvers`, `zod` (workspace 이미 존재 시 재사용)
- shadcn/ui 컴포넌트 추가: `form`, `input`, `label`, `radio-group`, `tooltip`, `skeleton`

---

## 3. 상태 모델 & 데이터 흐름

### 3.1 상태 소유권

| 상태 | 소유자 | 비고 |
|---|---|---|
| `skus[]`, `fixedPreset` 등 모델 상세 | RSC (`page.tsx`) | SSR prefetch 후 Client에 props 전달 |
| `selectedSkuId` | `ConfiguratorClient` `useState` | URL `?sku=` 쿼리와 동기화 (공유 가능) |
| 4필드 값 | RHF `useForm` | `FormProvider`로 하위 컴포넌트 공유 |
| 견적 결과 (`quoteResult`, `isLoading`, `error`) | `useQuoteCalculator` 훅 내부 | |
| 잔가 (`residualValue`) | `useResidualValue` 훅 내부 | Map 캐시 key = `${skuId}:${period}:${mileage}` |

### 3.2 렌더·호출 흐름

```
[page.tsx — RSC]
  └─ fetchProductDetail(modelSlug)  → { skus[], fixedPreset, ... }
        │ (props)
        ▼
[ConfiguratorClient — "use client"]
  ├─ RHF useForm<ConfiguratorInput>({ resolver: zodResolver(ConfiguratorSchema) })
  ├─ selectedSkuId  ← useState (URL ?sku= 동기화)
  │
  ├─ <FormProvider>
  │    ├─ <SkuSection skus={skus} selectedSkuId={} onSelect={} />
  │    │    └─ <SkuSlider /> (presentational)
  │    │
  │    ├─ <ConfigForm />
  │    │    ├─ Controller×4 (계약/주행/선납/보증 RadioGroup)
  │    │    └─ GuardTooltip (비활성 조합 안내)
  │    │
  │    └─ <PaymentPanel
  │          result={quoteResult}
  │          residual={residualValue}
  │          isLoading={} error={} />
  │
  ├─ watch(['contractPeriod','annualMileage','prepaidRate','depositRate'])
  │    → form.formState.isValid && selectedSkuId
  │       ? useQuoteCalculator({ skuId, ...values })  (debounced 300ms)
  │       : no-op
  │
  └─ watch(['contractPeriod','annualMileage']) + selectedSkuId
       → useResidualValue({ skuId, period, mileage })
```

### 3.3 에러 매핑

서버 400 응답 (`INVALID_DEPOSIT_PREPAY_LIMIT_*`) → Zod refine 메시지 키와 **동일 토큰**으로 통일.

| 서버 에러 코드 | Zod refine 메시지 | UI 표시 위치 |
|---|---|---|
| `INVALID_DEPOSIT_PREPAY_LIMIT_PREPAID_40` | `PREPAID_LIMIT_40` | prepaidRate 필드 인라인 |
| `INVALID_DEPOSIT_PREPAY_LIMIT_DEPOSIT_50` | `DEPOSIT_LIMIT_50` | depositRate 필드 인라인 |
| `INVALID_DEPOSIT_PREPAY_LIMIT_SUM_50` | `SUM_LIMIT_50` | depositRate 필드 인라인 |

`useQuoteCalculator`의 에러 매퍼가 서버 코드를 Zod 경로·메시지로 변환하여 `form.setError()` 호출.

---

## 4. Zod 스키마 (단일 정본)

```typescript
// lib/validators/configurator.schema.ts
import { z } from 'zod';

export const ConfiguratorSchema = z.object({
  contractPeriod: z.enum(['24', '36', '48', '60']),
  annualMileage:  z.enum(['10000', '15000', '20000', '25000', '30000']),
  prepaidRate:    z.enum(['0', '10', '20', '30']),
  depositRate:    z.enum(['0', '10', '20', '30']),
})
.refine(d => Number(d.prepaidRate) <= 40, {
  message: 'PREPAID_LIMIT_40', path: ['prepaidRate'],
})
.refine(d => Number(d.depositRate) <= 50, {
  message: 'DEPOSIT_LIMIT_50', path: ['depositRate'],
})
.refine(
  d => Number(d.prepaidRate) + Number(d.depositRate) <= 50,
  { message: 'SUM_LIMIT_50', path: ['depositRate'] },
);

export type ConfiguratorInput = z.infer<typeof ConfiguratorSchema>;

export const INITIAL_VALUES: ConfiguratorInput = {
  contractPeriod: '36',
  annualMileage:  '15000',
  prepaidRate:    '0',
  depositRate:    '0',
};
```

### 4.1 조합 가드 테이블

| prepaid \\ deposit | 0 | 10 | 20 | 30 |
|---|---|---|---|---|
| **0** | ✅ | ✅ | ✅ | ✅ |
| **10** | ✅ | ✅ | ✅ | ✅ |
| **20** | ✅ | ✅ | ✅ | ✅ (합=50) |
| **30** | ✅ | ✅ | ✅ (합=50) | ❌ (합=60) |

선택 불가 조합은 RadioGroup Item이 `disabled` + GuardTooltip으로 이유 안내.

---

## 5. 훅 설계

### 5.1 `useQuoteCalculator`

```typescript
// _hooks/useQuoteCalculator.ts
interface Params {
  skuId: string | null;
  contractPeriod: string;
  annualMileage: string;
  prepaidRate: string;
  depositRate: string;
  fixedPreset: ProductPreset;   // page.tsx에서 내려받음
}
interface Result {
  data: CalculateQuoteResponse | null;
  isLoading: boolean;
  error: { code: string; field?: string } | null;
}
export function useQuoteCalculator(params: Params): Result;
```

**내부 동작**
1. `useDebounce(params, 300)`로 debounced params 생성
2. `useEffect(() => { if (!skuId) return; ... }, [debouncedParams])`
3. 이전 요청을 `AbortController.abort()`로 취소
4. `calculateQuote(params, { signal })` 호출
5. 성공: `setData`, 실패: 에러 코드를 Zod 경로로 매핑 후 반환 (ConfiguratorClient가 `form.setError` 호출)

### 5.2 `useResidualValue`

```typescript
interface Params {
  skuId: string | null;
  contractPeriod: string;
  annualMileage: string;
}
interface Result {
  value: number | null;
  isLoading: boolean;
}
export function useResidualValue(params: Params): Result;
```

**내부 동작**
- 키 = `${skuId}:${contractPeriod}:${annualMileage}`
- `useRef(new Map<string, number>())`로 in-memory 캐시
- cache hit → 즉시 value 반환, miss → fetch 후 저장
- 훅 언마운트 시 AbortController 취소

### 5.3 `useDebounce`

```typescript
// lib/use-debounce.ts
export function useDebounce<T>(value: T, delay: number): T;
```

---

## 6. 컴포넌트 명세

### 6.1 `ConfiguratorClient.tsx` (루트)

- `"use client"` 디렉티브
- 루트 div: `className="mx-auto max-w-[1100px] px-5 lg:px-10"`
- props: `{ product: ProductDetailResponse }`
- 내부: `useForm` + `selectedSkuId` + URL sync (`useSearchParams`, `router.replace`)
- 레이아웃: `<div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-10">` (2단)

### 6.2 `SkuSection.tsx`

- STEP1 헤더: "STEP 1. 차량 정보 확인"
- 내부: `<SkuSlider skus={} selectedId={} onSelect={} />`
- 모바일: 가로 스크롤 (`overflow-x-auto snap-x`)
- 데스크톱: 2.5~3.5장 보이는 가로 리스트 + 좌/우 버튼

### 6.3 `SkuSlider.tsx` (확장)

- 카드 필드:
  - 상단: `price` ("40,250,000원") / `trim`
  - 중단: `vehicleType` (Diesel/HEV/EV 배지), 좌석수, 옵션 요약
  - 하단: `<ColorSwatch exterior={} interior={} />`, 색상명
  - 우상단: `stockBucket` 기반 배지 ("2대 남음" / "빠른 출고 가능")
- 선택 시: `ring-2 ring-primary` + `aria-pressed="true"`
- 금지 표현 가드: 옵션 요약 텍스트에 `sanitize()` 적용

### 6.4 `ConfigForm.tsx`

- STEP2 헤더: "STEP 2. 내 견적 만들기"
- 4개 `<FormField>` × `<RadioGroup>`:
  - **계약기간**: 24 / 36 / 48 / 60 (단위: 개월)
  - **주행거리**: 10,000 / 15,000 / 20,000 / 25,000 / 30,000 km
  - **선납금**: 0% / 10% / 20% / 30% — 각 라벨 옆 `price × rate` 환산 금액
  - **보증금**: 0% / 10% / 20% / 30% — 각 라벨 옆 `price × rate` 환산 금액
- 비활성 조합: `<RadioGroupItem disabled />` + `<GuardTooltip reason="합 > 50%" />`
- 에러 메시지: `<FormMessage />` (RHF + Zod)

### 6.5 `PaymentPanel.tsx`

- 데스크톱: `sticky top-24`
- 모바일: 하단 `fixed bottom-0` sticky bar(최종가 + CTA만 노출, "상세" 버튼 → Sheet/Modal로 분해 내역)
- 필드 (`aria-live="polite"` 루트):
  1. 초기납입금액 = `price × (prepaid% + deposit%)`
  2. 표준 렌탈료
  3. 할인합계 (접기/펼치기 — Collapsible)
  4. 월 선납금 차감 (음수 표기)
  5. **최종 렌탈료** (강조, `text-2xl font-bold`)
- 로딩: Skeleton 표시 (값 자리 고정 높이)
- 에러: 배너 + "재시도" 버튼
- CTA: "상담 신청" (disabled, placeholder — 다음 Epic에서 활성), "견적 저장" (Stage A: 미구현 placeholder)

### 6.6 `GuardTooltip.tsx`

- `<Tooltip>` 래퍼
- props: `{ reason: string; children: ReactNode }`
- 텍스트 예: "선납금 + 보증금 합이 50%를 넘을 수 없어요."

---

## 7. 반응형 레이아웃

- **컨테이너**: `max-w-[1100px] mx-auto` — 페이지 중앙 정렬, 최대 너비 1100px
- **좌우 padding**:
  - 데스크톱 (≥1024px): `px-10` (40px)
  - 태블릿 (768~1023px): `px-5` (20px)
  - 모바일 (<768px): `px-5` (20px)

| 뷰포트 | 레이아웃 |
|---|---|
| **1024+ (데스크톱)** | `max-w-[1100px] mx-auto px-10` · 2단 그리드 `grid-cols-[1fr_360px] gap-10` · 좌(STEP1 + STEP2) / 우(PaymentPanel `sticky top-24`) |
| **768~1023 (태블릿)** | `px-5` · 2단 유지, 우측 패널 width 축소 (`grid-cols-[1fr_320px] gap-6`) |
| **<768 (모바일)** | `px-5` · 1단 세로: STEP1(SKU 가로 스크롤) → STEP2 → 하단 sticky bar(최종가 + CTA), "상세" 버튼 → Sheet 모달로 분해 내역 |

**Tailwind 루트 예시** (ConfiguratorClient.tsx):
```tsx
<div className="mx-auto max-w-[1100px] px-5 lg:px-10">
  <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-10">
    {/* 좌: SkuSection + ConfigForm */}
    {/* 우: PaymentPanel (sticky) */}
  </div>
</div>
```

---

## 8. API 계약 (F2/F3 확정 · F4는 consumer)

### 8.1 `GET /products/:modelSlug` (F3)

- RSC `page.tsx`에서 prefetch → `ProductDetailResponseSchema.parse()`
- 사용 필드: `skus[]`, `fixedPreset`, `name`, `heroImage`, `description`

### 8.2 `POST /quotes/calculate` (F2) — debounced 300ms

**요청**
```json
{
  "skuId": "ND0J5C-WAA",
  "contractPeriod": 36,
  "annualMileage": 15000,
  "prepaidRate": 10,
  "depositRate": 10,
  "preset": { "maintenancePackage": "...", ... }
}
```

**응답 (성공)**
```json
{
  "success": true,
  "data": {
    "initialPayment": 12075000,
    "standardMonthlyRent": 663500,
    "discountTotal": -13338,
    "discountBreakdown": [...],
    "prepaidMonthlyDeduction": -251562,
    "finalMonthlyRent": 398600
  }
}
```

**응답 (실패)**: `{ success: false, error: "INVALID_DEPOSIT_PREPAY_LIMIT_SUM_50" }` → §3.3 매핑 테이블로 필드 에러 표시.

### 8.3 `GET /quotes/residual-value` (F2) — 캐시

- Query: `skuId`, `contractPeriod`, `annualMileage`
- 응답: `{ success: true, data: { residualValue: 18500000 } }`

---

## 9. 접근성·i18n·금지 표현

- **접근성**
  - PaymentPanel 루트 `aria-live="polite"` — 값 갱신 시 스크린리더 읽음
  - SKU 카드: `role="button" aria-pressed={selected}` + 키보드 포커스 가능
  - 비활성 RadioItem: `aria-disabled="true"` + GuardTooltip이 이유 전달
  - 최종 렌탈료: `aria-label="최종 월 렌탈료"`
- **금지 표현 가드**
  - `lib/forbidden-expressions.ts`의 `sanitize()` 함수를 SkuSlider의 옵션 요약, PaymentPanel의 할인 사유 텍스트 렌더 전에 적용
  - 미매칭 로그는 console.warn (Stage A). Stage B에서 관제 연동.
- **숫자 포맷**: `Intl.NumberFormat('ko-KR')` — 천단위 콤마. 단위는 "원", "개월", "km".

---

## 10. 검증 기준 (Acceptance Criteria)

| # | 기준 | 검증 방법 | 경계조건 |
|---|---|---|---|
| AC-1 | SkuSlider가 `skus[]` 전체를 렌더링 + 카드 필수 필드(price/trim/vehicleType/color/stockBadge) 표기 | 수동 렌더 + 단위 테스트 | skus=[] 시 "재고 없음" 메시지 |
| AC-2 | SKU 선택 시 `selectedSkuId` 확정 · PaymentPanel의 초기 `price` 반영 · URL `?sku=` 갱신 | dev 확인 + URL 복사 재방문 | `?sku=` 존재 시 초기 선택 복원 |
| AC-3 | 4필드 변경 시 300ms debounce 후 `POST /quotes/calculate` 1회 호출 (연속 변경은 마지막 값만) | 네트워크 탭 + Playwright | 빠른 연속 변경 시 이전 요청 abort |
| AC-4 | 선납·보증 라벨 옆 `price × rate` 환산 금액 표기 (예: "10% (4,025,000원)") | 수동 + 스냅샷 | price=0 시 "0원" |
| AC-5 | `prepaid>40`, `deposit>50`, 합>50 조합 시 해당 RadioItem `disabled` + GuardTooltip 표시 | 수동 + a11y | 합=50 정확히는 허용 |
| AC-6 | 서버 400 `INVALID_DEPOSIT_PREPAY_LIMIT_*` → §3.3 매핑대로 필드 인라인 에러 | mock 에러 주입 | 네트워크 오류와 별도 처리 |
| AC-7 | PaymentPanel 5필드(초기납입/표준렌탈료/할인합계/월선납차감/최종렌탈료) + `aria-live="polite"` | 접근성 도구 | 모든 값 "원" 단위, 천단위 콤마 |
| AC-8 | SKU 또는 (기간·거리) 변경 시 잔가 캐시 miss → `GET /quotes/residual-value` 호출, hit → 캐시 사용 | 네트워크 탭 | 동일 키 2회째는 호출 0건 |
| AC-9 | 네트워크 지연 500ms+ 시 Skeleton, 에러 시 배너 + 재시도 버튼 | 느린 네트워크 시뮬 | 재시도 성공 시 배너 제거 |
| AC-10 | 컨테이너 `max-w-[1100px] mx-auto` · 데스크톱 `px-10` · 태블릿/모바일 `px-5` · 모바일 하단 sticky bar | DevTools 뷰포트 전환 | 375/768/1024/1440 모두 확인 |
| AC-11 | 금지 표현 가드가 SkuSlider·PaymentPanel 텍스트 렌더 전 적용 | 단위 테스트 (금지어 포함 입력) | 치환 로그 확인 |
| AC-12 | Build / Typecheck / Lint 전체 PASS | `pnpm build`, `pnpm typecheck`, `pnpm lint` | — |
| AC-13 | Zod `ConfiguratorSchema` 3 refine 단위 테스트 (20% 초과 시 disable 목록 정확) | Vitest | 경계 값 (합=50, 합=51) |
| AC-14 | E2E 스모크: Golden CSV 대표 3건을 UI로 재현 → 결제 내역 각 필드 1원 단위 일치 | Playwright (Stage A 말미) | F2 Golden CSV 재사용 |

---

## 11. 구현 순서 (Do 단계용)

1. **shadcn/ui 추가**: `form`, `input`, `label`, `radio-group`, `tooltip`, `skeleton` 생성
2. **`lib/validators/configurator.schema.ts`** — Zod + 3 refine + 단위 테스트
3. **`lib/use-debounce.ts`** — `useDebounce<T>` 훅
4. **`lib/api-client.ts` 확장** — `calculateQuote()`, `fetchResidualValue()` + Zod 파싱
5. **`_hooks/useResidualValue.ts`** — Map 캐시 + AbortController
6. **`_hooks/useQuoteCalculator.ts`** — debounce + AbortController + 에러 매퍼
7. **`components/product/SkuSlider.tsx` 확장** — 카드 필드 전체, 선택 상태, 배지
8. **`_components/SkuSection.tsx`** — SkuSlider 래핑 + 가로 스크롤 컨테이너
9. **`_components/GuardTooltip.tsx`**
10. **`_components/ConfigForm.tsx`** — RHF 4필드 + GuardTooltip + 환산 금액 라벨
11. **`_components/PaymentPanel.tsx`** — 5필드 + aria-live + Skeleton + 에러 배너 + 모바일 Sheet
12. **`_components/ConfiguratorClient.tsx`** — RHFProvider + useForm + URL sync + 레이아웃 조립
13. **`app/products/[modelSlug]/page.tsx` 수정** — ConfiguratorClient 삽입 (기존 스켈레톤 교체)
14. **Build / Typecheck / Lint + dev 서버 수동 확인** (4뷰포트)
15. **(옵션) Playwright 스모크 1건** — SKU 선택 + 4필드 → 최종가 확인

---

## 12. 리스크 & 대응

| 리스크 | 영향 | 대응 |
|---|---|---|
| debounce 중 연속 변경 → race condition | 오래된 응답이 최신 상태 덮어씀 | `AbortController` + 요청 seq 번호로 최신만 반영 |
| 잔가 캐시 키 설계 실수 | 잘못된 값 캐싱 | 키 = `${skuId}:${period}:${mileage}` 명시 + unit 테스트 |
| RHF + Zod refine 에러 path가 라디오에 매핑 안 됨 | 에러 위치 잘못 표시 | `path: ['depositRate']` 명시 + 테스트에서 `formState.errors` 확인 |
| 모바일 sticky bar ↔ 가상 키보드 겹침 | 입력 가림 | RadioGroup은 키보드 소환 안 함(OK). 향후 Input 추가 시 `visualViewport` API로 숨김 처리 |
| Stage A 디자인 없음 → 비주얼 편차 논쟁 | 리뷰 지연 | 기본 shadcn/ui만 사용, "디자인은 Stage B"를 PR 설명에 명시 |
| URL `?sku=` 동기화가 뒤로가기와 충돌 | 예상치 못한 리셋 | `router.replace`(push 아님) 사용, 초기 마운트 시만 URL → 상태 역방향 |
| 금지 표현 가드 오탐 | 정상 텍스트 치환 | 치환 로그 console.warn, Stage B에서 룰 튜닝 |

---

## 13. 핸드오프 예정

**F5 landing-and-stock**에 제공할 자원
- `ConfiguratorClient`의 URL `?sku=` 동기화 패턴 (재고 경고 배너 위치 참조용)
- `components/ui/skeleton.tsx` (로딩 공통)
- PaymentPanel의 `aria-live` 접근성 패턴

**(다음 Epic `kgm-rental-consultation`)에 제공할 자원**
- PaymentPanel의 "상담 신청" CTA 훅 포인트 (현재 disabled placeholder)
- 선택 상태(`selectedSkuId` + 4필드 값) → 상담 요청 payload 매핑 예시

---

## 14. 참고

- Plan: `docs/01-plan/features/quote-configurator-ui.plan.md`
- F2 Report: `docs/archive/2026-04/quote-api/quote-api.report.md` — API 계약·에러 코드
- F3 Report: `docs/archive/2026-04/product-catalog/product-catalog.report.md` — apps/b2c 부트스트랩 결과
- api-contracts: `packages/api-contracts/src/product/`, `packages/api-contracts/src/rental-quote/`

---

> 상태 전이: `plan` → **`design`** (이 문서 저장 시점)
> 다음: `/harness:do` — 위 15단계 구현 순서대로 실행
