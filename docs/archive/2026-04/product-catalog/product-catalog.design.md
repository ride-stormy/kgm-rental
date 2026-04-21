# Feature Design: product-catalog

| 항목 | 내용 |
|------|------|
| Epic | kgm-rental-platform |
| Feature | F3 / 5 |
| 선택 옵션 | **Option B — Clean Architecture (완전 DDD 4-Layer)** |
| 의존성 | 선행 없음 · 후행 F4/F5 + F2 기술부채 청산 |
| 작성일 | 2026-04-21 |

---

## 1. 개요

F3는 차량 카탈로그(ProductModel + VehicleSku 2계층)의 데이터·API·시더·프론트 첫 화면을 담당한다. 동시에 F2(rental-quote)가 임시로 남긴 `ReferenceVehicleSkuProviderAdapter`와 하드코딩된 `DEFAULT_PRESET`을 청산하여, 이후 모든 견적 계산이 실제 SKU + 모델 프리셋을 참조하도록 한다. F4(설정 UI)·F5(실시간 재고)는 F3의 API와 Port 계약에 의존한다.

**설계 3원칙**
1. **DDD 4-Layer 엄격 준수** — F1·F2가 세운 레이어 구조를 그대로 따른다.
2. **Port-Adapter로 외부 경계 고정** — F2는 `ProductSkuProviderPort`, F5는 `StockOverridePort`로 주입된다.
3. **api-contracts 단일 진실원천** — Zod 스키마가 타입·검증·DTO를 모두 유도한다.

---

## 2. 디렉토리 구조

### 2.1 공유 라이브러리 (`apps/backend/libs/src/`)

```
domain/
├─ entities/
│  ├─ product-model.entity.ts
│  └─ vehicle-sku.entity.ts
├─ value-objects/
│  ├─ slug.vo.ts
│  └─ product-preset.vo.ts
└─ services/
   └─ trim-parser.service.ts

infrastructure/
├─ typeorm/
│  ├─ product-model.orm-entity.ts
│  ├─ product-model.mapper.ts
│  ├─ vehicle-sku.orm-entity.ts
│  └─ vehicle-sku.mapper.ts
├─ xlsx/
│  └─ vehicle-groups.parser.ts
├─ color-codes.map.ts
└─ seeders/
   └─ products.seeder.ts
```

### 2.2 백엔드 product 모듈 (`apps/backend/b2c/src/modules/product/`)

```
presentation/
├─ product.controller.ts
└─ dto/
   ├─ list-products.request.dto.ts
   ├─ list-products.response.dto.ts
   ├─ product-detail.response.dto.ts
   └─ sku-detail.response.dto.ts

application/
├─ use-cases/
│  ├─ list-products.service.ts
│  ├─ get-product-detail.service.ts
│  └─ get-sku-detail.service.ts
└─ exceptions/
   └─ product-not-found.exception.ts

domain/
├─ repositories/
│  └─ product-model.repository.interface.ts
└─ ports/
   └─ stock-override.port.ts

infrastructure/
├─ repositories/
│  └─ product-model.repository.ts
└─ adapters/
   ├─ product-sku-provider.adapter.ts        # F2에 주입 (rental-quote의 Port 구현체)
   └─ null-stock-override.adapter.ts         # F5 전까지 passthrough

product.module.ts
```

### 2.3 API Contracts (`packages/api-contracts/src/product/`)

```
schemas.ts        # Zod: ListProductsResponse, ProductDetailResponse, SkuDetailResponse
types.ts          # z.infer<typeof ...> 타입 export
index.ts
```

`packages/api-contracts/package.json`의 `exports`에 `./product` 서브패스 추가.

### 2.4 프론트엔드 (`apps/b2c/` — 신규, Next.js 14 App Router)

```
app/
├─ layout.tsx
├─ page.tsx                          # 랜딩 placeholder (F5가 확장)
├─ products/
│  ├─ page.tsx                       # RSC, 카드 그리드
│  └─ [modelSlug]/
│     ├─ page.tsx                    # RSC, SKU 슬라이더 + 결제 패널
│     └─ not-found.tsx
components/
├─ product/
│  ├─ ProductCard.tsx
│  ├─ ColorSwatch.tsx
│  └─ SkuSlider.tsx                  # Stage A 최소, F4 Stage B 정식화
└─ ui/                               # shadcn/ui 생성물
lib/
├─ api-client.ts                     # fetch 래퍼 + Zod 파싱
└─ forbidden-expressions.ts          # 금지 표현 가드
package.json
tsconfig.json
next.config.ts
```

