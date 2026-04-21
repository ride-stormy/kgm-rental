# Feature Design: quote-api

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | quote-api |
| Epic | kgm-rental-platform |
| 순번 | 2 / 5 |
| 작성일 | 2026-04-20 |
| 프로필 | blank (KGM 스택: NestJS 10 + Next.js 15 + TypeORM + PostgreSQL, DDD 4-Layer) |
| 선택 옵션 | Option B — Clean Architecture (완전 분리) |
| 의존성 | F1 `quote-engine` (완료, archived) / F3 `product-catalog` (Port-Adapter로 분리) |

---

## 1. 개요

F1에서 구현한 `@kgm-rental/backend-libs`의 `RentalQuoteCalculatorDomainService`를 HTTP API로 노출하는 NestJS 앱(`apps/backend/b2c`)을 신규 부트스트랩한다. F3의 Product 모듈이 아직 없어도 독립 가동 가능하도록 `ProductSkuProvider`를 **Port-Adapter 패턴**으로 분리하고, F2에서는 `reference_vehicle` 테이블을 직접 조회하는 임시 어댑터를 제공한다. F3 도입 시 어댑터만 교체한다.

## 2. 선택 옵션 근거

- **Option B 선택 이유**: F3/F4가 순차적으로 이 API를 확장할 예정이므로 모듈 경계 명확성이 중요. Port(인터페이스)를 Application이 소유하면 F3에서 Product Adapter를 갈아끼우는 것이 **b2c/app.module.ts 1줄 변경**으로 가능.
- **Option A 탈락 이유**: reference-data Repository가 rental-quote 모듈 내부에 있어서 F3 도입 시 마이그레이션 발생.
- **Option C 탈락 이유**: ExceptionFilter와 명시적 throw 혼용 → 에러 처리 일관성 저하.

---

## 3. 디렉토리 구조

```
apps/backend/b2c/                                       ← 신규 앱
├── nest-cli.json
├── package.json                                         (name: "@kgm-rental/backend-b2c")
├── tsconfig.json, tsconfig.app.json
├── .env.example                                         (DATABASE_URL, PORT)
├── src/
│   ├── main.ts                                          (NestFactory.create + listen 3000)
│   ├── app.module.ts                                    (TypeOrmModule.forRoot + 2개 기능 모듈)
│   ├── config/
│   │   └── typeorm.config.ts                            (DataSource factory, libs 엔티티 등록)
│   ├── filters/
│   │   ├── domain-exception.filter.ts                   (6개 DomainException → HTTP 400)
│   │   └── application-exception.filter.ts              (404 매핑)
│   ├── pipes/
│   │   └── zod-validation.pipe.ts                       (createZodValidationPipe(schema))
│   └── modules/
│       ├── rental-quote/
│       │   ├── rental-quote.module.ts
│       │   ├── presentation/
│       │   │   ├── rental-quote.controller.ts
│       │   │   ├── dtos/
│       │   │   │   ├── calculate.rental-quote.dto.ts
│       │   │   │   ├── residual-value.rental-quote.dto.ts
│       │   │   │   └── list-vehicles.rental-quote.dto.ts
│       │   │   └── test/
│       │   │       └── rental-quote.controller.spec.ts
│       │   └── application/
│       │       ├── services/
│       │       │   ├── calculate-quote.service.ts
│       │       │   ├── get-residual-value.service.ts
│       │       │   ├── list-vehicles.service.ts
│       │       │   ├── interfaces/
│       │       │   │   ├── calculate-quote.service.interface.ts
│       │       │   │   ├── get-residual-value.service.interface.ts
│       │       │   │   └── list-vehicles.service.interface.ts
│       │       │   └── test/
│       │       │       ├── calculate-quote.service.spec.ts
│       │       │       ├── get-residual-value.service.spec.ts
│       │       │       └── list-vehicles.service.spec.ts
│       │       ├── ports/
│       │       │   ├── reference-data-reader.port.ts    (Symbol + interface)
│       │       │   └── product-sku-provider.port.ts     (Symbol + interface)
│       │       └── exceptions/
│       │           ├── vehicle-not-found.application-exception.ts
│       │           └── reference-data-missing.application-exception.ts
│       └── reference-data/
│           ├── reference-data.module.ts                 (Provider 등록: 2개 Port 구현체)
│           ├── domain/
│           │   └── repositories/
│           │       ├── reference-data.repository.ts     (Symbol + interface)
│           │       └── interfaces/
│           │           └── reference-data.repository.interface.ts
│           └── infrastructure/
│               ├── repositories/
│               │   ├── reference-data.typeorm.repository.ts
│               │   └── test/
│               │       └── reference-data.typeorm.repository.spec.ts
│               └── adapters/
│                   ├── reference-data-reader.adapter.ts     (ReferenceDataReaderPort 구현)
│                   └── reference-vehicle.sku-provider.adapter.ts (ProductSkuProviderPort 임시 구현)
├── test/
│   ├── quote-api.e2e-spec.ts                            (Supertest + pg-mem, 3~5 Golden case)
│   └── jest-e2e.json

packages/api-contracts/                                 ← 신규 공유 패키지
├── package.json                                         (name: "@kgm-rental/api-contracts")
├── tsconfig.json
└── src/
    ├── index.ts                                         (barrel export)
    └── rental-quote/
        ├── calculate-quote.schema.ts                    (Zod: Request/Response + types)
        ├── residual-value.schema.ts
        ├── list-vehicles.schema.ts
        └── common.schema.ts                             (EnvelopeSchema<T>)
```

