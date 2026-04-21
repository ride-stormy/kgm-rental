# Feature Report: landing-and-stock-v2

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | landing-and-stock-v2 |
| Epic | kgm-rental-platform |
| 완료일 | 2026-04-21 |
| 프로필 | blank (frontend-only) |
| 최종 Match Rate | 97% |
| 총 Iteration | 1 (check → act → report) |
| 단일 소스 | Figma `9sxH4k4w6tWb9QK7guDgzV` · nodeId `8:1844` |

### Value Delivered (4-Perspective)

| 관점 | 결과 |
|------|------|
| **Problem** | v1에서 혼재된 디자인 소스(피그마 + 레퍼런스)로 UI 방향이 산만했고, 백엔드 재고 모듈이 랜딩의 상담 신청 플로우에 불필요한 복잡성을 주고 있었음. 트림 셀렉터는 SKU 원본을 그대로 노출해 중복 수십 건이 떠 선택 불가 수준 |
| **Solution** | Figma 단일 소스(8:1844) 기반 5섹션(Hero / ProductsHeader / FilterTabs / CarItem / Calculator) 전면 재작성. 백엔드 stock 모듈/UTM/v1 섹션 19개 파일 제거. 트림은 고유 12개로 dedupe + 최저가 기준 오름차순 정렬 |
| **Function UX Effect** | 모바일 375~540px 컨테이너 고정, sticky 필터 + IO 기반 자동 하이라이트, Car 카드 "견적내보기" 탭 → Calculator prefill, 선수금+보조금 ≤ 50% 실시간 가드, 200ms debounce 월납금 재계산 |
| **Core Value** | **상담 신청 전환 단일 경로** 확립: 차량 탐색 → 조건 체험 → CTA → (상담 플로우). 디자인-코드 일치도 97%, 자동 검증 100%, lint warning 0건 |

---

## 1. PDCA 사이클 이력

| 단계 | 일시 | 비고 |
|------|------|------|
| init → plan | 2026-04-21 06:40 | v2 시작 (v1 cancelled 이후 클린 핸드오프) |
| plan → design | 2026-04-21 09:47 | Figma 단일 소스 + 3옵션 중 Option C 선택 |
| design → do | 2026-04-21 09:52 | 16단계 구현 승인 |
| do → check | 2026-04-21 11:12 | matchRate 91% (Figma 전면 재작성 포함 2차 구현) |
| check → act | 2026-04-21 11:12 | 전체 수정 선택 (Critical 1 + Medium 1 + Low 2) |
| act → report | 2026-04-21 11:18 | matchRate 97%로 상승, threshold 통과 |

## 2. 구현 범위

### 2.1 생성된 파일 (총 18개)

**Lib / Hooks (3)**
- [apps/frontend/b2c/lib/vehicle-pricing.ts](apps/frontend/b2c/lib/vehicle-pricing.ts) — F4 공식 로컬 재구현, `findMinSku`, `groupSkusByTrim`, `computeCarItemPricing`
- [apps/frontend/b2c/lib/use-quote-estimation.ts](apps/frontend/b2c/lib/use-quote-estimation.ts) — Calculator 상태 + clampPair + prefill 이벤트
- [apps/frontend/b2c/lib/use-scroll-filter.ts](apps/frontend/b2c/lib/use-scroll-filter.ts) — IntersectionObserver + sticky 언핀 + anchor scroll

**Landing Components (6)**
- [apps/frontend/b2c/app/_components/landing/CarItem.tsx](apps/frontend/b2c/app/_components/landing/CarItem.tsx) — 2단 카드(텍스트/썸네일) + purple 가격 + 반투명 blur CTA
- [apps/frontend/b2c/app/_components/landing/FilterTabs.tsx](apps/frontend/b2c/app/_components/landing/FilterTabs.tsx) — sticky 칩 세트 + gray-900 활성
- [apps/frontend/b2c/app/_components/landing/CalculatorSection.tsx](apps/frontend/b2c/app/_components/landing/CalculatorSection.tsx) — 드롭다운 + SegmentedPicker + PercentSlider 조립
- [apps/frontend/b2c/app/_components/landing/_calculator/SegmentedPicker.tsx](apps/frontend/b2c/app/_components/landing/_calculator/SegmentedPicker.tsx) — 기간/거리 선택
- [apps/frontend/b2c/app/_components/landing/_calculator/PercentSlider.tsx](apps/frontend/b2c/app/_components/landing/_calculator/PercentSlider.tsx) — 0~50% 10% step
- (재작성) [apps/frontend/b2c/app/_components/landing/ProductsSection.tsx](apps/frontend/b2c/app/_components/landing/ProductsSection.tsx) — 헤더 + 필터 + 6 CarItem 묶음

