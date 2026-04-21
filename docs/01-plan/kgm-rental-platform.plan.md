# Epic Plan: kgm-rental-platform

## Executive Summary

| 항목 | 내용 |
|------|------|
| Epic | kgm-rental-platform |
| 작성일 | 2026-04-20 |
| 프로필 | blank (kgm-rental 스택: pnpm + Turborepo, Next.js 15, NestJS 10, TypeORM, PostgreSQL, shadcn/ui + Tailwind, DDD 4-Layer) |
| 관련 Epic | — |

### Value Delivered (4-Perspective)

| 관점 | 내용 |
|------|------|
| **Problem** | KGM 장기렌트 400대 한정 판매에서 ① 유튜브 시청 후 전화 대기 구조로 구매 타이밍 이탈, ② 공개 웹에 상품·조건별 가격 탐색 경로 부재, ③ 메리츠 xlsm 수기 견적으로 상담이 길어져 이탈률 상승. |
| **Solution** | 유튜브 "더보기" CTA가 진입하는 B2C 웹사이트(`apps/b2c`, Next.js 15)에 ① 장기렌트 상품 진열·상세 페이지, ② 메리츠 xlsm 계산식을 정확히 이식한 조건별 실시간 가격 계산기를 제공. 외부 재고 API로 400대 잔여 수량을 배지로 노출해 긴급성을 유지. |
| **Function UX Effect** | 고객은 영상 시청 직후 모델 카드를 둘러보고 모델 선택 후 상세 페이지의 **STEP1**(SKU 카드 슬라이더에서 트림·옵션·색상·재고 조합 선택) → **STEP2**(4필드 조건 입력: 계약기간·주행거리·선납률·보증률) 흐름으로 **월 대여료와 결제내역을 즉시·정확하게** 확인. 우측 고정 패널에 표준 렌탈료·할인·선납 차감·최종 렌탈료가 실시간 분해 표시. |
| **Core Value** | 가격 계산 1원 단위 정확성 + 빠른 가시화. "완성도보다 전환율"이라는 프로젝트 목표를 지키면서도 견적 오류로 인한 신뢰 훼손 리스크를 원천 차단. |

---

## 1. 배경 및 문제 정의

### 1.1 현재 상태

- 영상 → 전화 → 상담 → 계약의 선형 플로우에서 "공개 웹 탐색"이 누락. 영상 설명란이 전부.
- 메리츠캐피탈 배포용 xlsm(14시트)으로 영업사원이 견적을 수기 계산 → 상담 시간 장기화.
- 기존 세일즈 어드민과 외부 재고 API는 **이미 존재**. 이번 프로젝트에서 구축하지 않음.
- 라이드㈜는 KGM Experience Center 강남/일산/부산을 운영하며, 이번 특별 한정 상품은 메리츠캐피탈 독점 제휴.

### 1.2 목표

- **400대 집중 판매**의 상단 깔때기를 공개 웹으로 확장.
- 유튜브 인입 고객이 상품·조건·월 렌트료까지 **상담 없이 탐색**할 수 있게 만들기.
- 가격 계산 결과가 xlsm 원본과 **1원 단위로 일치**.
- 기획 변경 가능성을 감안한 **얇은 수직 슬라이스 우선** 전략.

---

## 2. 요구사항

### 2.1 기능 요구사항

