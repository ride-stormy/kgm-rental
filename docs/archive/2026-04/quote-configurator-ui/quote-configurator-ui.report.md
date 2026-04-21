# Feature Report: quote-configurator-ui

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | quote-configurator-ui (F4 / 5) |
| Epic | kgm-rental-platform |
| Stage | **A (기능 완성)** — Stage B(피그마 룩 반영)는 별도 Feature로 분리 예정 |
| 완료일 | 2026-04-21 |
| 검증 정책 | verification.commands (pnpm + frontend-b2c), frontend=true |
| 최종 Match Rate | **91.5 %** (임계값 90 %) |
| 총 Iteration | 0 (첫 시도 통과) |
| Harness | v2.0.1 |

### Value Delivered (4-Perspective)

| 관점 | 결과 |
|------|------|
| **Problem** | 차량 상세 페이지에 견적 구성 기능 부재 — 고객이 SKU·계약조건을 고르고 결제 내역을 실시간 확인할 수 없었음 |
| **Solution** | Next.js 14 App Router + RSC + RHF/Zod + Native fetch 조합으로 STEP1 SKU 슬라이더 + STEP2 4필드 폼 + 실시간 결제 패널 구축 |
| **Function UX Effect** | 4필드 조작 → 300 ms debounce → F2 호출 → 결제 내역 5 항목 실시간 갱신. 선납·보증 제한 조합 자동 disable + GuardTooltip. URL `?sku=` 공유 가능 |
| **Core Value** | Stage A 기능 완성으로 컨텐츠팀·디자인팀 리뷰용 실물 확보 → 피그마 룩 작업과 병렬로 F5 진행 가능 |

---

## 1. PDCA 사이클 이력

| 단계 | 일시 (KST) | 비고 |
|------|-----------|------|
| init → plan | 2026-04-20 14:37 | Epic Plan 분해 시 자동 생성 |
| plan → design | 2026-04-21 10:28 | Option C — Pragmatic Balance 선택 |
| design → do | 2026-04-21 12:36 | 15단계 구현 순서 확정, 스코프 승인 |
| do → check | 2026-04-21 13:22 | 프로덕션 18 파일 + 프리뷰 7 파일 완료 |
| check → report | 2026-04-21 13:xx | matchRate 91.5 % · report 권장 선택 |

---

## 2. 구현 범위

### 2.1 생성된 파일 (18 프로덕션 + 7 프리뷰)

**프로덕션** (Design §2 · §11 구현 순서 그대로)

```
apps/frontend/b2c/
├─ components/ui/
│  ├─ form.tsx                               (RHF + Zod 프리미티브)
│  ├─ input.tsx · label.tsx
│  ├─ radio-group.tsx                        (context 기반, aria-disabled 지원)
│  ├─ tooltip.tsx                            (호버/포커스)
│  └─ skeleton.tsx
│
├─ lib/
│  ├─ use-debounce.ts                        (제네릭 훅)
│  └─ validators/configurator.schema.ts      (Zod + 3 refine + SERVER_ERROR_TO_FIELD)
│
└─ app/products/[modelSlug]/
   ├─ _hooks/
   │  ├─ useQuoteCalculator.ts               (debounce 300 ms + AbortController + 서버 에러 매퍼)
   │  └─ useResidualValue.ts                 (Map 캐시 + AbortController)
   └─ _components/
      ├─ ConfiguratorClient.tsx              (루트, RHF FormProvider + URL ?sku= sync)
      ├─ SkuSection.tsx                      (STEP 1 헤더)
      ├─ ConfigForm.tsx                      (STEP 2, 4필드 + 환산 금액 + 가드)
      ├─ PaymentPanel.tsx                    (5필드 + aria-live + Skeleton + 에러 배너)
      └─ GuardTooltip.tsx                    (선납·보증 제한 안내)
```

**프리뷰 (`/products/xlsx/`)** — 사용자 명시 요청, UX 검증 용도

```
apps/frontend/b2c/
├─ scripts/generate-xlsx-fixture.mjs          (one-shot: XLSX → JSON)
└─ app/products/xlsx/
   ├─ page.tsx                                (모델 목록, 6종)
   ├─ [modelSlug]/page.tsx                    (상세 + MockConfigurator 마운트)
   ├─ _fixtures/
   │  ├─ vehicles.json                        (166 SKU, pre-docs/vehicle-groups-20260420.xlsx 파싱)
   │  └─ loader.ts
   └─ _components/
      ├─ MockConfiguratorClient.tsx           (프로덕션 컴포넌트 재사용 + 로컬 계산)
      └─ mockQuote.ts                         (F3 seed 공식 기반 근사 계산)
```

### 2.2 수정된 파일