---

## 3. 도메인 모델

### 3.1 `ProductModel`

```typescript
// apps/backend/libs/src/domain/entities/product-model.entity.ts
export class ProductModel {
  readonly id: string;                   // ULID
  readonly slug: string;                  // kebab ("2025-torres")
  readonly name: string;                  // "2025 토레스"
  readonly brandName: string;             // "KGM"
  readonly heroImage: string;             // URL or path
  readonly description: string;
  readonly vehicleTypeDefault: VehicleTypeEnum;
  readonly fixedPreset: ProductPreset;    // VO
  readonly minMonthlyRent: number;        // SKU 최저가 기반 파생
  readonly promotionTags: string[];
}
```

### 3.2 `VehicleSku`

```typescript
// apps/backend/libs/src/domain/entities/vehicle-sku.entity.ts
export class VehicleSku {
  readonly id: string;                    // `${specCode}-${colorExteriorCode}` 파생 키
  readonly productModelId: string;
  readonly specCode: string;              // "ND0J5C"
  readonly modelCode: string;             // "MW5"
  readonly trim: string;                  // "블랙엣지"
  readonly vehicleType: VehicleTypeEnum;  // Diesel|HEV|EV (trim에서 최종)
  readonly displacement: number;          // cc
  readonly colorExteriorCode: string;     // "WAA"
  readonly colorExteriorName: string;     // "녹턴 그레이 메탈릭"
  readonly colorInteriorCode: string | null;
  readonly options: string[];
  readonly price: number;
  readonly stockBucket: number;           // 초기 시드; F5가 런타임 덮어씀
  readonly productionPeriods: string[];
}
```

### 3.3 `ProductPreset` (Value Object, F2 `DEFAULT_PRESET` 대체)

```typescript
// apps/backend/libs/src/domain/value-objects/product-preset.vo.ts
export class ProductPreset {
  readonly maintenancePackage: MaintenancePackageEnum;
  readonly maturityOption: MaturityOptionEnum;
  readonly winterOption: WinterOptionEnum;
  readonly region: RegionEnum;
  static create(params): ProductPreset { /* validation */ }
}
```

### 3.4 `TrimParserService` (Domain Service)

```typescript
// apps/backend/libs/src/domain/services/trim-parser.service.ts
interface TrimParseResult {
  vehicleType: VehicleTypeEnum;
  displacement: number;
  confidence: 'high' | 'low';  // low면 시더 경고 로그
}
export class TrimParserService {
  parse(input: { trim: string; modelName: string }): TrimParseResult;
}
```

**규칙 (우선순위)**
1. "EV" 포함 → `VehicleType.EV`, displacement=0
2. "하이브리드", "HEV" 포함 → `HEV`
3. "L 디젤", "디젤" 포함 → `Diesel`
4. 그 외 → `ICE`, confidence='low' + 경고

displacement는 trim 문자열에 숫자 패턴이 있으면 추출, 없으면 모델별 기본값(`vehicle-metadata.ts` 보조 매핑).

---

## 4. API 계약 (Zod)

### 4.1 `GET /products`

```typescript
// packages/api-contracts/src/product/schemas.ts
export const ProductCardSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  brandName: z.string(),
  heroImage: z.string(),
  vehicleTypeDefault: VehicleTypeSchema,
  minMonthlyRent: z.number().int().positive(),
  colorSwatch: z.array(z.object({
    code: z.string(),
    name: z.string(),
    hex: z.string().nullable(),
  })),
  promotionTags: z.array(z.string()),
});

export const ListProductsResponseSchema = ApiEnvelope(
  z.object({ items: z.array(ProductCardSchema) })
);
```

### 4.2 `GET /products/:modelSlug`

```typescript
export const VehicleSkuSchema = z.object({ /* 3.2 전체 필드 */ });
export const ProductDetailSchema = ProductCardSchema.extend({
  description: z.string(),
  fixedPreset: ProductPresetSchema,
  skus: z.array(VehicleSkuSchema),
});
export const ProductDetailResponseSchema = ApiEnvelope(ProductDetailSchema);
```

