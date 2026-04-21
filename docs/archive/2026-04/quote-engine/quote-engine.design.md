# Design: quote-engine

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | quote-engine |
| Epic | kgm-rental-platform |
| 작성일 | 2026-04-20 |
| 프로필 | blank — kgm-rental 스택: pnpm + Turborepo, NestJS 10, TypeORM, PostgreSQL, DDD 4-Layer (F1은 순수 도메인 라이브러리라 프론트엔드 스택과 무관) |
| Plan 참조 | [docs/01-plan/kgm-rental-platform.plan.md](../../01-plan/kgm-rental-platform.plan.md), [docs/01-plan/features/quote-engine.plan.md](../../01-plan/features/quote-engine.plan.md) |

본 Feature의 목적은 메리츠캐피탈 `렌터카 견적시트_2604.v3.xlsm`의 월 대여료 계산식을 **1원 단위로 일치**하는 TypeScript 순수 도메인으로 이식하는 것이다. 후속 Feature(quote-api, quote-configurator-ui)는 이 도메인을 소비한다.

---

## 1. 아키텍처 옵션

### Option A — Minimal

단일 Calculator 클래스에 전 분기 하드코딩, 기준값은 JSON 컬럼 하나로 저장.
- 파일 수 최소, 구현 속도 빠름.
- 단점: 단일 메서드가 300+ 라인, 견적 오차 시 원인 추적 어려움, 기준값 변경 시 버전 관리 불가.

### Option B — Clean Architecture

계산기를 작은 Domain Service로 분해(Vehicle/Tax/Delivery/Maintenance/Insurance/Deposit/Residual + Orchestrator), 기준값 테이블 7개로 분리, VO 9~10개.
- 최고 수준의 테스트 격리·확장성·기준값 버전 관리.
- 초기 구축 시간이 가장 오래 걸림.

### Option C — Pragmatic Balance

Orchestrator 1개 + 순수 함수 모듈 3~4개, VO 핵심 6개, 기준값 테이블 4개.
- 정확성과 구현 속도의 균형.
- 일부 경계가 흐려질 위험.

### 옵션 비교

| 기준 | Option A | Option B | Option C |
|------|:--------:|:--------:|:--------:|
| 구현 속도 | ★★★★★ | ★★ | ★★★★ |
| 유지보수성 | ★★ | ★★★★★ | ★★★★ |
| 확장성 | ★★ | ★★★★★ | ★★★★ |
| 기준값 버전 관리 | ★ | ★★★★★ | ★★★★ |
| xlsm 분기 정확 이식 | ★★★ | ★★★★★ | ★★★★ |
| 견적 오류 리스크 | 중~높 | 낮 | 낮~중 |

**선택: Option B — Clean Architecture** (사용자 결정)

선택 이유: 견적 오류 `= 신뢰 훼손 + 브랜드 손상`이므로 정확성 리스크를 최소화하는 구조 우선. 기준값 7개 테이블 분리로 메리츠 특판 가격이 바뀌어도 배포 없이 마이그레이션만으로 교체 가능.

---

## 2. 상세 설계

### 2.1 디렉토리 구조

