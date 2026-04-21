# Feature Report: quote-api

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | quote-api |
| Epic | kgm-rental-platform |
| 완료일 | 2026-04-20 |
| 프로필 | blank (KGM 스택) |
| 최종 Match Rate | **97%** |
| 총 Iteration | 0 (1회 통과) |

### Value Delivered (4-Perspective)

| 관점 | 결과 |
|------|------|
| **Problem** | xlsm 기반 수기 견적 계산에 의존 → 온라인 전환 불가, 10 필드 결제내역 분해 불일치 위험 |
| **Solution** | NestJS `rental-quote` 모듈 — DDD 4-Layer + Port-Adapter로 F1 Domain과 F3 product-catalog 의존을 분리한 3 엔드포인트 |
| **Function UX Effect** | 프런트/외부 시스템이 `POST /quotes/calculate` 한 번으로 **10필드 결제내역 + 1원 일치 xlsm 대응값** 확보 |
| **Core Value** | Zod 단일 정본 계약 + xlsm 1원 일치 Golden 테스트로 **숫자 신뢰성** 확보, F4 UI 연동 가능 상태 달성 |

---

## 1. PDCA 사이클 이력

| 단계 | 일시 (KST) | 비고 |
|------|-----------|------|
| init → plan | 2026-04-20 14:37 | Epic 분해 시 Feature 등록 |
| plan → design | 2026-04-20 22:12 | Option B (Clean Architecture) 선택 |
| design → do | 2026-04-20 23:06 | 5-Stage 순차 구현 승인 |
| do → check | 2026-04-21 23:30 | Smoke/E2E 8/8, Unit 3/3 통과 |
| check → report | 2026-04-21 23:34 | matchRate 97% → 그대로 Report |

## 2. 구현 범위

### 2.1 생성된 파일 (35개, ~921 LOC)

**apps/backend/b2c** (NestJS 앱, 신규)

- 설정: `package.json`, `nest-cli.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json`
- 부트스트랩: `src/main.ts`, `src/app.module.ts`, `src/config/typeorm.config.ts`
- 필터: `src/filters/domain-exception.filter.ts`, `src/filters/application-exception.filter.ts`
- 파이프: `src/pipes/zod-validation.pipe.ts`
- 모듈 — `reference-data`:
  - `domain/repositories/reference-data.repository.ts` (Symbol + interface)
  - `domain/repositories/interfaces/reference-data.repository.interface.ts`
  - `infrastructure/repositories/reference-data.typeorm.repository.ts`
  - `infrastructure/adapters/reference-data-reader.adapter.ts`
  - `infrastructure/adapters/reference-vehicle.sku-provider.adapter.ts`
  - `reference-data.module.ts`
- 모듈 — `rental-quote`:
  - `application/ports/reference-data-reader.port.ts`, `product-sku-provider.port.ts`
  - `application/exceptions/vehicle-not-found.application-exception.ts`, `reference-data-missing.application-exception.ts`
  - `application/services/calculate-quote.service.ts`, `get-residual-value.service.ts`, `list-vehicles.service.ts` (+ interfaces)
  - `application/services/test/calculate-quote.service.spec.ts`
  - `presentation/dtos/calculate.rental-quote.dto.ts`, `residual-value.rental-quote.dto.ts`, `list-vehicles.rental-quote.dto.ts`
  - `presentation/rental-quote.controller.ts`
  - `rental-quote.module.ts`
- 테스트: `test/pg-mem-datasource.ts`, `test/quote-api.e2e-spec.ts`, `test/jest.config.cjs`, `test/jest-e2e.cjs`

**packages/api-contracts** (공유 Zod 스키마, 신규)

- `package.json`, `tsconfig.json`, `src/index.ts`
- `src/rental-quote/common.schema.ts` (envelope, ApiError)
- `src/rental-quote/calculate-quote.schema.ts` (literal union 24/36/48/60, 10k–30k, 0/10/20/30)
- `src/rental-quote/residual-value.schema.ts` (z.coerce.number().pipe(literal))
- `src/rental-quote/list-vehicles.schema.ts` ({items, total} 형태)

### 2.2 수정된 파일

| 파일 | 변경 |
|------|------|
| `apps/backend/libs/package.json` | `"type": "module"` + subpath `exports` 추가 (dist 타겟) |
| `turbo.json` | `test:e2e` 태스크 추가 (dependsOn `^build`) |

## 3. 품질 검증 결과

### 3.1 최종 평가