### 4.3 `GET /products/:modelSlug/skus/:skuId`

```typescript
export const SkuDetailResponseSchema = ApiEnvelope(VehicleSkuSchema);
```

### 4.4 에러 응답

F2와 동일한 envelope: `{ success: false, error: string }`. 400/404 매핑은 기존 NestJS 필터 체인 재사용 (`HttpExceptionFilter` → `ApplicationExceptionFilter` → `DomainExceptionFilter` 순서).

---

## 5. 데이터 흐름

### 5.1 시딩 (1회성, 재실행 안전)

```
pre-docs/vehicle-groups-20260420.xlsx
  │
  ▼
xlsx/vehicle-groups.parser.ts
  ├─ 순수 함수: parseVehicleGroups(buffer) → RawRow[]
  └─ Zod 스키마로 row 검증 (누락 필드 에러 수집)
  │
  ▼
seeders/products.seeder.ts
  ├─ 각 RawRow에 대해
  │   ├─ TrimParserService.parse(trim, modelName)
  │   ├─ colorCodes.get(colorExteriorCode) — miss 시 경고 수집
  │   └─ VehicleSku 엔티티 생성 (id = `${specCode}-${colorExteriorCode}`)
  ├─ modelName 기준 그룹핑 → 6개 ProductModel 초안
  ├─ product-config.ts에서 slug/heroImage/description/fixedPreset 머지
  ├─ minMonthlyRent = min(group.skus.map(s => quoteEngine.estimate(s, preset)))
  │   * quoteEngine은 F2 import (순환 방지: libs 의존만)
  ├─ Mapper: Domain → ORM Entity
  └─ repo.upsert(by id) — 재실행 안전
  │
  ▼
요약 리포트 출력:
  - SKU 총 166건 중 N건 시드, M건 스킵/경고
  - 미매핑 color code 목록
  - trim-parser confidence='low' 행 목록
```

### 5.2 API 조회

```
GET /products
  └─ ProductController
        └─ ListProductsService.execute()
              ├─ ProductModelRepository.findAllWithSkus()
              ├─ StockOverridePort.applyTo(skus)  # F5 전에는 no-op
              ├─ 카드 DTO 변환 (SKU 요약: 색상 + 최저가)
              └─ Zod 파싱 검증 후 반환

GET /products/:modelSlug
  └─ GetProductDetailService.execute({ modelSlug })
        ├─ ProductModelRepository.findBySlug(slug)
        │     └─ null → ProductNotFoundException (404)
        ├─ StockOverridePort.applyTo(model.skus)
        └─ DTO 변환 + Zod 파싱

GET /products/:modelSlug/skus/:skuId
  └─ GetSkuDetailService.execute({ modelSlug, skuId })
        └─ 404 2종: 모델 없음 / 모델은 있으나 SKU 없음
```

### 5.3 F2 기술부채 청산

**변경 전 (F2 Report §5.3 기술부채)**
- `calculate-quote.service.ts`의 `DEFAULT_PRESET` 상수 사용
- `ReferenceVehicleSkuProviderAdapter`가 reference-data에서 가짜 SKU 생성

**변경 후 (F3 필수 작업)**
1. `rental-quote.module.ts`에서 `ProductSkuProviderAdapter`(F3 infra) 주입
2. `apps/backend/b2c/src/modules/reference-data/infrastructure/adapters/reference-vehicle.sku-provider.adapter.ts` 삭제
3. `calculate-quote.service.ts`
   - `DEFAULT_PRESET` 상수 삭제
   - SKU 조회 시 `productModel.fixedPreset`을 함께 받아 견적에 사용
4. `reference-data.module.ts`의 adapter export 삭제
5. F2 E2E 테스트: `DEFAULT_PRESET` → DB에 시드된 실제 preset 사용하도록 업데이트 (`beforeAll`에서 seed 호출)

---

## 6. 프론트엔드 (Next.js 14)

### 6.1 apps/b2c 부트스트랩