```
apps/backend/libs/src/
├── modules/
│   ├── rental-quote/                                         # 견적 계산 도메인
│   │   └── domain/
│   │       ├── domain-entities/
│   │       │   ├── rental-quote.domain-entity.ts             # 입력 + 결제내역 분해 결과 스냅샷
│   │       │   ├── interfaces/rental-quote.domain-entity.interface.ts
│   │       │   └── test/rental-quote.domain-entity.spec.ts
│   │       │
│   │       ├── value-objects/                                # 12개 VO
│   │       │   ├── contract-period.value-object.ts           # 24|36|48|60 (고객 입력)
│   │       │   ├── annual-mileage.value-object.ts            # 10000|15000|20000|25000|30000 (고객 입력)
│   │       │   ├── prepaid-rate.value-object.ts              # 0|10|20|30 (고객 입력)
│   │       │   ├── deposit-rate.value-object.ts              # 0|10|20|30 (고객 입력)
│   │       │   ├── prepaid-amount.value-object.ts            # Money 환산
│   │       │   ├── deposit-amount.value-object.ts            # Money 환산
│   │       │   ├── residual-value.value-object.ts            # Money (= 인수가)
│   │       │   ├── maintenance-package.value-object.ts       # Basic|Standard|Select|Platinum (프리셋)
│   │       │   ├── maturity-option.value-object.ts           # 선택형|인수형 (프리셋)
│   │       │   ├── winter-option.value-object.ts             # 체인·타이어 지급 여부 (프리셋)
│   │       │   ├── region.value-object.ts                    # 서울/경기/인천, 강원(영동)... 12개 (프리셋)
│   │       │   ├── vehicle-type.value-object.ts              # ICE|HEV|EV|Diesel
│   │       │   ├── money.value-object.ts                     # KRW 정수 + VAT 플래그
│   │       │   ├── mileage-band.value-object.ts              # 보험료 구간
│   │       │   └── interfaces/, test/
│   │       │
│   │       ├── exceptions/
│   │       │   └── rental-quote.exception.ts                 # 6종
│   │       │
│   │       └── domain-services/                              # 8개 Domain Service
│   │           ├── vehicle-rent-cost.domain-service.ts       # PMT 기반 차량분 (xlsm M49)
│   │           ├── vehicle-tax-cost.domain-service.ts        # 차세분 (배기량 기반, xlsm EG8)
│   │           ├── insurance-cost.domain-service.ts          # 보험료 월분 (xlsm EG9)
│   │           ├── maintenance-cost.domain-service.ts        # 정비비 (xlsm EG10)
│   │           ├── fixed-cost.domain-service.ts              # 차고지+조합+멤버쉽 (EG11+EG12+EG13)
│   │           ├── supply-price.domain-service.ts            # 공급가 + 부가세 (BR26, BR27)
│   │           ├── residual-value.domain-service.ts          # 잔가(=인수가, CC9)
│   │           ├── deposit-prepaid.domain-service.ts         # 보증/선납 환산 + 3규칙 검증 + 월 환원(BR28)
│   │           ├── rental-quote-calculator.domain-service.ts # Orchestrator: 결제내역 분해 반환
│   │           └── utils/
│   │               ├── krw-round.ts                          # ROUNDUP(-2), ROUNDDOWN(-1), ROUNDUP(-3)
│   │               └── pmt.ts                                # Excel PMT 1:1 이식 함수
│   │
│   └── reference-data/                                       # 기준값 도메인
│       ├── domain/
│       │   ├── domain-entities/                              # 7개 Entity
│       │   │   ├── vehicle.domain-entity.ts                  # 모델코드·스펙코드·배기량·차종·원가(H21)·차량가(X8)
│       │   │   ├── interest-rate.domain-entity.ts            # (차종×계약기간) → annualRate (BR32)
│       │   │   ├── residual-rate.domain-entity.ts            # (차종×계약기간×주행거리) → 잔가율 (N41)
│       │   │   ├── delivery-rate.domain-entity.ts            # 지역×차량구분 → 탁송료
│       │   │   ├── maintenance-package-rate.domain-entity.ts # 패키지×차종×기간 월비 (D127/N19/...)
│       │   │   ├── insurance-rate.domain-entity.ts           # 연령×주행거리×커버 → 연간 보험료(EG30)
│       │   │   ├── promotion.domain-entity.ts                # EV3/EV4 특판 150만원, 토레스 Select 등
│       │   │   ├── interfaces/, test/
│       │   │
│       │   └── exceptions/
│       │       └── reference-data.exception.ts
│       │
│       └── infrastructure/
│           ├── db-entities/                                  # 7개 TypeORM 엔티티
│           │   ├── vehicle.db-entity.ts
│           │   ├── interest-rate.db-entity.ts
│           │   ├── residual-rate.db-entity.ts
│           │   ├── delivery-rate.db-entity.ts
│           │   ├── maintenance-package-rate.db-entity.ts
│           │   ├── insurance-rate.db-entity.ts
│           │   └── promotion.db-entity.ts
│           └── mappers/                                      # 7개 Mapper + test/
│
├── migrations/
│   └── {timestamp}-CreateReferenceDataTables.ts              # 7개 테이블 + 인덱스
└── infrastructure/
    └── seeders/
        └── reference-data.seeder.ts                          # xlsm에서 추출한 JSON/CSV → 테이블
```

### 2.2 핵심 컴포넌트

