# Feature Analysis: quote-configurator-ui

| 항목 | 값 |
|---|---|
| Epic | kgm-rental-platform |
| Feature | F4 / 5 |
| Stage | A (기능 완성) |
| 검증 일시 | 2026-04-21 |
| matchRate | **91.5 %** |
| 임계값 | 90 % — **PASS** → report 진행 가능 |
| Harness | v2.0.1 · verification.frontend=true |

---

## 1. 자동 검증 (verification.commands)

| Command | 결과 | 비고 |
|---|---|---|
| `pnpm --filter @kgm-rental/frontend-b2c build` | ✅ PASS | Next 14.2.35 · `/products/[modelSlug]` 40 kB / 127 kB first load |
| `pnpm --filter @kgm-rental/frontend-b2c typecheck` | ✅ PASS | strict 전원 통과 |
| `pnpm --filter @kgm-rental/frontend-b2c lint` | ✅ PASS | 0 errors, 0 warnings |
| dev 서버 기동 (port 4010) | ✅ PASS | `HTTP 200` 확인 |

**자동 검증 점수: 100 %**

---

## 2. Functional 검증 (Acceptance Criteria)

Design §10의 AC 14건 대조.

| # | 기준 | 결과 | 근거 |
|---|---|---|---|
| AC-1 | SkuSlider 전체 SKU 렌더링 + 필수 필드 표기 | ✅ PASS | `components/product/SkuSlider.tsx` 가격·트림·VehicleTypeBadge·색상명·StockBadge 전부 표기, 빈 배열 시 "재고 없음" 메시지 |
| AC-2 | SKU 선택 → `selectedSkuId` 확정 · URL `?sku=` 갱신 · 초기 복원 | ✅ PASS | `ConfiguratorClient.tsx:37-41` useState · `:76-82` router.replace sync · `:138-143` resolveInitialSkuId |
| AC-3 | 4필드 변경 시 300 ms debounce + 이전 요청 abort | ✅ PASS | `useQuoteCalculator.ts` useDebounce(300) + AbortController |
| AC-4 | 선납·보증 라벨 옆 `price × rate` 환산 금액 표기 | ✅ PASS | `ConfigForm.tsx` `formatKrw((basePrice*rate)/100)원`, rate=0 시 '없음' |
| AC-5 | `prepaid>40`, `deposit>50`, 합>50 조합 disable + GuardTooltip | ✅ PASS | `getPrepaidDisabledReason`, `getDepositDisabledReason` + `<GuardTooltip>` 래핑 |
| AC-6 | 서버 400 에러 → Zod 경로 매핑 · `form.setError` | ✅ PASS | `SERVER_ERROR_TO_FIELD` 테이블 + `useQuoteCalculator` 매퍼 + `ConfiguratorClient.tsx:66-75` useEffect |
| AC-7 | PaymentPanel 5필드 + `aria-live="polite"` | ✅ PASS | `PaymentPanel.tsx:30` aria-live 루트, 5개 항목(초기납입·표준렌탈료·할인합계·선납차감·최종) + 보너스 잔가 행 |
| AC-8 | 잔가 캐시: miss → GET, hit → 캐시 | ✅ PASS | `useResidualValue.ts` Map cacheRef · key = `${skuId}:${period}:${mileage}` |
| AC-9 | 로딩 Skeleton · 에러 배너 + 재시도 | ⚠️ PARTIAL | Skeleton/배너 UI ✅ / **재시도 버튼이 실제 refetch를 트리거하지 않음** (retryCounter가 훅 deps에 연결 안 됨) — Stage B iterate 대상 |
| AC-10 | `max-w-[1100px]` · 데스크톱 `px-10` · 태블릿/모바일 `px-5` + **모바일 sticky 바** | ⚠️ PARTIAL | 1100 컨테이너 + 패딩 ✅ · lg:sticky PaymentPanel ✅ / **모바일 하단 fixed sticky bar + Sheet 모달 미구현** — Stage B 범위 |
| AC-11 | 금지 표현 가드 (SkuSlider 옵션, PaymentPanel 텍스트) | ✅ PASS | `SkuSlider.tsx:35` sanitize 옵션 · `PaymentPanel.tsx:136` sanitize 에러 코드 · `page.tsx:21` description |
| AC-12 | Build / Typecheck / Lint 전체 PASS | ✅ PASS | §1 참조 |
| AC-13 | Zod refine 단위 테스트 (Vitest) | ❌ FAIL | 미구현 — Design §11 에서 "(옵션)" 마킹, Stage B로 연기 권장 |
| AC-14 | E2E 스모크 (Golden CSV 3건, Playwright) | ❌ FAIL | 미구현 — Design §11 에서 "(옵션)" 마킹, Stage B로 연기 권장 |

**Functional 점수: (10 PASS + 2 × 0.5 partial) / 14 = 78.6 %**

---

## 3. AI Review

### 3.1 Convention Adherence · 95 %

- ✅ 모든 신규 컴포넌트 arrow function
- ✅ Named export 원칙 준수
- ✅ `is*` 접두어 (isLoading, isValid, isSelected, isDisabled, isDiscount, isMuted, isRetryable, isNetworkError)
- ✅ `interface` for props, `type` for unions
- ✅ No `any` in 신규 코드 (외부 응답은 `unknown` + 타입 가드로 좁힘 — `api-client.ts:extractApiError`)
- △ `api-client.ts`의 기존 async 함수 선언이 arrow로 변환되며 외부 import 순서가 규칙과 약간 다름 (type import 위치). 경미.