- Next.js 14 App Router, React Server Components 기본
- TypeScript strict, NodeNext 모듈 (루트 tsconfig와 일치)
- shadcn/ui 초기 셋업 (Stage A 최소 컴포넌트만: Button, Card, Slider)
- `@kgm-rental/api-contracts` workspace 의존
- `.env.local`: `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`

### 6.2 데이터 패칭 (`lib/api-client.ts`)

```typescript
import { ListProductsResponseSchema } from '@kgm-rental/api-contracts/product';

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/products`, { next: { revalidate: 60 } });
  const json = await res.json();
  return ListProductsResponseSchema.parse(json);
}
```

### 6.3 `/products` (Stage A)

- RSC, ISR 60초
- 카드: 대표 이미지 · 모델명 · "월 XX원부터~" · 색상 스와치 · 프로모션 태그
- 금지 표현 필터는 description 렌더 전에 적용

### 6.4 `/products/[modelSlug]` (Stage A)

- 404: `not-found.tsx` + ProductNotFoundException 대응
- STEP1: SKU 슬라이더 (전체 skus[] 렌더, 색상별 카드)
- STEP2: 4필드 (정비/만기/겨울/지역) — F4 Stage B에서 확장
- 우측 결제 패널: 최저 월 렌트 요약 (F4 Stage B에서 quote-api 연동)

### 6.5 금지 표현 가드 (`lib/forbidden-expressions.ts`)

- 블랙리스트 배열(예: 저속 표현, 미검증 수식)
- `sanitize(text)`: 치환/제거 + 로그
- 모든 description·promotion 렌더 경로에 적용

---

## 7. 모듈 의존도

```
rental-quote.module (F2)
  └─ imports: ProductModule ─────────┐
                                     │ provides
ProductModule (F3)                   ▼
  ├─ controllers: [ProductController]
  ├─ providers:
  │   ├─ ListProductsService / GetProductDetailService / GetSkuDetailService
  │   ├─ ProductModelRepository (implements interface)
  │   ├─ ProductSkuProviderAdapter  ─→ F2 Port 구현체 (export)
  │   └─ NullStockOverrideAdapter   ─→ domain StockOverridePort 주입
  ├─ exports: [ProductSkuProviderPort]   # F2가 consume
  └─ imports: [TypeOrmModule.forFeature([ProductModelOrmEntity, VehicleSkuOrmEntity])]