| 컴포넌트 | 역할 | 파일 |
|---------|------|------|
| `Money` VO | KRW 정수(BigInt 불필요 — 400만 이하) + VAT 포함 플래그 + 연산 | `rental-quote/domain/value-objects/money.value-object.ts` |
| `pmt()` 유틸 | Excel PMT 함수 1:1 이식 (rate, nper, pv, fv, type) | `rental-quote/domain/domain-services/utils/pmt.ts` |
| `krwRound` 유틸 | ROUNDUP/ROUNDDOWN의 자릿수별 구현 | `rental-quote/domain/domain-services/utils/krw-round.ts` |
| `VehicleRentCostDomainService` | PMT 기반 차량분 월비 (xlsm M49) | `.../vehicle-rent-cost.domain-service.ts` |
| `VehicleTaxCostDomainService` | 차세분 (배기량 18/19/24 계수) | `.../vehicle-tax-cost.domain-service.ts` |
| `InsuranceCostDomainService` | 연간 보험료 lookup → /12 | `.../insurance-cost.domain-service.ts` |
| `MaintenanceCostDomainService` | 정비 패키지별 월비 + 특판 분기 | `.../maintenance-cost.domain-service.ts` |
| `FixedCostDomainService` | 차고지(500) + 조합(700) + 멤버쉽(D85/1.1) | `.../fixed-cost.domain-service.ts` |
| `SupplyPriceDomainService` | Σ 위 5개 → ROUNDUP(-2) → + 부가세(ROUNDDOWN(-1)) | `.../supply-price.domain-service.ts` |
| `ResidualValueDomainService` | 잔가 = ROUNDUP(X8 × 잔가율, -3) | `.../residual-value.domain-service.ts` |
| `DepositPrepaidDomainService` | 환산 + 3규칙 검증 + 월 환원(-ROUNDDOWN(선납/계약기간, -1)) | `.../deposit-prepaid.domain-service.ts` |
| `RentalQuoteCalculatorDomainService` | Orchestrator — 결제내역 분해 반환 | `.../rental-quote-calculator.domain-service.ts` |
| 7개 Reference Data Entity | 차량·이율·잔가율·탁송·정비·보험·프로모션 | `reference-data/domain/domain-entities/*.ts` |
| `reference-data.seeder.ts` | xlsm 추출 데이터 → 7개 테이블 시드 | `libs/infrastructure/seeders/reference-data.seeder.ts` |

### 2.3 데이터 흐름

```
[quote-api UseCase(F2)]
   ① customerInput:  { contractPeriod, annualMileage, prepaidRate, depositRate }
   ② skuPreset:      { vehicleSlug, vehicleType, displacement, options }
   ③ modelPreset:    { maintenancePackage, maturityOption, winterOption, region }
   ④ referenceData:  { vehicle, interestRate, residualRate, deliveryRate,
                       maintenancePackageRate, insuranceRate, promotion }
                                   │
                                   ▼
          ┌────────────────────────────────────────────────┐
          │   ResidualValueDomainService                   │
          │   └─ 잔가 = ROUNDUP(X8 × 잔가율, -3)           │
          └────────────┬───────────────────────────────────┘
                       │  residualValue
                       ▼
          ┌────────────────────────────────────────────────┐
          │   RentalQuoteCalculatorDomainService           │
          │   ├─ VehicleRentCost  (PMT 기반 차량분)         │
          │   ├─ VehicleTaxCost   (차세분)                 │
          │   ├─ InsuranceCost    (보험료)                 │
          │   ├─ MaintenanceCost  (정비비)                 │
          │   ├─ FixedCost        (차고지·조합·멤버쉽)      │
          │   ├─ SupplyPrice      (공급가·부가세)          │
          │   └─ DepositPrepaid   (환산 + 3규칙 + 월 환원)  │
          └────────────┬───────────────────────────────────┘
                       │
                       ▼
          ┌────────────────────────────────────────────────┐
          │   RentalQuote (결제내역 분해)                   │
          │   { standardRent, discountTotal,               │
          │     prepaidDeduction, finalMonthlyRent,        │
          │     residualValue, prepaidAmount,              │
          │     depositAmount, initialBurden,              │
          │     supplyPrice, vat }                         │
          └────────────────────────────────────────────────┘
```

---

## 3. 구현 순서

