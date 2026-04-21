# Feature Plan: quote-api

| 항목 | 내용 |
|------|------|
| Epic | kgm-rental-platform |
| 순번 | 2 / 5 |
| 의존성 | Feature 1 (quote-engine), Feature 3 (product-catalog) |
| 레이어 | apps/backend/b2c (Presentation + Application + Infrastructure) |

## 범위

- NestJS `rental-quote` 모듈 구현(`apps/backend/b2c/src/modules/rental-quote/`):
  - **Presentation**: `RentalQuoteController` + DTO(Zod).
    - `CalculateQuoteDto`: `skuId`, `contractPeriod`(24|36|48|60), `annualMileage`(10000|15000|20000|25000|30000), `prepaidRate`(0|10|20|30), `depositRate`(0|10|20|30) — 5개 필드. **비율 기준 = VehicleSku.price (차량가)**.
    - `GetResidualValueQueryDto`: `skuId`, `contractPeriod`, `annualMileage` (3개 필드).
    - 공통 응답 envelope `{ success, data, error, meta }`.
  - **Application**:
    - `CalculateQuoteUseCase` — DTO 입력 → SKU·모델 lookup(F3 Repository 호출) → 모델·트림 고정 프리셋 + 기준값 로드 → Domain Service 호출 → **결제내역 분해 결과** 반환.
    - `GetResidualValueUseCase` — `ResidualValueDomainService` 단독 호출(잔가만 반환).
  - **Infrastructure**:
    - `ReferenceDataRepository` TypeORM 구현체(차량·이율·잔가율·보험료·정비·탁송·특판 테이블 조회).
    - `ProductSkuProvider` — Product 모듈(F3)의 `ProductModel·VehicleSku` Repository를 DI로 주입해 SKU·모델 조회.
- 엔드포인트:
  - `POST /quotes/calculate` → 결제내역 **분해 필드** 전체 반환:
    ```
    {
      standardRent       : 표준 렌탈료 (공급가 + 부가세)
      discountTotal      : 할인합계 (내부 금액조정 합)
      prepaidDeduction   : 월 선납금 차감 (= -선납금/계약기간)
      finalMonthlyRent   : 최종 렌탈료
      residualValue      : 잔가 (= 인수가)
      prepaidAmount      : 환산 선납금
      depositAmount      : 환산 보증금
      initialBurden      : 초기납입금액 (= 선납금 + 보증금)
      supplyPrice        : 공급가
      vat                : 부가세
    }
    ```
  - `GET /quotes/residual-value?skuId&contractPeriod&annualMileage` → 기본 잔가만 반환.
- 통합 테스트(Jest + Supertest): golden CSV 대표 3~5건을 API로 호출해 각 분해 필드 1원 단위 일치 검증.

## 의존성

- 선행: `quote-engine`(F1), `product-catalog`(F3 — SKU·모델 lookup 필요).
- 후행: `quote-configurator-ui`(F4)가 이 API를 호출해 결제내역 패널을 렌더링.

## 검증 기준 (Acceptance Criteria)

- [ ] `POST /quotes/calculate`가 5개 필드 DTO(비율 기반)를 Zod로 검증.
- [ ] 응답에 **결제내역 분해 10개 필드** 모두 포함, 각 필드가 xlsm 대응 셀과 1원 단위 일치.
- [ ] `prepaidRate+depositRate > 50` / `prepaidRate > 40` / `depositRate > 50` 각각에 대해 400 + 세부 에러코드(`INVALID_DEPOSIT_PREPAY_LIMIT_SUM_50` / `LIMIT_40` / `LIMIT_50`).
- [ ] `GET /quotes/residual-value`가 기본 잔가만 빠르게 반환(F1의 동일 Domain Service 재사용 — DRY).
- [ ] SKU 미존재 404, 기준값 미존재 404, 서버 오류 500.
- [ ] golden CSV의 대표 3~5건을 API 통합 테스트로 검증하고 **1원 단위 일치**.
- [ ] p95 응답 시간 200ms 이하(로컬 벤치 기준).
- [ ] DDD 의존 방향 준수: Presentation → Application → Domain(libs). Infrastructure는 Repository 인터페이스 구현.

## 리스크 & 대응

| 리스크 | 대응 |
|--------|------|
| 레퍼런스 데이터 N+1 조회 | UseCase 시작 시점에 필요한 기준값을 일괄 로드 |
| DTO↔VO 매핑 누락 필드 | Zod 스키마를 VO 생성자와 1:1 대응, 빌드시 타입 단언 |
| SKU·모델 결합으로 UseCase가 복잡 | `ProductSkuProvider` 인터페이스를 Application이 소유, Product 모듈은 이를 구현(Inversion) |
| 결제내역 필드가 많아 타입 드리프트 | 결과 VO(`RentalQuote`)의 getter와 API 응답 DTO를 `libs/api-contracts` Zod 스키마 단일 정본으로 공유 |

## 다음 단계

- Design: `/harness:design quote-api` — 엔드포인트 스펙, DTO 스키마, 에러 코드 체계, 응답 분해 필드 계약 확정.