```

**순환 의존 방지**
- F2 rental-quote의 `Preset` 계산 로직은 libs의 VO만 참조
- F3 seeder가 minMonthlyRent 계산 시에만 F2의 `quote-engine` 순수 함수(Domain Service)를 import — libs → libs이므로 순환 아님

---

## 8. 검증 기준 (Acceptance Criteria)

| # | 기준 | 검증 방법 | 경계조건 |
|---|---|---|---|
| AC-1 | `GET /products` — 6모델 이상 + minMonthlyRent + 색상 스와치 요약 | e2e curl + Zod | 빈 DB 시 `{items:[]}` 반환 |
| AC-2 | `GET /products/:slug` — 전체 skus[] + 모든 필드 | e2e | 잘못된 slug → 404 |
| AC-3 | `GET /products/:slug/skus/:skuId` — 단일 SKU | e2e | 모델 有/SKU 無 → 404 |
| AC-4 | 시더 실행 후 166 SKU + 6 모델 (토레스/무쏘/무쏘그랜드/무쏘EV/액티언HEV/티볼리) | pg-mem integration test | 재실행 시 중복 생성 0건 |
| AC-5 | trim-parser — "L 디젤"→Diesel, "하이브리드"→HEV, "EV"→EV, 모호→ICE+warn | unit spec | 빈 문자열 → 에러 |
| AC-6 | color-codes.map — 시더 실행 시 미매핑 경고 0건 | 시더 로그 + unit | 신규 코드 추가 가이드 포함 |
| AC-7 | F2 `ReferenceVehicleSkuProviderAdapter` 삭제 + F2 E2E 그린 | grep + npm test | F2의 Golden 3~5건 계속 통과 |
| AC-8 | F2 `DEFAULT_PRESET` 삭제 + ProductModel.fixedPreset 사용 | grep + e2e | 견적 결과 값 동일/의도적 변경만 |
| AC-9 | `apps/b2c` `/products` SSR 렌더링 — shadcn/ui 카드 6장 | dev 서버 + 수동 스냅샷 | JS 끄고도 카드 렌더 |
| AC-10 | `/products/[slug]` 404 처리 + 금지 표현 필터 동작 | e2e + unit | 금지어 포함 description → 치환 로그 |
| AC-11 | Build/Typecheck/Lint 전체 PASS | `pnpm build`, `pnpm typecheck`, `pnpm lint` | — |
| AC-12 | api-contracts `product` 서브패스 export 정상 | `import { ... } from '@kgm-rental/api-contracts/product'` | — |

---

## 9. 구현 순서 (Do 단계용)

1. **api-contracts/product** — Zod 스키마부터 확정 (계약 first)
2. **libs/domain** — entities, VO, TrimParserService + unit spec
3. **libs/infrastructure** — ORM 엔티티 + Mapper + color-codes.map
4. **libs/infrastructure/xlsx** — vehicle-groups.parser + spec
5. **libs/infrastructure/seeders** — products.seeder (integration test: pg-mem)
6. **apps/backend/b2c/modules/product**
   - domain (repository interface, stock-override port)
   - infrastructure (repository, null adapter, sku-provider adapter)
   - application (3 use-case services)
   - presentation (controller + DTO)
   - module.ts
7. **F2 청산** — rental-quote.module에서 ProductModule import, DEFAULT_PRESET 삭제, reference-data의 임시 adapter 삭제, F2 E2E 업데이트
8. **e2e 스펙** — product 3개 엔드포인트 e2e
9. **apps/b2c 부트스트랩** — Next.js 14 + shadcn/ui 초기
10. **apps/b2c 페이지** — `/products` + `/products/[modelSlug]` Stage A
11. **Build/Typecheck/Lint + smoke test** — 전 워크스페이스

---

## 10. 리스크 & 대응

| 리스크 | 영향 | 대응 |
|---|---|---|
| xlsx 166행 중 필드 결측·포맷 흔들림 | 시더 실패 | parser에서 Zod 검증, fail-fast + 결측 리포트 |
| F2 청산 시 기존 E2E 브레이크 | 회귀 | F2 E2E를 `beforeAll`에서 시더 호출로 재편, Golden 3~5건 우선 통과 |
| 트림 문자열 과세분화 → 6모델 그룹핑 오탐 | 데이터 품질 | 모델명 정규화 테이블(`product-config.ts`)로 고정, 누락 시 경고 |
| apps/b2c 첫 도입 — 인프라 미정 | 배포 지연 | Stage A는 dev 서버 기동 + SSR 확인까지만 목표, 배포는 F5 이후 |
| Domain Service(trim-parser)를 libs에 두면 F2 `quote-engine` 패턴과 중복 느낌 | 일관성 | F2도 동일 패턴(Domain Service in libs) — 컨벤션 확정 |
| minMonthlyRent 계산이 F2 quote-engine 의존 | 순환 가능성 | quote-engine을 libs/domain/services로 이전 (이미 libs) — F2 controller 미참조 |

---

## 11. 핸드오프 예정

**F4 quote-configurator-ui**에 제공할 자원
- `GET /products/:slug` 응답 (전체 skus[] — STEP1 슬라이더 입력)
- `@kgm-rental/api-contracts/product` 스키마 (Zod + 타입)
- `apps/b2c/components/product/SkuSlider.tsx` Stage A 뼈대
- `forbidden-expressions.ts` 가드 함수

**F5 landing-and-stock**에 제공할 자원
- `StockOverridePort` 인터페이스 (domain)
- `NullStockOverrideAdapter` 레퍼런스 구현
- ProductModule에서 Port 교체 가이드

---

## 12. 참고

- F1 Report: `docs/archive/2026-04/reference-data/` (미구현; reference-data 모듈 구조만 참조)
- F2 Report: `docs/archive/2026-04/quote-api/quote-api.report.md` — §5.3 기술부채 목록
- Plan: `docs/01-plan/features/product-catalog.plan.md`
- 원본 데이터: `pre-docs/vehicle-groups-20260420.xlsx` (166행)

---

> 상태 전이: `plan` → **`design`** (이 문서 저장 시점)
> 다음: `/harness:do` — 위 11단계 구현 순서대로 실행