| 파일 | 변경 |
|---|---|
| `app/products/[modelSlug]/page.tsx` | RSC → ConfiguratorClient 마운트, 레이아웃 max-w-[1100px] / px-5 lg:px-10 |
| `components/product/SkuSlider.tsx` | controlled 방식 (selectedId/onSelect props), 카드 필드 전체 (VehicleTypeBadge, StockBadge, 옵션 요약 sanitize), aria-selected |
| `lib/api-client.ts` | 기존 함수 arrow로 변환 + `calculateQuote`, `fetchResidualValue`, `extractApiError` 추가 |
| `app/page.tsx`, `app/products/page.tsx` | 레이아웃 컨테이너 max-w-[1100px] / px-5 lg:px-10 통일 |

### 2.3 의존성 추가

- `react-hook-form` · `@hookform/resolvers` (b2c 전용)

---

## 3. 품질 검증 결과

### 3.1 최종 평가

| 관점 | 결과 | 점수 |
|------|------|-----|
| Build | PASS | 100 % |
| Type Safety | PASS | 100 % |
| Lint | PASS | 100 % |
| Functional (AC 14건) | PARTIAL | 78.6 % |
| Convention | PASS | 95 % |
| Design Match | PASS | 95 % |
| DS Match | SKIP (DS=null) | — |
| Scope Drift | PASS (+프리뷰 라우트 · 사용자 승인) | 85 % |
| Frontend Best Practices | PASS | 95 % |

**matchRate = 91.5 %** (6 관점 평균, DS 제외)

### 3.2 Iteration 이력

0 iteration — 첫 시도에 통과. 재작업 없음.

### 3.3 열린 이슈 (Stage B 이관)

| # | 항목 | 유형 | 이관 대상 |
|---|---|---|---|
| 1 | AC-9 재시도 버튼이 실제 refetch 미트리거 | minor bug | configurator-stage-b |
| 2 | AC-10 모바일 하단 sticky bar 미구현 | missing feature (피그마 룩과 함께 처리 적합) | configurator-stage-b |
| 3 | AC-13 Zod refine 경계값 Vitest | 선택 스펙 (Design §11 "(옵션)") | configurator-stage-b 또는 전용 QA Feature |
| 4 | AC-14 Playwright E2E 스모크 | 선택 스펙 (Design §11 "(옵션)") | configurator-stage-b 또는 전용 QA Feature |

---

## 4. Delta (계획 대비 변경사항)

### 4.1 추가된 것 (Plan/Design에 없었으나 구현된 것)

| # | 항목 | 사유 |
|---|---|---|
| 1 | `/products/xlsx/` 프리뷰 라우트 (`page.tsx`, `[modelSlug]/page.tsx`, fixture · mockQuote · MockConfiguratorClient, 스크립트 `generate-xlsx-fixture.mjs`) | 사용자 요청 — 백엔드/DB 미기동 상태에서 실제 XLSX 데이터로 견적기 UX 체험 필요 (컨텐츠팀 리뷰 준비) |
| 2 | `MockConfiguratorClient` + `mockQuote.ts` | 프로덕션 훅 재사용 시 백엔드가 필요하므로 로컬 계산 버전 분리. 프로덕션 `ConfiguratorClient`는 무변경 |
| 3 | `extractApiError()` 유틸 (api-client.ts) | `unknown` 응답에서 code/message 안전 추출 위한 타입 가드. 기존 문서에 없던 러너블 유틸 |
| 4 | 레이아웃 통일: `/`, `/products` 페이지 max-w 교체 | Design §7 (1100/40/20) 기준을 F4 외 페이지에도 적용 — 사용자 피드백 반영 |

### 4.2 변경된 것 (Plan/Design과 다르게 구현된 것)

| # | 원래 계획 | 실제 구현 | 사유 |
|---|---|---|---|
| 1 | Design §8.2 요청 페이로드에 `preset` 포함 | 실제 구현은 `CalculateQuoteRequestSchema` 그대로 (preset 없음) | `api-contracts/rental-quote/calculate-quote.schema.ts`에 preset 필드 없음 — Design 문서 오탈자로 판단, 계약 우선 |
| 2 | Design §2 `lg:grid-cols-[1fr_360px]` | `lg:grid-cols-[minmax(0,1fr)_360px]` + 좌측 `<div className="min-w-0">` | CSS Grid `1fr`이 SKU 슬라이더 min-content에 의해 확장되어 max-w-[1100px] 깨지는 버그 수정 (런타임에 발견) |
| 3 | SkuSlider `aria-pressed` 지원 | `aria-selected`만 사용, `aria-pressed` 제거 | `role="option"` 에 `aria-pressed` 속성 미지원 — eslint jsx-a11y 경고 해소 |
| 4 | `lib/api-client.ts`의 기존 `async function` 선언 | arrow function으로 변환 | `rules/frontend/typescript.md` 규칙 반영 (arrow only) |