F1은 총 36개 파일(도메인·인프라·테스트·시더 포함). 구현 순서는 "유틸 → VO → Entity → Domain Service → Orchestrator → Reference DB/Seeder → golden 테스트" 순.

| 순서 | 파일 | 유형 | 의존성 |
|------|------|------|--------|
| 1 | `krw-round.ts`, `pmt.ts` | 신규 | — |
| 2 | `money.value-object.ts` | 신규 | krw-round |
| 3 | 고객 입력 VO 4종 (ContractPeriod, AnnualMileage, PrepaidRate, DepositRate) | 신규 | — |
| 4 | 기타 VO 8종 (Prepaid/DepositAmount, ResidualValue, MaintenancePackage, MaturityOption, WinterOption, Region, VehicleType, MileageBand) | 신규 | Money |
| 5 | `rental-quote.exception.ts` | 신규 | — |
| 6 | `rental-quote.domain-entity.ts` (결제내역 분해 필드 스냅샷) | 신규 | VO |
| 7 | 7개 reference-data Entity + DB Entity + Mapper | 신규 | Money, VehicleType |
| 8 | 7개 DB 마이그레이션 | 신규 | DB Entity |
| 9 | `ResidualValueDomainService` | 신규 | VO, reference Entity |
| 10 | `VehicleRentCostDomainService` (PMT 기반 차량분) | 신규 | pmt, Money, reference |
| 11 | `VehicleTaxCostDomainService` (차세분) | 신규 | krwRound |
| 12 | `InsuranceCostDomainService` | 신규 | reference Entity |
| 13 | `MaintenanceCostDomainService` (특판 분기 포함) | 신규 | reference Entity |
| 14 | `FixedCostDomainService` | 신규 | — |
| 15 | `SupplyPriceDomainService` | 신규 | 9~14 |
| 16 | `DepositPrepaidDomainService` (3규칙 검증 + 환원) | 신규 | Money, ResidualValue |
| 17 | `RentalQuoteCalculatorDomainService` (Orchestrator) | 신규 | 15, 16, ResidualValue |
| 18 | golden CSV 픽스처 + 회귀 테스트 | 신규 | Orchestrator |
| 19 | xlsm 추출 스크립트 + seeder | 신규 | reference DB |

---

## 4. 인터페이스 명세

### 4.1 xlsm 수식 → Domain Service 매핑

| xlsm 셀 | 수식 | 담당 Domain Service | 반올림 |
|---------|------|-------------------|--------|
| `sheet2!M49` (차량분 EG7) | `ROUNDUP(PMT(BR32/12, M4, -H21, ROUND(CC9/1.1, 0), 0), -1)` | `VehicleRentCostDomainService.calculate` | ROUNDUP(-1) |
| `sheet8!EG8` (차세분) | `ROUNDUP(IF(EV:2000, IF(≤1600: 배기량×18/12, IF(≤2500: 배기량×19/12, 배기량×24/12))), -2)` | `VehicleTaxCostDomainService.calculate` | ROUNDUP(-2) |
| `sheet8!EG9` (보험료) | `ROUNDUP(연간보험료/12, -2)` | `InsuranceCostDomainService.calculate` | ROUNDUP(-2) |
| `sheet8!EG10` (정비비) | 특판 분기 OR `D127 + N19 + N29 + N33 - N37 + N39` | `MaintenanceCostDomainService.calculate` | — |
| `sheet8!EG11` (차고지) | `500` | `FixedCostDomainService.calculate.sub` | — |
| `sheet8!EG12` (조합) | `700` | `FixedCostDomainService.calculate.sub` | — |
| `sheet8!EG13` (멤버쉽) | `D85 / 1.1` | `FixedCostDomainService.calculate.sub` | — |
| `sheet8!BR26` (공급가) | `ROUNDUP(SUM(EG7:EG13), -2)` | `SupplyPriceDomainService.calculate` | ROUNDUP(-2) |
| `sheet8!BR27` (부가세) | `ROUNDDOWN(BR26 × 0.1, -1)` | `SupplyPriceDomainService.calculate` | ROUNDDOWN(-1) |
| `sheet8!BR23` (표준 렌탈료) | `BR26 + BR27` | `SupplyPriceDomainService.calculate` | — |
| `sheet8!CC8` (보증금) | `ROUNDUP(X8 × DepositRate, -3)` | `DepositPrepaidDomainService.calculate` | ROUNDUP(-3) |
| `sheet8!CC21` (선납금) | `ROUNDUP(X8 × PrepaidRate, -3)` | `DepositPrepaidDomainService.calculate` | ROUNDUP(-3) |
| `sheet8!CC9` (잔가) | `ROUNDUP(X8 × 잔가율, -3)` | `ResidualValueDomainService.calculate` | ROUNDUP(-3) |
| `sheet8!BR28` (선납환원) | `-ROUNDDOWN(선납금 / 계약기간, -1)` | `DepositPrepaidDomainService.calculate` | ROUNDDOWN(-1) |
| `sheet9!Y30` (최종렌탈료) | `BR23 + BR28` | `RentalQuoteCalculatorDomainService.calculate` | — |
| `sheet9!Y33` (초기부담금) | `CC8 + CC21` | `DepositPrepaidDomainService.calculate` | — |