**Assets (8)**
- `apps/frontend/b2c/public/images/landing/{heroimg,torres,actyon,musso,mussogrand,mussoev,tivoli}.png`
- `apps/frontend/b2c/public/images/landing/leftarrow.svg` (purple 원형 화살표, CarItem CTA용)

**Figma 분석 산출물 (1 디렉토리)**
- `.figma-impl/` (manifest.json, conventions.md, design-data/section-00X-*.md ×5)

### 2.2 수정된 파일 (총 6개)

- [apps/frontend/b2c/app/page.tsx](apps/frontend/b2c/app/page.tsx) — RSC 진입점, fixture 로딩 + pricing 사전 계산
- [apps/frontend/b2c/app/_content/landing.ts](apps/frontend/b2c/app/_content/landing.ts) — v2 5섹션 카피 + 모델 배지 + conditionParts
- [apps/frontend/b2c/app/_components/landing/HeroSection.tsx](apps/frontend/b2c/app/_components/landing/HeroSection.tsx) — 밝은 테마 + 다크 네이비 CTA
- [apps/frontend/b2c/app/layout.tsx](apps/frontend/b2c/app/layout.tsx) — Pretendard `<link>` 로드
- [apps/frontend/b2c/app/globals.css](apps/frontend/b2c/app/globals.css) — 슬라이더 커스텀 스타일
- [apps/frontend/b2c/tailwind.config.ts](apps/frontend/b2c/tailwind.config.ts) — `kgm.purple.600`, `shadow-kgm-1dp/4dp`
- [apps/frontend/b2c/lib/api-client.ts](apps/frontend/b2c/lib/api-client.ts) — fetchStock/UTM 제거
- [apps/backend/b2c/src/app.module.ts](apps/backend/b2c/src/app.module.ts) — StockModule import 제거
- [packages/api-contracts/src/index.ts](packages/api-contracts/src/index.ts) — stock schema export 제거

### 2.3 삭제된 파일 (v1 정리, 총 19개)

- Backend stock 모듈: `apps/backend/b2c/src/modules/stock/` 디렉토리 (7 파일)
- api-contracts stock: `packages/api-contracts/src/stock/` (1)
- Frontend lib: `stock-fixture.ts`, `use-stock.ts`, `utm.ts`, `use-utm.ts` (4)
- Frontend Route Handlers: `app/api/stock/route.ts`, `app/api/products/route.ts` (2)
- Frontend v1 섹션 컴포넌트: `SolutionsHeading`, `ComparisonTable`, `BenefitCards`, `SummaryBanner`, `TrustSection` (5)
- Frontend UI: `components/ui/table.tsx` (1)

## 3. 품질 검증 결과

### 3.1 최종 평가 (matchRate 97%)

| 관점 | 점수 | 결과 |
|------|---:|:---:|
| Build | 100 | PASS (`/` 12.1kB static, 6 pages) |
| Type Safety | 100 | PASS (0 errors) |
| Lint | 100 | PASS (0 warnings) |
| Functional | 100 | PASS (AC 45/45) |
| Convention | 95 | PASS |
| Design Match | 92 | PASS |
| DS Match | N/A | (blank profile) |
| Scope Drift | 98 | PASS |
| Frontend Best Practices | 95 | PASS |

### 3.2 수정 이력 (Iteration 1)

| 우선순위 | 이슈 | 조치 | 파일 |
|:---:|---|---|---|
| 🔴 Critical | 트림 dropdown 중복 (61 SKU → 12 trim 필요) | `groupSkusByTrim()` 헬퍼 추가, trim명 기준 dedupe + 해당 trim 최저가 SKU 선택 후 가격 오름차순 정렬 | `lib/vehicle-pricing.ts`, `lib/use-quote-estimation.ts` |
| 🟡 Medium | Pretendard CDN FOIT 리스크 | `@import` 제거 → `<link preconnect>` + `<link stylesheet>` 조합으로 layout.tsx head 배치 | `app/layout.tsx`, `app/globals.css` |
| 🟢 Low | react-hooks/exhaustive-deps warning | ref snapshot을 effect 진입 시 로컬 변수로 복사 | `lib/use-scroll-filter.ts` |
| 🟢 Low | Hero 폴백 배경색 gray-900 (디자인과 불일치) | section에 `bg-gray-100` 적용 | `app/_components/landing/HeroSection.tsx` |