| 관점 | 결과 |
|------|------|
| Build (`nest build`) | ✅ PASS |
| Type Safety (`tsc --noEmit`) | ✅ PASS |
| Lint | ⚠️ SKIP (blank 프로필) |
| Functional (AC 8개) | ⚠️ 90% (6 PASS / 2 부분) |
| Convention | ✅ PASS (100%) |
| Design Match | ⚠️ 95% |
| DS Match | N/A (백엔드) |
| Scope Drift | ✅ PASS (95%) |

### 3.2 수정 이력 (Iteration)

이번 Feature는 iterate 진입 없이 1회 통과했다. 구현 중 자기수정 사례:

1. `tsconfig.json`의 `paths` 매핑 제거 → package `exports` 전환 (rootDir 침범 해결)
2. NestJS filter 등록 순서 역전 — 구체 `ApplicationExceptionFilter`를 catch-all `DomainExceptionFilter` 뒤에 등록
3. 구 빌드 산출물(`.js`/`.d.ts`)이 `libs/src`·`api-contracts/src`에 잔존 → Jest ESM 파서 혼란 → 전부 제거
4. `tsconfig.spec.json` 분리 — Jest 타입 인식 + 테스트 전용 `noUnusedLocals: false`

## 4. Delta (계획 대비 변경사항)

### 4.1 추가된 것

| # | 항목 | 사유 |
|---|------|------|
| 1 | `test/pg-mem-datasource.ts` 헬퍼 | F1과 동일 패턴의 in-memory DB로 e2e 수행 |
| 2 | `tsconfig.spec.json` | Jest + ts-jest 조합에 테스트 전용 타입/옵션 필요 |
| 3 | `DEFAULT_PRESET` 상수 (`calculate-quote.service.ts`) | Design §7.1이 전제한 `dataset.skuPresetDefault` 필드가 libs에 없음 — F3 이관 전 임시 하드코딩 |
| 4 | `GET /api/vehicles` 엔드포인트 | F4 UI의 드롭다운 요구 초기 대응 (Plan에는 없음, Design §5에서 포함됨) |

### 4.2 변경된 것

| # | 원래 계획 | 실제 구현 | 사유 |
|---|----------|----------|------|
| 1 | Filter: `ApplicationExceptionFilter → DomainExceptionFilter` (Design §6) | `DomainExceptionFilter → ApplicationExceptionFilter` | NestJS는 filter를 등록 역순으로 평가 — 구체 필터가 나중에 등록되어야 먼저 매칭 |
| 2 | `ListVehiclesResponse`의 data = 배열 (Design 초안) | `{ items, total }` 객체 envelope | `{success,data,error,meta}` 일관성 유지 (pagination 대비) |
| 3 | Plan의 `ProductSkuProvider` DI 주입자 = F3 Product 모듈 | 현재 F3 부재 → `ReferenceVehicleSkuProviderAdapter`(임시)가 reference 테이블에서 SKU 매핑 | F3 완료 시 adapter 1줄 교체로 전환 |

### 4.3 제거된 것

| # | 항목 | 사유 |
|---|------|------|
| 1 | p95 autocannon 벤치 실행 | e2e 응답 5~32ms로 여유. Check 단계에서 Medium 이슈로 이월 (Report 후 별도 수행) |
| 2 | LIMIT_40/50/SUM_50 e2e 도달 테스트 | Zod literal union(0/10/20/30)이 40/50을 먼저 거부 → Domain exception 도달 불가. Zod가 상위 방어선이므로 기능 결함 아님 |

## 5. 핸드오프 (다음 Feature를 위한 정보)

### 5.1 생성된 공유 자원

| 자원 | 위치 | 설명 |
|------|------|------|
| `@kgm-rental/api-contracts` 패키지 | `packages/api-contracts/` | **단일 계약 정본**. 프런트/백엔드가 Zod 스키마를 공유 |
| `CalculateQuoteRequest/Response` 스키마 | `src/rental-quote/calculate-quote.schema.ts` | F4 UI의 폼 검증 + API 호출 타입 |
| `ResidualValueRequest/Response` | `src/rental-quote/residual-value.schema.ts` | 잔가 단독 조회 계약 |
| `ListVehiclesResponse { items, total }` | `src/rental-quote/list-vehicles.schema.ts` | F4 차종 드롭다운 |
| `ApiEnvelope { success, data, error, meta? }` | `src/rental-quote/common.schema.ts` | 전 엔드포인트 공통 응답 형식 |
| `ReferenceDataReaderPort` / `ProductSkuProviderPort` | `apps/backend/b2c/src/modules/rental-quote/application/ports/` | F3가 `ProductSkuProviderPort`의 **진짜 구현**을 제공 — `ReferenceVehicleSkuProviderAdapter` 교체 지점 |