### 4.2 PMT 함수 명세

```typescript
// apps/backend/libs/src/modules/rental-quote/domain/domain-services/utils/pmt.ts

/**
 * Excel PMT 함수 1:1 이식.
 * 월 납입금 = PMT(rate, nper, pv, fv, type)
 *
 * @param rate   이자율 (월 이율 = 연이율 / 12)
 * @param nper   총 납입 기간 수 (개월)
 * @param pv     현재 가치 (음수면 "받는 돈", 양수면 "내는 돈")
 * @param fv     미래 가치 (default: 0)
 * @param type   0 = 기말 지급, 1 = 기초 지급 (default: 0)
 * @returns      월 납입금 (엑셀과 동일 부호 규약)
 */
export function pmt(
  rate: number,
  nper: number,
  pv: number,
  fv: number = 0,
  type: 0 | 1 = 0,
): number {
  if (rate === 0) return -(pv + fv) / nper;
  const pvif = Math.pow(1 + rate, nper);
  return -(rate * (pv * pvif + fv)) / ((1 + rate * type) * (pvif - 1));
}
```

**PMT 회귀 테스트**: Excel에서 추출한 입력·기대값 쌍을 최소 15개 fixture로 보관하고 단위 테스트로 일치 검증.

### 4.3 krwRound 명세

```typescript
// apps/backend/libs/src/modules/rental-quote/domain/domain-services/utils/krw-round.ts

/**
 * Excel의 ROUNDUP/ROUNDDOWN 함수를 자릿수 인자와 함께 이식.
 * num_digits < 0: 정수 부분을 10^|digits| 단위로 반올림/내림.
 *   예: ROUNDUP(480170, -2) = 480200 (100원 단위 올림)
 *       ROUNDDOWN(251562.5, -1) = 251560 (10원 단위 내림)
 *       ROUNDUP(12075000.3, -3) = 12076000 (1000원 단위 올림)
 */
export function roundUp(value: number, digits: number): number;
export function roundDown(value: number, digits: number): number;
```

### 4.4 RentalQuote Entity 스키마

```typescript
export interface RentalQuoteSnapshot {
  // 입력 스냅샷 (audit)
  input: {
    skuId: string;
    contractPeriod: 24 | 36 | 48 | 60;
    annualMileage: 10000 | 15000 | 20000 | 25000 | 30000;
    prepaidRate: 0 | 10 | 20 | 30;
    depositRate: 0 | 10 | 20 | 30;
    vehiclePrice: number;   // X8
    vehicleType: 'ICE' | 'HEV' | 'EV' | 'Diesel';
  };

  // 결제내역 분해 (VAT 포함 KRW 정수)
  standardRent: number;      // BR23 = 공급가 + 부가세
  discountTotal: number;     // 금액 조정 합 (음수)
  prepaidDeduction: number;  // BR28 = -ROUNDDOWN(선납금/계약기간, -1)
  finalMonthlyRent: number;  // BR23 + BR28 + 할인합계
  residualValue: number;     // CC9 = 잔가(=인수가)
  prepaidAmount: number;     // CC21 환산 선납금
  depositAmount: number;     // CC8  환산 보증금
  initialBurden: number;     // CC8 + CC21
  supplyPrice: number;       // BR26
  vat: number;               // BR27
}
```

### 4.5 Domain Exception 명세

