# Feature Plan: quote-engine

| 항목 | 내용 |
|------|------|
| Epic | kgm-rental-platform |
| 순번 | 1 / 5 |
| 의존성 | — (선행 Feature 없음) |
| 레이어 | libs (Domain + Reference Data) |

## 범위

- `libs/rental-quote-domain`: xlsm 견적 수식을 수동 이식한 순수 도메인 서비스.
  - **고객 입력 VO 4종**: `ContractPeriod`(24/36/48/60개월), `AnnualMileage`(10k/15k/20k/25k/30k km), `PrepaidRate`(0/10/20/30 %), `DepositRate`(0/10/20/30 %). 환산 금액은 `PrepaidAmount` / `DepositAmount`로 별도 VO.
  - **상품 고정 프리셋 VO**(고객 입력 아님, Product 시드에서 주입): `MaintenancePackage`, `MaturityOption`, `WinterOption`, `Region`, `VehicleOptions`.
  - **잔가 VO**: `ResidualValue` (= 인수가). 차종·계약기간·주행거리로 결정.
  - **값 표현**: `Money`(KRW 정수, VAT 포함/미포함 플래그), `VehicleType`(ICE/HEV/EV), `MileageBand`(보험료 구간).
  - **Entity**: `RentalQuote` — 입력 + 결과 스냅샷.
  - **Domain Services**:
    - `VehicleCostDomainService` — 차량가·옵션·할인 → 공급가·면세·개소세.
    - `TaxDomainService` — 취득세·등록제 비용 + 감면(EV·친환경).
    - `DeliveryDomainService` — 1차 메이커 + 2차 지역별 탁송.
    - `MaintenanceCostDomainService` — 정비 패키지 월비.
    - `InsuranceCostDomainService` — 약정주행거리 구간×차종 보험료.
    - `DepositResidualDomainService` — **기본 잔가 산출 + 선납/보증금을 반영한 월 대여료 재계산**.
    - `ResidualValueDomainService` — 기본 잔가 단독 조회(클라이언트 밸리데이션 용).
    - `RentalQuoteCalculatorDomainService` — Orchestrator(위 6개 조합).
  - **Exceptions**: `InvalidDepositPrepayCombinationException`(deposit+prepay>residual), `UnsupportedVehicleException`, `SubsidyRuleNotFoundException`, `InsuranceRateNotFoundException`.
- `libs/reference-data`: 기준값 타입·스키마(차량·옵션·탁송·정비·보조금·감면·보험료·프로모션).
- 기준값 DB 마이그레이션 + 시드 스크립트(xlsm의 "2 차량정보/3 탁송/4 정비/1 견적조건" + 보험료 시트에서 추출).
- golden CSV 회귀 테스트 픽스처: `libs/rental-quote-domain/__fixtures__/golden-quotes.csv` (20+ 대표 조합).

## 의존성

- 선행: 없음.
- 후행: `quote-api`(F2)가 Domain Services를 UseCase에서 호출.

## 검증 기준 (Acceptance Criteria)

- [ ] 모든 Domain Service가 pure — 외부 HTTP/DB 의존 없음.
- [ ] `RentalQuoteCalculatorDomainService`는 (고객 입력 VO 4종 + SKU 프리셋 + 로드된 기준값)으로 **결제내역 분해 필드**를 반환: `{ standardRent, discountTotal, prepaidDeduction, finalMonthlyRent, residualValue, prepaidAmount, depositAmount, initialBurden, supplyPrice, vat }`. 각 필드가 xlsm 대응 셀과 1원 단위 일치.
- [ ] `ResidualValueDomainService`는 (차종·계약기간·주행거리)만으로 기본 잔가(=인수가, `차량가×잔가율`)를 반환.
- [ ] `DepositResidualDomainService`가 xlsm 제약을 강제: `PrepaidRate > 40` / `DepositRate > 50` / `prepaidRate + depositRate > 50` 각각에 대해 `InvalidDepositPrepayCombinationException`(세부 코드 `LIMIT_40` / `LIMIT_50` / `LIMIT_SUM_50`). 기준은 모두 `Vehicle.price` (할인 없는 차량가).
- [ ] xlsm 반올림 규칙을 정확히 이식: 공급가 `ROUNDUP(-2)`, 부가세 `ROUNDDOWN(-1)`, 보증금/선납금/잔가 `ROUNDUP(-3)`, 선납환원 `ROUNDDOWN(-1)`. 전용 유틸 `krwRound.ts` 정의.
- [ ] xlsm 대표 조건 조합 **25개 이상**의 golden CSV 회귀 테스트 **전원 통과**(1원 단위 일치). 카테고리: 기본·베스트(액티언HEV 36M/20k/0/0 = 월 189,140원)·계약기간(24/36/48/60)·주행거리 5종·EV 분기(특판 150만원 차감)·HEV 분기(개소세 감면)·선납만(0/10/20/30)·보증만(0/10/20/30)·선납+보증 조합(경계 50% 포함)·예외 케이스(30+30 → LIMIT_SUM_50)·트림별 가격 편차·옵션 유무.
- [ ] 기준값 DB 스키마 TypeORM 엔티티 + 마이그레이션 + 시드 스크립트 구동(재실행 안전).
- [ ] 단위 테스트 커버리지 85% 이상(도메인 레이어 기준).
- [ ] `Money` VO는 KRW 정수 내부 표현, 부동소수 연산 금지.
- [ ] EV 보조금·개소세 감면·특판 할인 등 xlsm 주요 분기가 VO 조건 분기로 명시적으로 표현됨.

## 리스크 & 대응

| 리스크 | 대응 |
|--------|------|
| xlsm 수식의 숨은 분기를 누락 | Design 단계 첫 작업: 14시트 스캔하여 분기 인벤토리 작성 → golden 조합 선정 |
| 기준값 값 변경 | reference-data 테이블로 분리, 버전 필드 보존 |
| VAT/면세·개소세 처리 실수 | `Money` VO로 VAT 포함/제외 구분을 타입으로 강제 |
| 선납/보증금 반영 후 월 대여료 계산식 오차 | 선납 → 선납 할인 금액·보증금 → 이자/잔가 반영 공식을 xlsm에서 정확 추출. golden에 선납/보증 조합 포함 |
| 잔가 = 인수가 개념 혼동 | `ResidualValue` VO 하나로 두 개념 통합, 코드 주석과 테스트로 문서화 |

## 다음 단계

- Design: `/harness:design quote-engine` — 도메인 모델 다이어그램 + xlsm 분기 인벤토리 + golden CSV 샘플 확정.