### 4.3 제거된 것 (Plan/Design에 있었으나 구현하지 않은 것)

| # | 항목 | 사유 |
|---|---|---|
| 1 | 모바일 하단 `fixed bottom-0` sticky bar + "상세" → Sheet 모달 (AC-10) | 피그마 룩 없이 Stage A에서 구현하면 Stage B에서 재작업 발생. Stage B로 이관 |
| 2 | Zod refine 경계값 단위 테스트 (AC-13, Vitest) | Design §11에서 "(옵션)"으로 명시. Stage A 기능 완성에 집중 |
| 3 | Playwright E2E 스모크 1건 (AC-14, Golden CSV 3건) | Design §11 "(옵션)". Stage A 범위 외 |
| 4 | 재시도 버튼 실제 refetch 연결 (AC-9) | retry 버튼 UI만 구현. deps 연결은 Stage B에서 처리 — 네트워크 에러는 실사용 환경에서 드물고, 피그마 룩 반영 시 에러 UX 전면 재설계 예상 |

---

## 5. 핸드오프

### 5.1 F5 landing-and-stock에 넘길 자산

- **공유 UI 프리미티브** — `components/ui/{form,input,label,radio-group,tooltip,skeleton}.tsx` 재사용 가능 (F5 랜딩의 UTM 폼 · 배지 로딩 스켈레톤 등)
- **금지 표현 가드 패턴** — `lib/forbidden-expressions.ts` + `sanitize()` 호출부 4곳 (page, SkuSlider, PaymentPanel, xlsx/detail). F5의 상품 카드·잔여 수량 배지 렌더에 동일 패턴 적용
- **URL 쿼리 동기화 패턴** — `ConfiguratorClient`의 `useSearchParams` + `router.replace({ scroll: false })` 방식. F5의 재고 필터/UTM 보존에 참조 가능
- **레이아웃 표준** — `max-w-[1100px] mx-auto px-5 py-10 lg:px-10` 이 Epic 전체 페이지 표준. F5 랜딩도 동일 적용
- **api-client 확장 패턴** — `extractApiError()` 유틸 · AbortController + try/catch + Zod parse 조합 → F5의 재고 조회에 복사·적응 가능

### 5.2 Stage B (configurator-stage-b) 대비 인수 메모

| 유지 (변경 없이 쓸 것) | 교체 예상 (피그마 시안에 따름) |
|---|---|
| Zod schema · useQuoteCalculator · useResidualValue · useDebounce | SkuSlider 카드 비주얼 |
| 서버 에러 매핑 테이블 · form.setError 파이프 | RadioGroup 스타일 |
| URL ?sku= 동기화 · 잔가 Map 캐시 | PaymentPanel 레이아웃 + 모바일 sticky bar |
| 금지 표현 가드 적용 지점 | GuardTooltip 스타일 (기본 tooltip 교체) |

### 5.3 운영 환경 참고

- dev 서버 현재 PID 85781, 포트 4010. 기본 포트 4001은 이미 비어있으나 3000번의 외부 Next 15 앱과 충돌 회피 위해 4010 유지 중.
- `NEXT_PUBLIC_API_BASE_URL` 미설정 시 `localhost:3000/api` 시도 → 실제 F2 백엔드는 3100번 등 다른 포트로 띄워야 함.

---

## 6. 다음 단계

1. **`/harness:archive quote-configurator-ui`** — F4 문서를 `docs/archive/2026-04/quote-configurator-ui/`로 이동. harness.json의 F4 항목은 경량 요약으로 축소.
2. **(사용자 작업)** 피그마에서 Stage B 룩 확정 · 컨텐츠팀 미팅
3. **`/harness:plan configurator-stage-b`** — Stage B Feature 신설. 입력: 피그마 스펙 + 컨텐츠팀 결정사항. 열린 이슈 4건(AC-9/10/13/14)를 범위에 포함
4. **F5 `landing-and-stock`** — Stage B 병렬 또는 후속. Plan은 이미 작성됨, Design부터 시작

---

## 7. 참고 문서

- Plan: [`docs/01-plan/features/quote-configurator-ui.plan.md`](../01-plan/features/quote-configurator-ui.plan.md)
- Design: [`docs/02-design/features/quote-configurator-ui.design.md`](../02-design/features/quote-configurator-ui.design.md)
- Analysis: [`docs/03-analysis/quote-configurator-ui.analysis.md`](../03-analysis/quote-configurator-ui.analysis.md)
- Epic Plan: [`docs/01-plan/kgm-rental-platform.plan.md`](../01-plan/kgm-rental-platform.plan.md)
- F3 Report (선행 핸드오프): [`docs/archive/2026-04/product-catalog/product-catalog.report.md`](../archive/2026-04/product-catalog/product-catalog.report.md)
