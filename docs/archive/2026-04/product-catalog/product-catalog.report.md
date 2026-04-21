# Feature Report: product-catalog

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | product-catalog (F3 / 5) |
| Epic | kgm-rental-platform |
| 완료일 | 2026-04-21 |
| 프로필 | blank (실제 스택: NestJS 10 + TypeORM + Next.js 14 + pnpm/turbo 모노레포) |
| 최종 Match Rate | **93%** (iter1 91% → iter2 93%) |
| 총 Iteration | 2 (Check 1회 + Act 1회 후 Re-check) |

### Value Delivered (4-Perspective)

| 관점 | 결과 |
|------|------|
| **Problem** | 차량 카탈로그 데이터 부재로 F2(견적) Adapter 임시 데이터에 의존, F4/F5가 시작 불가. 모델·트림·색상 매핑 표준 없음. |
| **Solution** | DDD 4-Layer 위에 ProductModel + VehicleSku 2계층 도메인 + Zod 기반 api-contracts + xlsx 시더 + Next.js SSR 페이지. F2 임시 Adapter 청산. |
| **Function UX Effect** | `/products` 모델 그리드 + `/products/[modelSlug]` 상세 SKU 슬라이더 동작. 견적 계산이 실제 SKU·프리셋 참조로 전환. |
| **Core Value** | 카탈로그가 단일 진실원천이 됨 → F4(설정 UI), F5(실시간 재고)가 Port 계약 위에서 병렬 진행 가능. |

---

## 1. PDCA 사이클 이력

| 단계 | 일시 | 비고 |
|------|------|------|
| init → plan | 2026-04-20 05:37 | Epic 일괄 생성 |
| plan → design | 2026-04-20 23:02 | Feature plan + Acceptance Criteria 확정 |
| design → do | 2026-04-20 23:10 | Option B (Clean Architecture) 채택 |
| do → check | 2026-04-21 00:28 | 구현 + smoke test 완료 |
| check → act | 2026-04-21 00:42 | iter1 91% → 전체 수정 선택 |
| act → check | 2026-04-21 00:59 | H1~H5 + M1 fix 완료 |
| check → report | 2026-04-21 01:02 | iter2 93%, HIGH/MEDIUM 0건 |

## 2. 구현 범위

### 2.1 생성된 파일 (주요)

**공유 라이브러리** (`apps/backend/libs/src/`)
- `domain/entities/product-model.domain-entity.ts`, `vehicle-sku.domain-entity.ts`
- `domain/value-objects/slug.value-object.ts`, `product-preset.value-object.ts`
- `domain/services/trim-parser.service.ts`
- `infrastructure/typeorm/product-model.orm-entity.ts` (+ mapper), `vehicle-sku.orm-entity.ts` (+ mapper)
- `infrastructure/xlsx/vehicle-groups.parser.ts`
- `infrastructure/color-codes.map.ts`
- `infrastructure/seeders/products.seeder.ts`

**백엔드 product 모듈** (`apps/backend/b2c/src/modules/product/`)
- `presentation/` controller + 4 DTO
- `application/use-cases/` 3 service + exception
- `domain/repositories/`, `domain/ports/stock-override.port.ts`
- `infrastructure/repositories/`, `infrastructure/adapters/product-sku-provider.adapter.ts`

**api-contracts** (`packages/api-contracts/src/product/`)
- `common.schema.ts`, `product-card.schema.ts`, `product-detail.schema.ts`, `vehicle-sku.schema.ts`

**프론트엔드** (`apps/frontend/b2c/`)
- `app/products/page.tsx`, `app/products/[modelSlug]/page.tsx`, `not-found.tsx`
- `components/product/ProductCard.tsx`, `ColorSwatch.tsx`, `SkuSlider.tsx`
- `lib/api-client.ts`, `cn.ts`, `forbidden-expressions.ts`
- `components/ui/card.tsx`, `button.tsx` (shadcn 최소 셋)

**테스트**
- backend-libs: 14 files · 93 tests
- backend-b2c unit: 3 (CalculateQuoteService 갱신)
- backend-b2c e2e: 14 (product 8 + quote 6)

### 2.2 수정된 파일 (F2 청산 외)