| # | 요구사항 | 우선순위 |
|---|---------|---------|
| 1 | **목록**: 장기렌트 모델 카드(토레스/무쏘/무쏘그랜드/무쏘EV/액티언HEV/티볼리) — "월 XX원부터" 최저가 표기 | 높음 |
| 1.1 | **상세 STEP1 — 차량 정보 확인하기**: 모델의 모든 SKU(트림+옵션+색상+재고) 카드를 가로 슬라이더로 나열. 각 카드에 트림명·차량가·연료·인승·추가옵션·외장/내장 색상·`N대 남음` 배지·출고 가능 태그 표기 | 높음 |
| 1.2 | **상세 STEP2 — 내 견적 만들기**: SKU 선택 후 4필드 입력(계약기간·주행거리·선납률·보증률) | 높음 |
| 2 | 4필드 허용값: 계약기간 = {24, 36, 48, 60}개월, 약정 주행거리 = {10k, 15k, 20k, 25k, 30k}km, 선납·보증 각 = {0, 10, 20, 30}% | 높음 |
| 2.1 | 정비 패키지·만기 방식·월동장비·지역은 **고객 입력에서 제외**, 상품별(혹은 트림 단위) **고정 프리셋**으로 서버가 자동 적용 | 높음 |
| 2.2 | **비율 기준**: 선납·보증의 base = `VehicleSku.price`(선택한 SKU의 차량가, 할인 없음). 각 선택 옆에 환산 금액 표기 | 높음 |
| 2.3 | **제약 (xlsm 규칙)**: `prepaidRate ≤ 40`, `depositRate ≤ 50`, `prepaidRate + depositRate ≤ 50`. 초과 조합 UI 비활성화 + 서버 400 | 높음 |
| 3 | 입력 변경 시 실시간 **결제내역 분해**: `표준렌탈료 / 할인합계 / 월 선납금 차감 / 최종 렌탈료 / 잔가(인수가) / 초기납입금액(선납+보증금) / 공급가 / 부가세` 필드 각각 노출 | 높음 |
| 4 | 계산 로직은 메리츠 xlsm과 1원 단위 일치(golden CSV 회귀 테스트) | 높음 |
| 5 | 외부 재고 API(재고 목록만 제공)를 백엔드 프록시로 호출해 400대 잔여 수량 배지 노출 | 높음 |
| 6 | 브랜드 정책 위반 문구("최저가", "전국 최저") 렌더 가드 | 높음 |
| 7 | UTM 파라미터 수집(유튜브 인입 트래킹) | 중간 |
| 8 | 모바일·데스크톱 동등 품질 반응형 | 높음 |
| 9 | 상품·상품별 고정 프리셋·기준값은 DB 시드로 관리(편집 UI 없음) | 중간 |
| 10 | **개발 순서**: 견적기 기능을 디자인 없는 기본 UI로 완성하고 xlsm과 1원 일치 검증 PASS 후에 Claude Design 시안을 반영 | 높음 |

### 2.2 비기능 요구사항

- **정확성**: 견적 계산 결과 100% 일치(회귀 테스트 golden CSV 20+ 조합 모두 PASS).
- **성능**: 상품 페이지 LCP 2.5s 이하(4G). 견적 재계산 API p95 < 200ms.
- **접근성**: WCAG 2.1 AA 기본 준수(키보드 포커스, 대비, aria-live로 결과 갱신 알림).
- **보안**: 입력 검증은 Zod로 프론트·백 공통. 기준값 테이블은 관리자 경로 없음(시드 기반). 외부 재고 API 호출은 백엔드 프록시(키 노출 방지).
- **관측성**: API 에러·재고 API 타임아웃·금지 표현 가드 발동은 로그로 남김.
- **브랜드 정책**: 금지 문구 필터가 카피/메타(title, og:description)까지 커버.

---

## 3. 범위

### 3.1 포함 (In Scope)

- S1: B2C 장기렌트 상품 페이지(진열·상세) — `apps/b2c` (Next.js 15).
- S2: 조건별 가격 계산기 — **고객 입력은 계약기간/주행거리/선납금/보증금 4개**, 그 외 조건(정비·만기·월동·지역 등)은 상품별 **고정 프리셋**으로 서버가 주입. xlsm과 1원 단위 일치.
- 외부 재고 API 연동 Adapter(**재고 목록만 반환하는** 확정 스펙 기반).
- 개발 순서: 견적기 기능 검증(xlsm 1원 일치) **먼저** → Claude Design 시안 반영.

### 3.2 제외 (Out of Scope)

- S3: 상담 신청 폼 + 기존 세일즈 어드민 딥링크/웹훅 → **별도 Epic `kgm-rental-consultation`**.
- 어드민 상품·기준값 편집 UI → 이번 Epic에서는 DB 시드 스크립트로 대체.
- 400대 판매 현황 관제 대시보드 → 별도 Epic 후보.
- 유튜브 영상 제작(콘텐츠 팀), 세일즈 어드민(이미 존재), 재고 API 구현(외부 팀).
- 결제/전자약정 문서 플로우.

---

## 4. Features

> Epic은 하나 이상의 Feature로 분해된다.
> 작은 작업은 Feature 1개, 큰 작업은 여러 Feature로 나뉜다.

### 4.1 Feature 분해