### 5.2 API/인터페이스

| 엔드포인트 | 설명 |
|-----------|------|
| `POST /api/quotes/calculate` | 5필드 요청 → 10필드 결제내역 분해 + envelope 응답 (xlsm 1원 일치) |
| `GET /api/quotes/residual-value?skuId&contractPeriod&annualMileage` | 잔가(인수가) 단독 조회 — F4 잔가 슬라이더에 사용 |
| `GET /api/vehicles?take&skip` | SKU 목록 (items + total). F4 드롭다운 시드 |
| 에러 코드 | `ZOD_VALIDATION`(400), `VEHICLE_NOT_FOUND`(404), `REFERENCE_DATA_MISSING`(404), `INVALID_DEPOSIT_PREPAY_LIMIT_40/50/SUM_50`(400), `INTERNAL_ERROR`(500) |

### 5.3 아키텍처 결정사항

- **Port-Adapter 분리**: `rental-quote` Application은 **Port**(인터페이스)만 의존. F3 product-catalog는 `ProductSkuProviderPort`의 정식 구현을 제공하여 `ReferenceVehicleSkuProviderAdapter`를 대체한다. 나머지 코드 수정 없이 adapter 교체로 전환 가능.
- **Zod 단일 정본**: 백엔드 DTO·프런트 폼·타입 재사용은 전부 `@kgm-rental/api-contracts`에서 흘러나온다. F4는 이 패키지만 import하면 계약 일치.
- **DEFAULT_PRESET 기술 부채**: `calculate-quote.service.ts`에 `{Select, 만기선택형, chain-no, 서울/경기/인천}` 하드코딩. **F3 도입 시 SKU별 preset 테이블로 이관 필수** (그 전까지 모든 견적이 동일 preset 기준).
- **pg-mem 테스트 전략**: F1에서 도입한 `buildInMemoryDataSource()`를 그대로 재사용 — seedReferenceData 함수가 libs에 위치하므로 F3/F5도 같은 헬퍼 재활용 권장.
- **Filter 순서 규약**: NestJS는 `useGlobalFilters(...)` 인자를 역순 평가. 추가 필터 도입 시 **구체 → catch-all** 순서로 배열에 작성.
- **패키지 `exports` 패턴**: `libs`는 dist 타겟 subpath exports로 노출. 신규 모듈 추가 시 `exports` 업데이트 필요 (`ts paths` 매핑 금지 — rootDir 침범).

## 6. 교훈 (Lessons Learned)

### 6.1 잘된 점

- **Zod 단일 정본 + api-contracts 패키지** — 프런트/백엔드 계약 동기화 위험을 구조적으로 제거.
- **Port-Adapter로 F3 의존 격리** — F2가 F3 없이도 완주되었고, F3 도입 시 교체 지점이 1개 파일로 명확함.
- **xlsm Golden 테스트** — `189,140원 1원 일치`가 e2e에서 재현되어 F1 엔진 + F2 오케스트레이션의 정확성이 End-to-End로 검증됨.
- **pg-mem 재사용** — 실제 DB 기동 없이 빠르게 e2e 가능. F3/F5도 동일 패턴.

### 6.2 개선할 점

- **Design 사전 검증**: Design §7.1이 실제 libs 스키마에 없는 필드(`skuPresetDefault`)를 전제 → 구현 중 발견. Design Checkpoint에서 "참조하는 모든 타입/필드가 실존하는지 자동 확인" 단계를 추가하면 조기 포착 가능.
- **blank 프로필 자동 lint SKIP**: Epic 레벨에서 `eslint` command를 프로필에 설정하여 Check 단계의 자동 lint 관점이 살아나도록 권장.
- **p95 벤치 표준화**: autocannon 설정 + 100 req × 5 concurrency를 템플릿화. 매 Feature Check 단계에서 동일 방식으로 수행하여 성능 회귀 추적.
- **Limit 검증 테스트 커버리지**: Zod가 상위 방어선이라 Domain LIMIT_* 분기 e2e 미도달 — 도메인 단위 테스트만으로 커버리지 보강 권장 (F3에서 prepaidRate union 확장 시 자동 해소 가능).

---

*이 문서는 `/harness:report` 단계의 산출물입니다.*
*다음 단계: `/harness:archive` 후 다음 Feature `product-catalog`의 `/harness:design`*