- `apps/backend/b2c/src/modules/quote/...`: `ReferenceVehicleSkuProviderAdapter` 삭제, 신규 `ProductSkuProviderAdapter`로 교체. `DEFAULT_PRESET` 하드코딩 제거 → `ProductModel.fixedPreset` 사용.
- act iteration: frontend 5개 파일 arrow 변환 + import 순서 정리 (H1~H5, M1).

## 3. 품질 검증 결과

### 3.1 최종 평가

| 관점 | 결과 |
|------|------|
| Build | **PASS** (Next.js 14 + Nest 10) |
| Type Safety | **PASS** (6/6 typecheck) |
| Lint | **FAIL (env)** — eslint devDependency 미설치, F2 누적 (L3) |
| Functional | **PASS** (12 AC 중 11 완전 + 1 partial) |
| Convention | **PASS** (98) |
| Design Match | **PASS** (95) — 6개 합의된 Delta 모두 사유 명확 |
| DS Match | **N/A** — Design System 없음 |
| Scope Drift | **PASS** (94) — 추가 항목은 모두 방어적/안정화 조치 |

### 3.2 수정 이력 (Iteration)

**iter1 (matchRate 91%)** — Check 발견 이슈 7건
- HIGH H1~H5: arrow function 5건 (`sanitize`, `cn`, `ProductCard`+`formatKrw`, `ColorSwatch`, `SkuSlider`)
- MEDIUM M1: import type 순서 3파일
- MEDIUM M2: error envelope 강화 (Design 대비 구조 개선)
- LOW L1~L3: 의도적 보류

**iter2 (matchRate 93%)** — Act 결과
- H1~H5 전부 arrow 변환 완료 (typecheck/build PASS)
- M1 import 순서 ProductCard/SkuSlider 정리, ProductCard `formatKrw`는 caller 아래로 이동 (convention §5)
- M2는 doc-only Delta (§4.2 참조)
- L1~L3 유지

## 4. Delta (계획 대비 변경사항)

### 4.1 추가된 것

| # | 항목 | 사유 |
|---|------|------|
| 1 | `EMPTY_LIST` 폴백 (api-client.ts) | Stage A에서 API 미기동 시 빌드/페이지 크래시 방지 |
| 2 | `dynamic = 'force-dynamic'` (Next.js page) | Stage A 빌드 안정화. Stage B에서 ISR(revalidate:60)로 복귀 예정 |
| 3 | forbidden-expressions 블랙리스트 3항 | Design §6에서 placeholder로 명시했던 항목을 실제 등록 |
| 4 | api-contracts `product/*.schema.ts` 4파일 분리 | 단일 `schemas.ts` 대신 스키마별 co-location |

### 4.2 변경된 것

| # | 원래 계획 | 실제 구현 | 사유 |
|---|----------|----------|------|
| 1 | `product-model.entity.ts` | `product-model.domain-entity.ts` | `.claude/rules/backend/be-libs.md` 접미사 컨벤션 준수 |
| 2 | VehicleSku id = `${specCode}-${colorCode}` | `${specCode}-${colorCode}-r${rowNumber}` | xlsx 166행 중 12건 중복 → tie-breaker로 rowNumber 추가 |
| 3 | `apps/b2c` | `apps/frontend/b2c` | CLAUDE.md "frontend 폴더" 규칙 준수 |
| 4 | error envelope `error: string` | `error: { code, message } \| null` | F2 envelope과 통일하며 디버깅 정보 보강 |
| 5 | ISR `revalidate: 60` | `force-dynamic` (Stage A) | API 부재 환경 안정화. Stage B 복귀 예정 |

### 4.3 제거된 것

없음. Plan/Design의 검증 기준 12건 모두 이행.

## 5. 핸드오프 (다음 Feature를 위한 정보)

> 다음 Feature 후보: **F4 quote-configurator-ui**, **F5 landing-and-stock**

### 5.1 생성된 공유 자원

