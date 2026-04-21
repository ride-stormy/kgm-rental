# Feature Plan: product-catalog

| 항목 | 내용 |
|------|------|
| Epic | kgm-rental-platform |
| 순번 | 3 / 5 |
| 의존성 | — |
| 레이어 | libs (Domain) + apps/backend/b2c + apps/b2c |

## 범위

### 데이터 계층 구조 (2단계)

```
ProductModel (카탈로그 카드 단위)
  slug (kebab): "2025-torres", "actyon-hev", "musso", ...
  name: "2025 토레스"
  brandName: "KGM"
  heroImage, description
  vehicleTypeDefault: ICE | HEV | EV  (모델 대표 타입, SKU 트림별 override 가능)
  fixedPreset:
    - maintenancePackage (기본 패키지)
    - maturityOption
    - winterOption
    - region (기본 지점)
  minMonthlyRent: 계산 (SKU 최저가 × 기본 견적 조건, 목록 카드용)
  promotionTags: [EV 특판, 즉시 배송, 첫 달 0원, ...]

  └─ skus: VehicleSku[] (vehicle-groups.xlsx 각 행 1:1)
       id (ULID 또는 `${specCode}-${colorCode}` 파생 키)
       specCode: "ND0J5C"
       modelCode: "MW5"
       trim: "블랙엣지" | "T7" | "L 디젤 무쏘 M9 4WD" ...
       vehicleType: ICE | HEV | EV | Diesel (트림에서 최종 확정)
       displacement: 1497  (cc, xlsm 차세분 계산용)
       colorExteriorCode: "WAA"
       colorExteriorName: "녹턴 그레이 메탈릭"  (색상 코드→이름 매핑 테이블 별도)
       colorInteriorCode (있으면)
       options: string[]  (예: ["천연 가죽 시트", "파노라마 선루프"])
       price: number  (차량가, = vehicle-groups H 필드)
       stockBucket: number  (초기 시드의 재고수 J, 실시간은 F5의 재고 API로 덮어씀)
       productionPeriods: string[]  (생산시기)
```

> **Note**: ProductTrim 계층은 두지 않는다. "트림"은 VehicleSku의 속성.

### 백엔드 모듈 (`apps/backend/b2c` product 모듈)

- `GET /products` → `ProductModel[]` (카드 목록, SKU는 요약만 — 색상 스와치·최저가용)
- `GET /products/:modelSlug` → `ProductModel` + 전체 `skus[]` (상세 STEP1에서 모든 카드 렌더링)
- `GET /products/:modelSlug/skus/:skuId` → 단일 SKU 상세 (견적 재조회 용)

### 프런트엔드 (`apps/b2c` Next.js)

- `/products` — 모델 카드 그리드 (Stage A: 기본 shadcn/ui 컴포넌트로 최소 레이아웃)
  - 카드: 모델명 · 대표 이미지 · "월 XX원부터~" · 색상 스와치
- `/products/[modelSlug]` — 상세 페이지 (Stage A: STEP1 SKU 슬라이더 + STEP2 4필드 + 우측 결제 패널)
- 금지 표현 필터는 렌더 경로에 적용.

### 시드 스크립트

- `apps/backend/libs/src/infrastructure/seeders/products.seeder.ts`
  1. `pre-docs/vehicle-groups-20260420.xlsx`를 파싱 (166행).
  2. 행별로 `VehicleSku` 생성 (spec/model 코드, 트림, 옵션, 색상, 가격, 초기 재고).
  3. `모델명` 기준으로 `ProductModel` 그룹핑 후 필드 확정(slug/heroImage/description/fixedPreset 등은 별도 설정 파일에서 머지).
  4. `vehicleType`·`displacement`는 트림 문자열 파싱 규칙으로 유도(예: "L 디젤" → Diesel, "하이브리드" → HEV, "EV" → EV). 불확실하면 fallback + 경고 로그.
  5. 색상 코드(예: "WAA")의 표시 이름은 별도 `color-codes.ts` 매핑.
  6. 재실행 안전(Upsert by id).

### Stage 구분

- **Stage A**: 기본 shadcn/ui 컴포넌트로 목록·상세 레이아웃 최소 구현 (디자인 無).
- **Stage B**: Claude Design 시안 수령 후 반영 — F4 Stage B와 동기화.

## 의존성

- 선행: 없음(단, F1의 reference-data 스키마와 `Vehicle` 매칭 관점에서 느슨한 결합).
- 후행:
  - `quote-api`(F2)가 `VehicleSku` 조회로 price·트림·옵션 lookup.
  - `quote-configurator-ui`(F4)가 상세 STEP1 카드로 모든 SKU 렌더링.
  - `landing-and-stock`(F5)이 SKU 재고를 실시간 API로 덮어씀.

## 검증 기준 (Acceptance Criteria)

- [ ] `GET /products` 응답에 모델 6개 이상 + 각 모델의 `minMonthlyRent`, 색상 스와치 요약 포함.
- [ ] `GET /products/:modelSlug` 응답에 전체 SKU 배열 포함(각 SKU: trim·options·colors·price·stockBucket·productionPeriods).
- [ ] vehicle-groups.xlsx 166행이 시드 실행 후 166개 SKU로 저장.
- [ ] 모델 그룹핑 결과: 6개 모델(토레스/무쏘/무쏘그랜드/무쏘EV/액티언HEV/티볼리).
- [ ] `apps/b2c` `/products`, `/products/[modelSlug]` 라우트가 SSR/ISR로 데이터 렌더링(Stage A에선 기본 shadcn/ui 컴포넌트).
- [ ] 슬러그 기반 라우팅 + 404 처리 + 금지 표현 가드.
- [ ] SKU의 `vehicleType`·`displacement` 파싱 규칙이 Unit Test로 커버됨.
- [ ] 색상 코드→이름 매핑 테이블이 vehicle-groups의 모든 유니크 색상을 포함.

## 리스크 & 대응

| 리스크 | 대응 |
|--------|------|
| vehicle-groups에 xlsm 계산에 필요한 필드 부족(배기량·이율 등) | 시드 시 트림 문자열 파싱 + 보조 매핑 파일(`vehicle-metadata.ts`)로 보완. 경고 로그 출력 |
| 색상 코드 이름 미매핑 | 시드 시 미매핑 코드를 수집해 경고. 매핑 추가 전까지는 코드 자체 노출 |
| 트림 문자열이 과세분화됨 | STEP1 SKU 슬라이더는 자연스럽게 다수 카드 지원. 필터(연료·트림 상위)는 Stage B 검토 |
| vehicle-groups 업데이트(재고·가격 변동) | 시드 재실행 시 id 기준 Upsert. 가격 변경 시 history 로그(선택) |
| 재고수(J)가 초기값이고 실시간이 아님 | F5의 실시간 재고 API가 SKU id 단위로 stock 덮어쓰기 |

## 다음 단계

- Design: `/harness:design product-catalog` — ProductModel/VehicleSku 엔티티 필드 확정, 트림 파싱 규칙, 색상 매핑, 시드 파이프라인 설계.