---

## 4. API 계약 (Zod 단일 정본)

### 4.1 공통 응답 Envelope

```typescript
// packages/api-contracts/src/rental-quote/common.schema.ts
export const ApiErrorSchema = z.object({
  code: z.string(),       // "LIMIT_40" | "VEHICLE_NOT_FOUND" | ...
  message: z.string(),
  details: z.unknown().optional(),
});

export const envelope = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    success: z.boolean(),
    data: data.nullable(),
    error: ApiErrorSchema.nullable(),
    meta: z.record(z.unknown()).optional(),
  });
```

### 4.2 POST /api/quotes/calculate

**Request**
```typescript
export const CalculateQuoteRequestSchema = z.object({
  skuId: z.string().min(1),
  contractPeriod: z.union([z.literal(24), z.literal(36), z.literal(48), z.literal(60)]),
  annualMileage: z.union([
    z.literal(10000), z.literal(15000), z.literal(20000),
    z.literal(25000), z.literal(30000),
  ]),
  prepaidRate: z.union([z.literal(0), z.literal(10), z.literal(20), z.literal(30)]),
  depositRate: z.union([z.literal(0), z.literal(10), z.literal(20), z.literal(30)]),
});
```

**Response (success)**
```typescript
export const QuoteBreakdownSchema = z.object({
  standardRent:      z.number().int(),   // 표준 렌탈료 (공급가 + 부가세)
  discountTotal:     z.number().int(),   // 할인합계
  prepaidDeduction:  z.number().int(),   // 월 선납금 차감 (음수)
  finalMonthlyRent:  z.number().int(),   // 최종 렌탈료
  residualValue:     z.number().int(),   // 잔가 (인수가)
  prepaidAmount:     z.number().int(),   // 환산 선납금
  depositAmount:     z.number().int(),   // 환산 보증금
  initialBurden:     z.number().int(),   // 초기납입금액
  supplyPrice:       z.number().int(),   // 공급가
  vat:               z.number().int(),   // 부가세
});

export const CalculateQuoteResponseSchema = envelope(QuoteBreakdownSchema);
```

### 4.3 GET /api/quotes/residual-value

**Query**
```typescript
export const ResidualValueQuerySchema = z.object({
  skuId: z.string().min(1),
  contractPeriod: z.coerce.number().pipe(
    z.union([z.literal(24), z.literal(36), z.literal(48), z.literal(60)]),
  ),
  annualMileage: z.coerce.number().pipe(
    z.union([z.literal(10000), z.literal(15000), z.literal(20000), z.literal(25000), z.literal(30000)]),
  ),
});
```

**Response**
```typescript
export const ResidualValueResponseSchema = envelope(
  z.object({ residualValue: z.number().int() }),
);
```

### 4.4 GET /api/vehicles

**Query**
```typescript
export const ListVehiclesQuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(50).default(20),
  skip: z.coerce.number().int().min(0).default(0),
});
```

**Response**
```typescript
export const VehicleSummarySchema = z.object({
  slug: z.string(),
  name: z.string(),
  price: z.number().int(),
  isEv: z.boolean(),
  isHev: z.boolean(),
});

export const ListVehiclesResponseSchema = envelope(z.array(VehicleSummarySchema));
```

---