```typescript
// rental-quote.exception.ts

export class InvalidDepositPrepayCombinationException extends DomainException {
  constructor(
    reason: 'LIMIT_40' | 'LIMIT_50' | 'LIMIT_SUM_50',
    details: { prepaidRate: number; depositRate: number },
  );
  // LIMIT_40   : prepaidRate > 40
  // LIMIT_50   : depositRate > 50
  // LIMIT_SUM_50: prepaidRate + depositRate > 50
}

export class UnsupportedVehicleException extends DomainException { ... }
export class InterestRateNotFoundException extends DomainException { ... }
export class ResidualRateNotFoundException extends DomainException { ... }
export class InsuranceRateNotFoundException extends DomainException { ... }
export class MaintenanceRateNotFoundException extends DomainException { ... }
```

---

## 5. 검증 기준 (Acceptance Criteria)

### 5.1 API 검증 (F2에 직접 해당 — F1은 Domain Service 수준)

| # | 서비스 | 입력 | 기대 결과 |
|---|--------|------|-----------|
| 1 | `RentalQuoteCalculatorDomainService.calculate` | (customerInput, skuPreset, modelPreset, referenceData) | `RentalQuote` 스냅샷 — 모든 결제내역 분해 필드 KRW 정수 반환, xlsm과 1원 일치 |
| 2 | `ResidualValueDomainService.calculate` | (vehicle, contractPeriod, annualMileage) | `ResidualValue` VO — xlsm `CC9`와 1원 일치 |
| 3 | `DepositPrepaidDomainService.calculate` | (vehiclePrice, prepaidRate, depositRate, contractPeriod) | `{ prepaidAmount, depositAmount, initialBurden, prepaidDeduction }` |
| 4 | `pmt(rate, nper, pv, fv, 0)` | 엑셀과 동일 파라미터 15건 | 엑셀 반환값과 1e-6 이내 일치 |

### 5.2 UI 검증

F1은 Domain Layer이므로 UI 검증 없음. F4에서 확인.

### 5.3 엣지케이스

| # | 상황 | 기대 동작 |
|---|------|-----------|
| 1 | `prepaidRate = 50` | `InvalidDepositPrepayCombinationException('LIMIT_40')` — 40% 상한 위반 |
| 2 | `depositRate = 60` | `InvalidDepositPrepayCombinationException('LIMIT_50')` — 50% 상한 위반 |
| 3 | `prepaidRate = 30, depositRate = 30` | `InvalidDepositPrepayCombinationException('LIMIT_SUM_50')` — 합 60 > 50 |
| 4 | `prepaidRate = 0, depositRate = 0` | 정상 계산, `initialBurden = 0`, `prepaidDeduction = 0` |
| 5 | `prepaidRate = 30, depositRate = 20` | 정상 계산, 합 50 = 경계값 PASS |
| 6 | 알 수 없는 SKU (`vehicleSlug` 매칭 실패) | `UnsupportedVehicleException` |
| 7 | EV 차종, 프로모션 테이블에 EV3/EV4 특판 없음 | `PromotionNotFoundException` (해당 분기에만) or 기본값 사용 — Do 단계에서 확정 |
| 8 | 배기량 1600 경계 | `ROUNDUP((1600 × 18) / 12, -2) = 2400` |
| 9 | 배기량 1601 | `ROUNDUP((1601 × 19) / 12, -2) = 2600` |
| 10 | 계약기간 24, 주행거리 30000 조합이 잔가율 테이블에 없음 | `ResidualRateNotFoundException` |
| 11 | PMT(rate=0, nper=36, pv=-40690000, fv=29297000) | `-(pv + fv) / nper` = `-(-40690000 + 29297000) / 36 ≈ 316_472.22` |
| 12 | Money 음수 생성 | `IllegalMoneyException` |

### 5.4 런타임 연동 검증

F1은 순수 도메인 — 외부 서비스 없음. 단, 시더는 PostgreSQL·TypeORM 마이그레이션 환경을 요구한다.

| # | 서비스 | 검증 항목 | 확인 방법 |
|---|--------|-----------|----------|
| 1 | PostgreSQL + TypeORM | 7개 reference 테이블이 마이그레이션으로 생성 | `pnpm --filter @kgm-rental/backend-libs migration:run` 성공 + `\dt` 확인 |
| 2 | 시더 | xlsm 추출 데이터가 7개 테이블에 Upsert | `pnpm --filter @kgm-rental/backend-libs seed:reference-data` 재실행 시 오류 없음(멱등) |