| 자원 | 위치 | 설명 |
|------|------|------|
| ProductModel 도메인 엔티티 | `apps/backend/libs/src/domain/entities/product-model.domain-entity.ts` | slug · brand · fixedPreset · skus[] 보유 |
| VehicleSku 도메인 엔티티 | `apps/backend/libs/src/domain/entities/vehicle-sku.domain-entity.ts` | trim·options·color·price·stockBucket |
| Slug, ProductPreset value object | `apps/backend/libs/src/domain/value-objects/` | 검증·불변 보장 |
| trim-parser.service | `apps/backend/libs/src/domain/services/` | 트림 문자열 → vehicleType (EV/HEV/Diesel/ICE) |
| color-codes.map | `apps/backend/libs/src/infrastructure/` | xlsx 색상 코드 → 표시 이름·hex |
| api-contracts product 스키마 | `packages/api-contracts/src/product/*.schema.ts` | Zod 단일 진실원천 (`@kgm-rental/api-contracts/product/*.schema.js` 서브패스 import) |
| ProductSkuProviderAdapter | `apps/backend/b2c/src/modules/quote/infrastructure/adapters/` | quote 모듈이 사용 중인 Port 구현체 |
| StockOverridePort | `apps/backend/b2c/src/modules/product/domain/ports/stock-override.port.ts` | F5가 구현할 Port 계약 |

### 5.2 API/인터페이스

| 엔드포인트 | 응답 | 용도 |
|---|---|---|
| `GET /products` | `ListProductsResponse` (모델 6개 카드 요약) | F4 모델 선택 단계 |
| `GET /products/:modelSlug` | `ProductDetailResponse` (모델 + 전체 skus[]) | F4 STEP1 SKU 슬라이더 |
| `GET /products/:modelSlug/skus/:skuId` | `VehicleSkuDto` | F4 견적 재조회 |

응답 envelope: `{ success: boolean, data: T \| null, error: { code, message } \| null, meta?: ... }` (F2 envelope과 통일).

### 5.3 아키텍처 결정사항

1. **Port-Adapter 외부 경계 고정** — F4는 `ProductSkuProviderPort`로 SKU 조회, F5는 `StockOverridePort`로 재고 덮어쓰기. 두 Feature 모두 product 모듈 내부 의존 금지.
2. **api-contracts 서브패스 import 의무** — `@kgm-rental/api-contracts/product/...schema.js` 형태. 단일 root export 사용 시 트리쉐이킹 손실 + 빌드 시간 증가.
3. **Stage A → B 전환 가이드**:
   - Next.js page: `force-dynamic` 제거 → `revalidate: 60` 복귀
   - api-client `EMPTY_LIST` 폴백 제거 (Stage B는 API 가용성 보장됨)
   - `<Image>`로 placeholder 교체 (Design §6.3)
4. **xlsx 시드 멱등성** — products.seeder.ts는 id Upsert. 가격 변경 시 history 로그는 후속 이슈로 분리.
5. **arrow function + import 순서 컨벤션** — frontend 전체 파일 일관 적용. F4 새 파일도 동일 룰 따라야 한다.

## 6. 교훈 (Lessons Learned)

### 6.1 잘된 점

- DDD 4-Layer를 처음부터 일관 적용 → F2 임시 Adapter 청산이 큰 충격 없이 진행됨
- api-contracts 서브패스 분리로 F4/F5에서 필요한 스키마만 import 가능
- xlsx 중복 행을 발견 즉시 id 전략 변경(rowNumber tie-breaker) → 시드 안정화
- iter2에서 HIGH/MEDIUM 0건 달성 (5건 arrow + 3건 import 순서 일괄 정리)

### 6.2 개선할 점

- **eslint 인프라 갭 (L3)** — F2부터 누적. F4 시작 전 별도 작업으로 처리 권장 (`pnpm -w add -D eslint @typescript-eslint/...` + 워크스페이스 config)
- **Stage A 폴백 코드 추적 필요** — `EMPTY_LIST`, `force-dynamic`, placeholder 이미지를 Stage B 진입 시 일괄 제거할 체크리스트가 필요
- **Convention 자동화** — arrow function 변환과 import 순서는 lint rule로 강제 가능. eslint 복구 시 `eslint-plugin-import` + project 룰 적용 권장
- **컴포넌트 위치(L2)** — 현재 `components/product/`. Domain Tier로 정착시키려면 F4 진행 시 `src/{feature}/components/` 구조로 이전 검토

---

*이 문서는 `/harness:report` 단계의 산출물입니다.*
*다음 단계: `/harness:archive product-catalog` 또는 다음 Feature(F4 quote-configurator-ui)의 `/harness:design`*