## 5. 에러 코드 체계

| HTTP | code | 발생 위치 | 비고 |
|------|------|----------|------|
| 400 | `LIMIT_40` | `DepositPrepaidDomainService` | prepaidRate > 40 |
| 400 | `LIMIT_50` | 동상 | depositRate > 50 |
| 400 | `SUM_50` | 동상 | prepaidRate + depositRate > 50 |
| 400 | `INVALID_CONTRACT_PERIOD` | `CustomerInput VO` | 24/36/48/60 외 |
| 400 | `INVALID_ANNUAL_MILEAGE` | 동상 | 10k~30k 외 |
| 400 | `INVALID_VEHICLE_TYPE` | `VehicleType VO` | EV/HEV/ICE 외 |
| 400 | `ZOD_VALIDATION` | `ZodValidationPipe` | Zod 파싱 실패 |
| 404 | `VEHICLE_NOT_FOUND` | `VehicleNotFoundApplicationException` | skuId로 SKU 조회 실패 |
| 404 | `REFERENCE_DATA_MISSING` | `ReferenceDataMissingApplicationException` | 기준값 테이블 부재 |
| 500 | `INTERNAL_ERROR` | 전역 fallback filter | 기타 예상외 오류 |

### 5.1 ExceptionFilter 매핑 전략

```typescript
// filters/domain-exception.filter.ts
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof RentalQuoteDomainException) {
      const { code, status } = mapDomainException(exception);  // 400 또는 422
      return res.status(status).json({
        success: false, data: null,
        error: { code, message: exception.message },
      });
    }
    if (exception instanceof ApplicationException) {
      return res.status(404).json({
        success: false, data: null,
        error: { code: exception.code, message: exception.message },
      });
    }
    // 기타: 500 fallback
    return res.status(500).json({
      success: false, data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error' },
    });
  }
}
```

`libs`의 6개 `RentalQuoteDomainException`에 **각각 `code` 필드를 이미 보유**(F1 구현). 필터는 그 code를 그대로 사용.

---

## 6. Ports (Application 소유)

### 6.1 ReferenceDataReaderPort

```typescript
// modules/rental-quote/application/ports/reference-data-reader.port.ts
import { ReferenceDataset } from '@kgm-rental/backend-libs/modules/reference-data/domain/domain-entities/reference-data.types.js';

export const REFERENCE_DATA_READER = Symbol('REFERENCE_DATA_READER');

export interface ReferenceDataReaderPort {
  loadDataset(input: { vehicleSlug: string }): Promise<{ dataset: ReferenceDataset }>;
}
```

### 6.2 ProductSkuProviderPort

```typescript
export const PRODUCT_SKU_PROVIDER = Symbol('PRODUCT_SKU_PROVIDER');

export interface ProductSkuProviderPort {
  findSku(input: { skuId: string }): Promise<{
    skuId: string;
    vehicleSlug: string;
    price: number;
  } | null>;

  listVehicles(input: { take: number; skip: number }): Promise<{
    items: Array<{ slug: string; name: string; price: number; isEv: boolean; isHev: boolean }>;
    total: number;
  }>;
}
```

**구현 전략 (F2)**: `reference_vehicle` 테이블을 바로 조회. `skuId`는 일시적으로 `vehicle.slug`와 동일하게 취급 (F3에서 SKU 엔티티 도입 시 매핑 레이어 추가).

**F3 교체 지점**: `reference-data.module.ts`의 `PRODUCT_SKU_PROVIDER` provider에서 `ReferenceVehicleSkuProviderAdapter` → `ProductModuleSkuProviderAdapter`로 1줄 교체.

---

## 7. 유스케이스 흐름

### 7.1 CalculateQuoteService

```typescript
async execute(input: CalculateQuoteServiceInput): Promise<CalculateQuoteServiceOutput> {
  // 1) SKU 조회 (Port)
  const sku = await this.skuProvider.findSku({ skuId: input.skuId });
  if (!sku) throw new VehicleNotFoundApplicationException(input.skuId);

  // 2) ReferenceDataset 로드 (Port)
  const { dataset } = await this.referenceReader.loadDataset({ vehicleSlug: sku.vehicleSlug });
  if (!dataset) throw new ReferenceDataMissingApplicationException(sku.vehicleSlug);

  // 3) Calculator 호출 (libs)
  const calculator = new RentalQuoteCalculatorDomainService(dataset);
  const quote = calculator.calculate({
    skuId: sku.skuId,
    vehicleSlug: sku.vehicleSlug,
    vehiclePrice: sku.price,
    contractPeriodMonths: input.contractPeriod,
    annualMileageKm: input.annualMileage,
    prepaidRatePercent: input.prepaidRate,
    depositRatePercent: input.depositRate,
    preset: dataset.skuPresetDefault,
  });

  // 4) breakdown 반환
  return { breakdown: quote.breakdown };
}
```