| # | Feature | 범위 요약 | 의존성 |
|---|---------|----------|--------|
| 1 | **quote-engine** | `libs/rental-quote-domain` (Entity/VO/Domain Service) — xlsm 수식 수동 이식(PMT 기반). 고객 입력은 계약기간·주행거리·선납률·보증률 4종. 상품 프리셋(정비·만기·월동·지역·옵션)은 서버가 SKU·모델에서 주입. 3규칙 검증(`prepaid≤40`, `deposit≤50`, `합≤50`). `libs/reference-data` DB 스키마·시드(xlsm 추출: 이율/잔가율/보험료/정비/탁송/특판) + golden CSV(25+ 조합) 회귀 테스트. 출력: 표준렌탈료·할인합계·선납금차감·최종렌탈료·잔가·초기납입금액·공급가·부가세 분해 필드 | — |
| 2 | **quote-api** | `apps/backend/b2c` `rental-quote` 모듈. DTO(`skuId`, `contractPeriod`, `annualMileage`, `prepaidRate`, `depositRate`) → UseCase(SKU·모델 lookup + 프리셋 주입) → Domain Service. `POST /quotes/calculate` 결과에 결제내역 분해 필드 전체 포함. `GET /quotes/residual-value` 잔가 단독 조회 | Feature 1 |
| 3 | **product-catalog** | `libs/product-domain` + `apps/backend/b2c` product 모듈. **2단계 계층**: `ProductModel`(카드 단위) → `VehicleSku[]`(상세 STEP1 카드 단위, vehicle-groups.xlsx 1:1). SKU 필드: trim·vehicleType·displacement·options·colorExterior·colorInterior·price·specCode. 엔드포인트: `GET /products`(모델 목록+minMonthlyRent), `GET /products/:modelSlug`(모델 상세+SKU 전체 배열). 시드: vehicle-groups.xlsx 166행 → SKU 파싱, 모델 그룹핑 자동. 고정 프리셋은 모델·트림 단위에서 유도 | — |
| 4 | **quote-configurator-ui** | `apps/b2c` 상품 상세 = **STEP1 SKU 카드 가로 슬라이더**(선택) + **STEP2 4필드 입력**(RHF+Zod) + **우측 고정 결제내역 패널**(표준/할인/선납차감/최종 실시간 분해). 300ms debounce로 F2 호출. 금지 표현 필터, 반응형. 2단계 진행: (a) 기본 shadcn/ui로 기능 완성 + xlsm 1원 일치 → (b) Claude Design 시안 반영 | Feature 2, Feature 3 |
| 5 | **landing-and-stock** | `apps/b2c` `/` 랜딩(유튜브 진입 메시지 + 상품 카드) + 외부 재고 API Adapter(백엔드 프록시, **재고 목록만 반환**) + 잔여 수량 배지(60s 폴링) + UTM 수집 | Feature 3 |

### 4.2 의존성 그래프

```
Feature 1 (quote-engine) ──→ Feature 2 (quote-api) ──┐
                                                     └──→ Feature 4 (quote-configurator-ui)
Feature 3 (product-catalog) ─────────────────────────┘
    │
    └──────────────────────────────────────────────────→ Feature 5 (landing-and-stock)
```

### 4.3 Feature별 검증 기준 (Acceptance Criteria)

#### Feature 1: quote-engine

- [ ] `libs/rental-quote-domain`에 Orchestrator `RentalQuoteCalculatorDomainService`가 존재하고, **고객 입력 VO 4종**(`ContractPeriod`, `AnnualMileage`, `PrepaidAmount`, `DepositAmount`) + **상품 고정 프리셋**(정비·만기·월동·지역·옵션)을 받아 `RentalQuote`(월 대여료·잔가·초기부담금)를 반환한다.
- [ ] `ResidualValueDomainService`가 (차종·계약기간·주행거리)로 기본 잔가(=인수가)를 산출하고, `deposit + prepaid > residualValue` 이면 `InvalidDepositPrepayCombinationException` 발생.
- [ ] 메리츠 xlsm에서 도출한 **대표 조건 조합 20개 이상**을 golden CSV로 보관(`libs/rental-quote-domain/__fixtures__/golden-quotes.csv`)하고, 회귀 테스트가 **1원 단위로 일치**하며 전원 통과.
- [ ] 기준값 DB 스키마(차량·옵션·탁송료·정비패키지·보조금·감면·보험료·프로모션) TypeORM 엔티티 + 마이그레이션 + 시드 스크립트가 구동.
- [ ] 단위 테스트 커버리지 85% 이상(도메인 레이어 기준).
- [ ] pure 도메인 — 외부 의존(HTTP, DB) 없음.

#### Feature 2: quote-api