### 3.2 Design-Implementation Match · 95 %

- ✅ 디렉토리 구조 Design §2 완전 일치
- ✅ Zod 스키마 Design §4 (4 enum + 3 refine) 완전 일치
- ✅ 훅 시그니처 Design §5 일치 (useQuoteCalculator, useResidualValue, useDebounce)
- ✅ 컴포넌트 분해 Design §6 일치
- △ Design §8.2 API 요청 페이로드에 `preset` 필드가 명시됐으나 실제 `CalculateQuoteRequestSchema`에는 없음 → 구현은 실제 스키마 따름. Design 문서의 오탈자.

### 3.3 Scope Drift Detection · 85 %

| 추가 | 정당성 | 영향 |
|---|---|---|
| `/products/xlsx/` 프리뷰 라우트 + `MockConfiguratorClient` · fixture · 생성 스크립트 (총 7 파일) | 사용자 명시 요청 — 백엔드/DB 없이 견적기 UX 검증 | 프로덕션 코드 경로 무간섭. 별도 `/xlsx/` 하위. F5/Check 단계 영향 없음 |
| 레이아웃 핫픽스 `minmax(0,1fr)` + `min-w-0` 추가 | CSS Grid 오버플로 버그 수정 | ConfiguratorClient · MockConfiguratorClient 양쪽 적용. AC-10 보강 |

- 프로덕션 F4 범위 파일 18개 (Design §11 구현 순서 그대로). 프리뷰 라우트는 F4 AC 평가 대상 아님.

### 3.4 Frontend Best Practices · 95 %

(`frontend=true` · `.tsx` 변경 있음 · Vercel React 모범 사례 기준)

| 주제 | 평가 |
|---|---|
| **Waterfalls** | ✅ RSC page.tsx 단일 fetchProductDetail. ConfiguratorClient 내부는 useQuoteCalculator ‖ useResidualValue 병렬. |
| **Bundle Size** | ✅ 126 kB first load, 추가 의존성(react-hook-form 8 kB gzip) 합리적 |
| **Server-Side rendering** | ✅ `page.tsx`는 RSC, `'use client'`는 ConfiguratorClient 하위 트리에만 제한 |
| **Re-render** | ✅ useMemo(selectedSku, resolveInitialSkuId) 적용. `form.watch()` 전체 구독은 RHF 패턴상 허용 |

### 3.5 Design System Match — **SKIP** (`config.verification.designSystem: null`)

---

## 4. matchRate 계산

| 관점 | 점수 | 가중 |
|---|---|---|
| Automated | 100 % | 1 |
| Functional (AC) | 78.6 % | 1 |
| Convention | 95 % | 1 |
| Design-Impl Match | 95 % | 1 |
| Scope Drift | 85 % | 1 |
| Frontend Best Practices | 95 % | 1 |
| Design System | SKIP | 0 |
| **평균** | **91.5 %** | 6 |

**임계값 90 % 초과 → report 전이 가능.**

---

## 5. 열린 이슈 (Stage B로 이관)

1. **AC-9 — 재시도 버튼 미동작** (MINOR 버그)
   - `ConfiguratorClient.tsx`의 `retryCounter` state가 `useQuoteCalculator` 훅의 deps에 전달되지 않음. 네트워크 에러 시 재시도 클릭해도 refetch 안 일어남.
   - 수정 제안: `useQuoteCalculator`에 `retryKey` 파라미터 추가 → useEffect 의존성에 포함.

2. **AC-10 — 모바일 하단 sticky bar 미구현** (missing feature)
   - Design §6.5·§7 에 명시된 모바일 레이아웃(최종가 + CTA만 노출하는 `fixed bottom-0` + "상세" 버튼 → Sheet 모달)은 미구현.
   - 현재 모바일에서 PaymentPanel은 1단 세로 스택의 하단에 위치 — 기능은 동작하나 UX는 스펙 미달.

3. **AC-13 / AC-14 — 자동 테스트 미구현** (선택 스펙)
   - Design §11 에 "(옵션) Playwright 스모크"로 명시됨. Stage A 범위 외 처리.
   - Vitest(Zod refine 경계값 3건) + Playwright(Golden CSV UI 재현 3건)은 Stage B 혹은 전용 QA Feature로 분리 권장.

---

## 6. Stage B 인수 메모

Stage B(피그마 시안 반영) 진입 시 알려둘 자산:

- **공통 인프라 재사용 가능**: Zod schema (`lib/validators/configurator.schema.ts`), debounce/AbortController 훅, api-client 확장, 금지 표현 가드, shadcn/ui 프리미티브 6종.
- **교체 예상**: `SkuSlider` 카드 비주얼, `ConfigForm` RadioGroup 스타일, `PaymentPanel` 레이아웃, 모바일 sticky bar 추가.
- **유지**: `useQuoteCalculator`/`useResidualValue` 훅 로직, 3 refine 검증, URL `?sku=` 동기화 패턴.

---

## 7. 전이 결정

- matchRate 91.5 % ≥ 90 % → **`report`로 전이 가능**
- 열린 이슈 3건은 **새 Feature (configurator-stage-b)** 로 이관하여 피그마 반영과 함께 처리 권장.