### 5.5 golden CSV 회귀 (F1의 핵심)

- 위치: `apps/backend/libs/src/modules/rental-quote/domain/domain-services/test/__fixtures__/golden-quotes.csv`
- 최소 **25건** 이상.
- 컬럼: `case_id, category, skuId, vehicleSlug, contractPeriod, annualMileage, prepaidRate, depositRate, expected_standardRent, expected_discountTotal, expected_prepaidDeduction, expected_finalMonthlyRent, expected_residualValue, expected_prepaidAmount, expected_depositAmount, expected_initialBurden, expected_supplyPrice, expected_vat, xlsm_source_version`.
- 카테고리 (체크리스트):
  - [ ] 기본: 토레스 블랙엣지 36M/20k/0/0
  - [ ] 베스트: 액티언HEV 하이브리드 S8 36M/20k/**30/0** → 최종 월 189,140원 (xlsm 캐시 실측값). 0/0 상태는 528,220원으로 검증 별도.
  - [ ] 계약기간 4종 각 1건(24/36/48/60)
  - [ ] 주행거리 5종 각 1건(10k/15k/20k/25k/30k)
  - [ ] 선납률 4종 각 1건(0/10/20/30)
  - [ ] 보증률 4종 각 1건(0/10/20/30)
  - [ ] 선납+보증 경계 (20+30=50, 30+20=50)
  - [ ] 선납+보증 초과(30+30=60) → Exception
  - [ ] EV 차종(무쏘 EV) — 특판 150만원 차감 적용
  - [ ] HEV 차종(액티언 HEV) — 개소세 감면
  - [ ] 동일 모델 내 트림별 가격 편차 2건 (예: 토레스 블랙엣지 vs T7)
  - [ ] 동일 모델·트림 내 옵션 유무 2건 (예: 파노라마 선루프 포함/미포함)

> **SKU 고정 프리셋 값 검증 주의**: 지역/정비/만기/월동장비는 고객 입력이 아니라 SKU가 기본값 1종만 보유하는 프리셋이다. 따라서 golden CSV의 `expected_*`를 뽑을 때, xlsm 입력란에도 **해당 SKU의 고정 프리셋 값**(기본 지점·기본 정비 패키지·기본 만기 옵션·월동장비 미포함 등)을 정확히 넣어야 한다. 프리셋 값이 틀리면 도메인 계산이 맞아도 xlsm 비교가 1원 단위로 어긋난다.

golden CSV의 `expected_*` 값은 **xlsm에 실제 입력값을 넣어 수작업으로 확보**(Design 후 Do 단계 0단계 작업).

---

## 6. xlsm 참조 데이터 추출 작업 (Do 0단계)

본 Feature 구현 착수 전에 수행해야 하는 데이터 추출.

| 테이블 | 추출 소스 (xlsm 셀/시트) | 비고 |
|--------|--------------------------|------|
| Vehicle | vehicle-groups.xlsx 전체 + 2 차량정보 시트의 배기량·차종 | 차량가 X8 = vehicle-groups.H, 취득원가 H21 = sheet2 H21 또는 파생 |
| InterestRate | `sheet8!BR32` 을 차종별로 추적 → 차종×계약기간 매트릭스 | BR32 의 상위 lookup 체인 추가 조사 필요 |
| ResidualRate | `sheet2!N41` = `INDEX('2 차량정보'!$O$8:$AP$145, ...)` → 차종×기간×주행거리 행렬 | 2 차량정보 시트 O~AP 열 |
| DeliveryRate | `sheet4 탁송` 시트 | 지역별 1차·2차 탁송료 |
| MaintenancePackageRate | `sheet5 4 정비` + `1 견적조건 D127/N19/N29/N33/N37/N39` | 패키지 × 차종 × 기간 × 주행거리 × 연령 |
| InsuranceRate | `sheet8!EG30` 의 체인 추적 | 연령·주행거리·커버·차종 |
| Promotion | `EV3/EV4 특판 150만원`(sheet8 BC2), `토레스/레이/캐스퍼/팰리세이드 Select 프로모션`(sheet8 EG10) | 조건부 분기 정리 |

---

*이 문서는 `/harness:design quote-engine` 단계의 산출물입니다.*
*다음 단계: `/harness:do`*