- [ ] `POST /quotes/calculate`가 Zod DTO(`productSlug`, `contractPeriod`, `annualMileage`, `prepaidAmount`, `depositAmount`)로 입력을 검증하고, 상품 고정 프리셋을 서버가 주입한 뒤 도메인 서비스(F1)를 호출해 결과(`monthlyRent`, `residualValue`, `initialBurden`)를 반환.
- [ ] `GET /quotes/residual-value?productSlug&contractPeriod&annualMileage`가 기본 잔가(=인수가)를 반환 (클라이언트 밸리데이션용).
- [ ] 응답 envelope은 공통 포맷(`{ success, data, error, meta }`)을 따름.
- [ ] 입력 유효성 실패 400(선납+보증금>잔가 포함), 상품/기준값 미존재 404, 서버 오류 500을 올바르게 반환.
- [ ] 통합 테스트(Jest + Supertest)가 golden CSV의 대표 3~5건을 API로 호출해 결과 검증.
- [ ] p95 응답 시간 200ms 이하 (로컬 벤치 기준).

#### Feature 3: product-catalog

- [ ] `GET /products`, `GET /products/:slug` 엔드포인트가 시드된 상품(토레스, 액티언 HEV) 데이터를 반환. 응답에 **고정 프리셋**(maintenancePackage·maturityOption·winterOption·region·options) 포함.
- [ ] `apps/b2c` Next.js의 `/products`, `/products/[slug]` 라우트가 SSR/ISR로 상품 데이터를 렌더링(이 시점의 UI는 **디자인 없는 기본 shadcn/ui 컴포넌트**).
- [ ] 상품 카드·상세 컴포넌트는 `shadcn/ui`의 프리미티브를 기반으로 App-Shared/Domain 2-Tier 구조를 따름.
- [ ] 시드 스크립트 실행만으로 상품·고정 프리셋 데이터가 완성.

#### Feature 4: quote-configurator-ui

**Stage A — 기능 프로토타입 (디자인 없음)**
- [ ] `/products/[slug]`에서 **계약기간·주행거리·선납금·보증금(4필드)** 입력 가능(기본 shadcn/ui 컴포넌트 사용, 별도 디자인 없음).
- [ ] 입력이 바뀌면 300ms debounce 후 F2 `POST /quotes/calculate` 호출.
- [ ] 잔가는 `GET /quotes/residual-value`로 선조회 후 클라이언트 밸리데이션 `deposit + prepaid ≤ residualValue` 적용. 서버 400 응답도 UI에 표시.
- [ ] 결과는 **월 대여료·잔가(=인수가)·초기부담금(선납+보증금)**을 명시하고 `aria-live`로 갱신.
- [ ] golden CSV 대표 3건을 UI 조작으로 재현했을 때 화면 표시값이 xlsm 원본과 **1원 단위 일치** (E2E 스모크).

**Stage B — Claude Design 시안 반영 (Stage A PASS 이후)**
- [ ] 사용자가 전달한 Claude Design 시안을 shadcn/ui 프리미티브 매핑표에 따라 컴포넌트화.
- [ ] 미매핑 요소는 사용자에게 사전 플래그.
- [ ] 모바일(375)·데스크톱(1440) 레이아웃 양쪽에서 동일 상호작용 동작 + 시각 회귀 스냅샷.
- [ ] 금지 표현 가드 유지 (스냅샷/단위 테스트 PASS).

#### Feature 5: landing-and-stock

- [ ] `/` 랜딩 페이지가 유튜브 진입 메시지 + 주요 상품 카드 + 상세 페이지 이동 CTA를 포함.
- [ ] 외부 재고 API(확정 스펙 — **재고 목록만 반환**)를 백엔드 프록시로 호출하는 Adapter가 존재(API 키/토큰 프론트 노출 금지).
- [ ] 상품 카드·상세 상단에 잔여 수량 배지가 표시되며 60초 주기 폴링으로 갱신.
- [ ] 재고 API 오류·타임아웃 시 배지를 숨기고 앱은 정상 동작 (graceful degradation).
- [ ] UTM 파라미터(utm_source 등)가 수집되어 세션 저장소와 첫 API 호출 헤더에 실림.

### 4.4 통합 검증 기준 (Epic-Level)