### 7.2 GetResidualValueService

`ResidualValueDomainService` 단독 호출 (Calculator 전체 X). 빠른 응답.

### 7.3 ListVehiclesService

`ProductSkuProviderPort.listVehicles()` 단순 프록시.

---

## 8. DB 초기화

- `main.ts` 기동 시 `DataSource.runMigrations()` + `seedReferenceData(ds)` 호출 (dev only).
- Production은 별도 migration CLI 사용 예정 (F2 범위 밖, `apps/backend/batch` 신설 시 이동).

---

## 9. Acceptance Criteria (Implementation Level)

| # | AC | 검증 방법 |
|---|-----|----------|
| 1 | POST /api/quotes/calculate가 5개 필드를 Zod로 검증, 잘못된 값은 400 + `code: ZOD_VALIDATION` + details | Supertest: 음수 contractPeriod 전송 → 400 assert |
| 2 | 응답에 10개 breakdown 필드 포함, xlsm 실측 case (`skuId=actyon-hev`, 36/15000/30/0) **189,140원 1원 일치** | e2e 1 케이스 hardcoded assert |
| 3 | Limit 3규칙 각각 400 + 에러코드(`LIMIT_40`/`LIMIT_50`/`SUM_50`) | Supertest 3 case |
| 4 | GET /api/quotes/residual-value가 `ResidualValueDomainService` 단독 호출, p95 응답 < 50ms | `console.time` bench |
| 5 | SKU 미존재 404 + `VEHICLE_NOT_FOUND`, 기준값 미존재 404 + `REFERENCE_DATA_MISSING` | Supertest 2 case |
| 6 | **Golden CSV 3~5 case**(xlsm-1원일치 + regression) e2e로 호출, 각 필드 1원 일치 | e2e 배열 iterate |
| 7 | p95 응답 시간 200ms 이하 (로컬) | autocannon 또는 ab, 100 req × 5 concurrency |
| 8 | DDD 의존 방향 준수 (Presentation→Application→Domain←Infrastructure, Port 인터페이스는 Application 소유) | ESLint `import/no-restricted-paths` 또는 수동 검토 |

---

## 10. 구현 순서 (5 Stage)

### Stage 1: 부트스트랩 (파일 ~8개)
1. 루트 `package.json`에 `@nestjs/cli`, `@nestjs/core`, `@nestjs/common`, `@nestjs/config`, `@nestjs/typeorm`, `supertest`, `jest`, `zod` devDep 추가
2. `apps/backend/b2c/package.json` (workspace:* 의존 선언)
3. `apps/backend/b2c/nest-cli.json`, `tsconfig.app.json`, `tsconfig.json`
4. `src/main.ts`, `src/app.module.ts`, `src/config/typeorm.config.ts`
5. `.env.example`
6. Smoke: `pnpm --filter @kgm-rental/backend-b2c nest start --watch` 기동 확인 (200 OK on GET /)

### Stage 2: api-contracts 패키지 (파일 6개)
7. `packages/api-contracts/package.json`, `tsconfig.json`
8. `src/index.ts` + `rental-quote/calculate-quote.schema.ts` + `residual-value.schema.ts` + `list-vehicles.schema.ts` + `common.schema.ts`
9. `apps/backend/b2c/package.json`에 `@kgm-rental/api-contracts` 의존 추가

### Stage 3: reference-data 모듈 (파일 ~8개)
10. `domain/repositories/reference-data.repository.ts` + `interfaces/`
11. `infrastructure/repositories/reference-data.typeorm.repository.ts`
12. `infrastructure/adapters/reference-data-reader.adapter.ts` (ReferenceDataReaderPort 구현)
13. `infrastructure/adapters/reference-vehicle.sku-provider.adapter.ts` (ProductSkuProviderPort 구현)
14. `reference-data.module.ts` (Provider 3개 등록, exports: 2개 Port Symbol)