## 4. Delta (계획 대비 변경사항)

### 4.1 추가된 것 (Plan/Design에 없었으나 구현된 것)

| # | 항목 | 사유 |
|---|------|------|
| 1 | Figma MCP 분석 산출물 (`.figma-impl/`) | Design 단계에서 Figma 토큰을 텍스트로만 참조해 매칭률이 낮았음 → Do 단계에서 `/figma-implement` 스킬로 Phase 1 자동 분석 도입 |
| 2 | `kgm.purple.600` + `shadow-kgm-1dp/4dp` 디자인 토큰 | Figma 브랜드 purple(#2e2c4b) 및 Shadow_1DP/4DP 토큰이 Design 문서엔 명시 안 됐으나 실제 Figma에서 필수 |
| 3 | `groupSkusByTrim()` 헬퍼 | AC #20 트림 옵션 표기 규칙 누락 → Check에서 발견 후 Act에서 추가 |
| 4 | Pretendard 웹폰트 CDN `<link>` | 디자인 스펙(Pretendard family)을 실제 브라우저 렌더에 주입하기 위해 필요 |
| 5 | 차량 CTA용 `leftarrow.svg` | CarItem "견적내보기" 아이콘을 Lucide → 커스텀 purple 원형 화살표로 교체 (사용자 요청) |
| 6 | Hero CTA inline style `#2e2c4b` + shadow-lg | 캐시/안정성 이중 방어 (사용자 요청) |

### 4.2 변경된 것 (Plan/Design과 다르게 구현된 것)

| # | 원래 계획 | 실제 구현 | 사유 |
|---|----------|----------|------|
| 1 | CarItem thumbnail 크기 스펙 없음 (Figma 180×180) | 180×180 (사용자 조정 중 한때 220으로 했다가 복귀) | Figma 스펙 최종 채택 |
| 2 | Calculator card 좌우 `px-5 pad` | `px-0` (사용자 요청) | 섹션 경계 맞춤을 위한 수정 |
| 3 | CarItem `carItem.conditions` 단일 문자열 | `conditionParts` 배열 + dot 구분점 | Figma의 · 구분점 렌더링을 위해 |
| 4 | CTA 버튼 radius 초기 `rounded-full` (pill) | `rounded-xl` (12px) | Figma 스크린샷 재확인 결과 pill이 아닌 12px moderate radius |
| 5 | CarItem arrow 아이콘 Lucide `ArrowUpRight` | `/images/landing/leftarrow.svg` (사용자 제공) | 브랜드 일관성 |

### 4.3 제거된 것 (Plan/Design에 있었으나 구현하지 않은 것)

| # | 항목 | 사유 |
|---|------|------|
| 1 | (없음) | AC 45개 전부 구현됨 |

## 5. 핸드오프 (다음 Feature를 위한 정보)

### 5.1 생성된 공유 자원

| 자원 | 위치 | 설명 |
|------|------|------|
| `vehicle-pricing.ts` 헬퍼 | [apps/frontend/b2c/lib/vehicle-pricing.ts](apps/frontend/b2c/lib/vehicle-pricing.ts) | `computeMonthlyQuote`(F4 PMT 재구현), `findMinSku`, `groupSkusByTrim`, `computeCarItemPricing`, 상수(`CONTRACT_MONTHS`, `ANNUAL_KM`, `PERCENT_STEPS`, `CAR_ITEM_DEFAULTS`) |
| `useScrollFilter` | [apps/frontend/b2c/lib/use-scroll-filter.ts](apps/frontend/b2c/lib/use-scroll-filter.ts) | IO 기반 섹션 자동 하이라이트 + sticky 언핀 + anchor scroll. 향후 제품 리스트 페이지에서 재사용 가능 |
| `useQuoteEstimation` | [apps/frontend/b2c/lib/use-quote-estimation.ts](apps/frontend/b2c/lib/use-quote-estimation.ts) | 견적 상태 + clampPair 가드 + 200ms debounce. Calculator 외 quote 페이지에서도 재사용 가능 |
| Design tokens | [apps/frontend/b2c/tailwind.config.ts](apps/frontend/b2c/tailwind.config.ts) | `kgm.purple.600`, `shadow-kgm-1dp/4dp` |
| Figma analysis artifacts | [.figma-impl/](.figma-impl/) | manifest.json, conventions.md, section-00X-*.md (5섹션) — 다음 Feature가 Figma를 동일 방식으로 분석할 때 템플릿으로 활용 |
| 브랜드 purple CTA SVG | [apps/frontend/b2c/public/images/landing/leftarrow.svg](apps/frontend/b2c/public/images/landing/leftarrow.svg) | 공용 ‘진입’ 아이콘으로 재사용 가능 |

### 5.2 API/인터페이스

| 엔드포인트/함수 | 설명 |
|---------------|------|
| `CustomEvent('landing:prefill-calculator', detail: {modelSlug, skuId})` | CarItem → Calculator 간 prefill 이벤트. Epic 내 다른 랜딩 컴포넌트도 동일 패턴 사용 가능 |
| `computeMonthlyQuote({vehiclePrice, contractMonths, annualKm, prepaidPercent, subsidyPercent})` | 로컬 월납금 추정. 서버 호출 없음 |

### 5.3 아키텍처 결정사항

- **Stock 개념 폐기**: v2는 재고 카운트를 UI에 노출하지 않음. 백엔드 stock 모듈 제거. 향후 재고가 필요하면 별도 Feature로 재도입 권장
- **UTM 수집 제외**: 이번 범위에서 UTM 헤더/스토리지 삭제. UTM/추적은 이후 analytics Feature로 분리
- **Figma MCP 사용 표준화**: 디자인 해석 단계에서 `/figma-implement` 스킬 호출을 기본 절차로 채택 (ETHOS: 디자인은 코드)
- **모바일 전용**: max-w-[540px] 고정 컨테이너. 데스크톱 1024px+ 레이아웃 미대응 (후속 Feature에서 필요 시 확장)
- **견적 공식 로컬 재구현**: F4 backend의 PMT를 `vehicle-pricing.ts`에서 JS로 재구현. 실제 계약 시점에 서버 공식과 cross-check 필요

## 6. 교훈 (Lessons Learned)

### 6.1 잘된 점

- **v1 cancellation → v2 클린 시작**: 혼재된 디자인 소스를 끌고 가지 않고 Figma 단일 소스로 재시작한 결정이 매칭률을 크게 높임 (91% → 97%)
- **Act 1회 사이클로 matchRate 6점 상승**: Critical 1건 + Medium 1건 + Low 2건을 묶어 처리, 반복 횟수 최소화
- **Figma MCP 도입**: `get_design_context` + `get_screenshot` 병렬 수집 → design-data 파일 5건으로 구조화 → 실제 레이아웃/색상/타이포 재현력 크게 향상
- **사용자 주권 원칙 준수**: 트림 처리 방식을 4가지 옵션으로 제시하고 사용자가 A(단순 최저가)를 선택하도록 한 부분이 post-do 혼란 없이 진행
- **AC 45개 기반 자동 검증**: 기능 검증 기준이 체크리스트로 미리 작성되어 Check 단계가 빠르게 끝남

### 6.2 개선할 점

- **Design 단계에서 Figma MCP 미호출이 재작업을 유발**: 초기 Do 단계의 v1 완성본이 Figma와 톤이 크게 달라 "1차 Do → 사용자 피드백 → 2차 Figma 기반 Do" 식으로 두 번 작업됨. 
  → **개선안**: `/harness:design` 스킬에 "Figma nodeId가 있으면 `get_design_context` 필수 호출" 단계를 추가 제안
- **트림 옵션 규칙 Design 스펙 누락**: AC #20이 "트림 자동 재선택"까지만 정의하고 "옵션 dropdown 표기 규칙"(중복 처리)을 명시하지 않아 Critical 버그로 노출
  → **개선안**: Design 템플릿에 "데이터 단위 vs 사용자 인지 단위" 체크리스트 추가
- **dev 서버와 pnpm build 동시 실행 시 `.next/` 충돌**: Check 단계에서 build 실행 중 dev HMR이 꺠져 500 발생
  → **개선안**: Check 스킬에서 dev 서버 감지 시 사용자에게 안내 + `.next/` 격리 옵션 제안
- **Pretendard `next/font/local` 미적용**: 현재 CDN `<link>`로 대체. 번들에 woff2 포함 시 FOIT 완전 제거 가능 (후속 과제)

---

*이 문서는 `/harness:report` 단계의 산출물입니다.*
*다음 단계: `/harness:archive`로 Feature 아카이빙*