- [ ] 유튜브 인입 시나리오: `/` → 상품 카드 클릭 → `/products/[slug]` → 4필드 입력 → 월 대여료 확인의 전체 플로우가 모바일·데스크톱에서 끊김 없이 동작.
- [ ] golden CSV 기반 E2E 스모크: 대표 조합 3건을 UI에서 직접 입력해 표시된 월 대여료가 xlsm 원본과 **1원 단위 일치**.
- [ ] `prepaidRate + depositRate > 50` 또는 각 비율 단독 상한(40/50) 초과 시 클라이언트·서버 양측에서 오류 메시지 노출.
- [ ] 외부 재고 API 장애 시뮬레이션(Mock Server Down)에서도 상품 탐색·견적 계산은 계속 동작.
- [ ] Lighthouse(모바일) Performance ≥ 80, Accessibility ≥ 90.
- [ ] 전 페이지 금지 표현 가드 통과(빌드 시점 검사 또는 런타임 가드 중 최소 1).
- [ ] 전체 플로우가 Stage B(Claude Design 시안 반영) 완료 상태에서 검증.

---

## 5. 성공 기준

| # | 기준 | 측정 방법 |
|---|------|-----------|
| 1 | 견적 정확성 | golden CSV 20+ 조합 회귀 테스트 100% 통과(1원 단위) |
| 2 | 핵심 플로우 동작 | `/` → 상품 상세 → 조건 선택 → 월 렌트료 확인까지 E2E 스모크 통과 |
| 3 | 브랜드 정책 준수 | 금지 표현 가드 테스트 통과(어떤 렌더 경로에서도 노출 없음) |
| 4 | 반응형 품질 | 모바일(375)·데스크톱(1440)에서 시각 회귀 스냅샷 + 주요 상호작용 동일 동작 |
| 5 | 외부 연동 안정성 | 재고 API 장애 시 배지만 사라지고 전체 UX는 유지 (graceful degradation) |
| 6 | 빠른 가시화 | F1→F2 선행(정확도 담보) 후 F3 + F4-StageA(디자인 無) 병행. F4-StageA에서 xlsm 1원 일치 PASS 후에만 Stage B(Design 반영) 착수 |
| 7 | 입력 제약 (xlsm 규칙) | `prepaidRate ≤ 40`, `depositRate ≤ 50`, `합 ≤ 50` 세 규칙이 클라이언트·서버 양측에서 동작 |

---

## 6. 리스크

| 리스크 | 영향 | 대응 |
|--------|------|------|
| xlsm 수식의 숨겨진 분기(EV 보조금, 개소세 감면, 한정 프로모션 등)를 놓쳐 견적이 틀림 | 신뢰 훼손 → 상담 거부, 브랜드 손상 | Design 단계에서 xlsm 전체 시트를 카테고리별로 스캔해 분기 목록을 먼저 추출. golden CSV에 카테고리별 대표 조합 포함. |
| 메리츠 특판 할인·기준값이 변경됨 | 견적 오류 유발 | 기준값을 DB 레퍼런스 테이블로 분리(배포 없이 마이그레이션만으로 교체). 버전 필드로 변경 이력 관리. |
| 외부 재고 API 스펙 변경 또는 장애 | 배지 오표시, 긴급성 메시지 훼손 | Adapter 계층을 얇게 유지하고 타임아웃·실패 시 배지 숨김. 스펙 계약을 Design 단계 첫 날 재확인. |
| 디자인 시안이 shadcn/ui·Tailwind 제약과 어긋남 | 구현 지연 | Design 단계에서 시안 수령 즉시 shadcn/ui 컴포넌트 매핑표를 작성하고 미매핑 요소를 사전 플래그. |
| 기획 변경으로 스코프가 흔들림 | 일정 지연 | 얇은 수직 슬라이스(1차종 + 소수 조건 조합)로 F1→F2→F3→F4-StageA 최소 경로를 먼저 완성. 시안은 Stage B에서 반영. |
| 보증금·선납 비율 제약 조합이 복잡 | UX 혼란 | 3개 규칙(`prepaid≤40`, `deposit≤50`, `합≤50`)을 Zod refine + 클라이언트 `useMemo` 가드로 단일 구현. 선택 불가 조합은 UI에서 비활성 + 이유 툴팁 |
| 금지 표현이 후속 카피 변경 시 새로 유입 | 브랜드 정책 위반 | 금지 표현 가드를 런타임(React 컴포넌트)과 CI 검사(정적 분석) 두 계층에 둠. |

---

*이 문서는 `/harness:plan kgm-rental-platform` 단계의 산출물입니다.*
*다음 단계: `/harness:design` (첫 번째 Feature `quote-engine`부터)*