### Stage 4: rental-quote 모듈 (파일 ~14개)
15. `application/ports/*.port.ts` (2개)
16. `application/exceptions/*.application-exception.ts` (2개)
17. `application/services/*.service.ts` + `interfaces/` (3 서비스 × 2 = 6)
18. `presentation/dtos/*.dto.ts` (3개 Zod DTO wrapper)
19. `presentation/rental-quote.controller.ts`
20. `pipes/zod-validation.pipe.ts`, `filters/domain-exception.filter.ts`, `filters/application-exception.filter.ts`
21. `rental-quote.module.ts`

### Stage 5: 통합 테스트 (파일 ~5개)
22. `test/quote-api.e2e-spec.ts` — pg-mem 기반 Supertest, Golden 3~5 case
23. Service unit spec 3개, Controller spec 1개
24. `test/jest-e2e.json`
25. 루트 `turbo.json` pipeline에 b2c 등록

---

## 11. 리스크 & 대응

| 리스크 | 영향 | 대응 |
|--------|-----|------|
| NestJS Pipe + Zod 통합 보일러플레이트 | Controller 가독성 | `createZodValidationPipe(schema)` 단일 헬퍼로 캡슐화, `@Body(new ZodValidationPipe(CalculateQuoteRequestSchema))` 사용 |
| pg-mem e2e 부팅 시 DataSource 교체 | 초기 설정 복잡 | F1의 `buildInMemoryDataSource()` 재사용 + `Test.createTestingModule().overrideProvider(DataSource)` |
| `.js` 확장자 import가 `nest build`로 처리되나 | 빌드 실패 | `tsconfig.app.json`에 `moduleResolution: "nodenext"` + F1 libs도 동일 설정 확인 |
| F3 도입 시 adapter 교체 실수 | 런타임 오류 | Provider Symbol 기반 주입 유지 → F3에서 `ProductModuleSkuProviderAdapter` 등록 + 기존 어댑터 제거 1줄 |
| 테스트 DB seed 비용 | e2e 느려짐 | 모든 e2e 케이스가 같은 in-memory DS를 공유 (`beforeAll` 1회 seed) |
| Controller가 QuoteBreakdown을 직접 JSON 응답으로 노출 | 스키마 드리프트 | Controller 반환 전 `QuoteBreakdownSchema.parse(breakdown)` 로 런타임 검증 |
| 프로필이 blank → ESLint/lint commands 누락 | Check 자동 검증 SKIP | `commands.lint` 사용자 설정 권장. 본 Feature 범위 밖 |

---

## 12. 테스트 전략

| 레벨 | 범위 | 도구 |
|------|-----|------|
| Unit | Service (3) + Controller (1) + Filter (2) + Pipe (1) | Jest + NestJS TestingModule mock |
| Integration | ReferenceDataTypeormRepository + pg-mem | Jest + pg-mem |
| E2E | 3개 엔드포인트 × 정상/오류 + Golden 3~5 case | Supertest + pg-mem |
| Bench | p95 latency | autocannon (로컬, 수동) |

**커버리지 목표**: Statements ≥85% (F1 수준 유지, `@vitest/coverage-v8` 아닌 Jest coverage 사용).

---

## 13. 기술 결정사항

1. **Validation**: Zod (Epic Plan 결정). `class-validator` 미사용 — Epic의 "Zod 프론트·백 공통" 방침과 일치.
2. **API Contract 위치**: `packages/api-contracts` — 프론트엔드(F4)와 백엔드가 공유.
3. **Port-Adapter**: F3 의존을 Port로 분리 → F2 독립 가동 + F3 도입 시 어댑터 1개 교체.
4. **Migration 실행**: 개발 환경은 `main.ts`의 `runMigrations()` + `seedReferenceData()`. 운영은 F2 범위 밖.
5. **Exception Filter 전략**: Domain/Application Exception → 전역 Filter로 선언적 매핑. Controller/Service는 throw만 담당.
6. **envelope 응답**: `{ success, data, error, meta? }` — 모든 엔드포인트 동일.
7. **libs import alias**: `@kgm-rental/backend-libs/...` (F1과 동일, `.js` 확장자 필수).

---

## 14. 다음 단계

Design 승인 후 → `/harness:do quote-api`

Stage 1 (부트스트랩)부터 순차 구현, Stage 5 (e2e + Golden 회귀)까지 완료 후 Check.

---

*이 문서는 `/harness:design quote-api` 단계의 산출물입니다.*
