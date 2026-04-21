# Feature Plan: quote-configurator-ui

| 항목 | 내용 |
|------|------|
| Epic | kgm-rental-platform |
| 순번 | 4 / 5 |
| 의존성 | Feature 2 (quote-api), Feature 3 (product-catalog) |
| 레이어 | apps/b2c |

## 범위

상품 상세 페이지(`/products/[modelSlug]`)의 견적 구성 UI 전체.

### 레이아웃 (이미지 참고 UX)

```
┌─────────────────────────────────┬──────────────────────────┐
│  [모델 Hero 이미지]              │  그랜저 (GN7)            │
│                                 │  2.5 가솔린 2WD 프리미엄  │
│                                 ├──────────────────────────┤
│                                 │  연료/차량가격          ▼│
│                                 │  색상                   ▼│
│                                 │  추가옵션               ▼│
│                                 │  견적조건               ▼│
│                                 │                          │
│  [STEP1 차량 정보 확인]          │  [결제 내역]             │
│   ◂ SKU 카드 슬라이더 ▸         │  초기납입금액   12,075,000│
│    ┌──────────┐  ┌──────────┐  │  표준 렌탈료     663,500 │
│    │ 40,250K  │  │ 40,250K  │  │  할인합계▼       -13,338 │
│    │ 가솔린   │  │ 가솔린   │  │  월 선납금 차감 -251,562 │
│    │ 5인승    │  │ 5인승    │  │  ─────────────────────── │
│    │ 녹턴     │  │ 어비스   │  │  최종 렌탈료   398,600원 │
│    │ 2대 남음 │  │ 2대 남음 │  │                          │
│    └──────────┘  └──────────┘  │  [상담 신청] [견적 저장] │
│                                 │                          │
│  [STEP2 내 견적 만들기]          │                          │
│   계약기간  [24][36][48][60]    │                          │
│   주행거리  [10k][15k][20k]...  │                          │
│   선납금    [0%][10%][20%][30%] │                          │
│   보증금    [0%][10%][20%][30%] │                          │
└─────────────────────────────────┴──────────────────────────┘
```

### Stage A — 기능 프로토타입 (디자인 없음)

- **STEP1 SKU 카드 가로 슬라이더** (F3의 `GET /products/:modelSlug` 응답 `skus[]` 전체 표시)
  - 카드 표시 필드: `price`, `trim`, `vehicleType`, 좌석수(필요 시 시드), `options`(요약), `colorExteriorName`, `colorInteriorName`, `stockBucket` → "N대 남음" 배지, "빠른 출고 가능" 태그
  - 카드 선택 시 `selectedSkuId` 상태 확정
- **STEP2 4필드 입력**
  - 계약기간: 24 / 36 / 48 / 60 (라디오/탭)
  - 약정 주행거리: 10k / 15k / 20k / 25k / 30k km
  - 선납금 비율: 0 / 10 / 20 / 30 %  (라벨 옆 `price × rate` 환산 금액 표기)
  - 보증금 비율: 0 / 10 / 20 / 30 %  (동일)
- **입력 상태**: React Hook Form + Zod 단일 정본(`libs/api-contracts`).
- **잔가 캐시**: `skuId` 또는 `contractPeriod`/`annualMileage` 변경 시 `GET /quotes/residual-value` 호출 → 결제 패널의 "만기 인수 예상 가격" 업데이트.
- **견적 호출**: 4필드 + `skuId` 확정 후 300ms debounce로 `POST /quotes/calculate` 호출.
- **우측 결제내역 패널 (실시간 분해 표시)**
  - 초기납입금액 (선납 X% + 보증 Y%)
  - 표준 렌탈료
  - 할인합계 (접기/펼치기로 세부 내역)
  - 월 선납금 차감 (음수 표기)
  - **장기렌트 최종 렌탈료** (강조)
  - 상담 CTA 버튼 (다음 Epic `kgm-rental-consultation`에서 활성화, 지금은 placeholder)
- **클라이언트 검증**:
  - `prepaidRate > 40` / `depositRate > 50` / `합 > 50` 조합은 UI 비활성화 + 툴팁
  - 서버 400 응답(`INVALID_DEPOSIT_PREPAY_LIMIT_*`)도 인라인 에러 표시
- **접근성**: 결제 내역 갱신 시 `aria-live="polite"`.
- **금지 표현 가드**: 렌더 경로(카드·패널·메타) 전반에 `bannedPhrases.ts` 유틸 적용.
- **반응형**: 모바일(375)에서 STEP1은 가로 스크롤, 결제 패널은 하단 sticky. 데스크톱(1440+)은 2단 레이아웃.
- **UI는 기본 shadcn/ui 컴포넌트만** 사용 (디자인 없음). 기능 완성이 목표.

### Stage B — Claude Design 시안 반영 (Stage A PASS 이후)

- 사용자가 전달한 Claude Design 산출물을 shadcn/ui 프리미티브 매핑표에 따라 컴포넌트화.
- Tailwind CSS + `shadcn/ui`로 반응형 토큰 적용.
- 모바일(375) · 데스크톱(1440) 레이아웃 정교화 + 시각 회귀 스냅샷.

## 의존성

- 선행: `quote-api`(F2), `product-catalog`(F3).
- 후행: 없음(이 Epic 내). `kgm-rental-consultation` Epic이 상담 CTA를 활성화.

## 검증 기준 (Acceptance Criteria)

**Stage A (선행 gate)**

- [ ] STEP1 SKU 카드 슬라이더가 F3 응답의 모든 SKU를 렌더링. 각 카드에 필수 필드 표기.
- [ ] SKU 카드 선택 시 STEP2가 활성화되고 선택된 `price`가 결제 패널에 반영.
- [ ] STEP2의 4필드(계약·주행·선납%·보증%) 입력마다 300ms debounce 후 F2 API 호출 → 결제 내역 10개 필드 갱신.
- [ ] 선납·보증 각 옵션 라벨 옆 **환산 금액** 표기(예: "10% (4,069,000원)") — `price × rate`.
- [ ] `prepaidRate + depositRate > 50` / 단독 상한(40·50) 초과 조합 UI 비활성 + 툴팁.
- [ ] 서버 400(`INVALID_DEPOSIT_PREPAY_LIMIT_*`) 응답도 UI에 인라인 에러.
- [ ] 결제 내역 표시 필드: 초기납입금액·표준렌탈료·할인합계(접기/펼치기)·월 선납금 차감·최종 렌탈료. `aria-live`로 갱신.
- [ ] 금지 표현 가드 단위 테스트 통과.
- [ ] E2E 스모크: golden CSV 대표 3건을 UI 조작으로 재현 → 화면 결제 내역 각 필드가 xlsm과 **1원 단위 일치**.
- [ ] 네트워크 지연/오류 시 스피너·에러 배너 노출(재시도 제공).
- [ ] 모바일(375) / 데스크톱(1440) 레이아웃 모두에서 동일 기능 동작.

**Stage B (Stage A PASS 이후)**

- [ ] Claude Design 시안 수령 후 shadcn/ui 매핑표 작성 완료. 미매핑 요소가 사용자에게 사전 플래그됨.
- [ ] 시각 회귀 스냅샷 확보.
- [ ] Stage A의 기능 AC 전원 여전히 PASS(회귀 없음).

## 리스크 & 대응

| 리스크 | 대응 |
|--------|------|
| SKU 개수가 많아 STEP1 로딩이 무거움 | 모델당 SKU ≤ 50~60 수준이라 SSR/ISR 충분. 이미지 lazy-load, 슬라이더 window rendering |
| 잦은 API 호출로 서버 부담 | 300ms debounce + Query key 캐싱. SKU 변경 시에만 잔가 조회 |
| 스키마 드리프트(프론트↔백) | Zod 스키마 단일 정본을 `libs/api-contracts`에 두고 양쪽 import |
| 보증금·선납 3규칙 조합이 복잡 | Zod refine + 클라이언트 `useMemo` 가드로 단일 구현. 선택 불가 조합은 UI에서 비활성 + 이유 툴팁 |
| 우측 결제 패널이 모바일에서 너무 큼 | sticky bottom bar로 축약(최종 렌탈료 + CTA만), "상세" 버튼으로 분해 내역 모달 |

## 다음 단계

- Design: `/harness:design quote-configurator-ui` — STEP1 카드 스펙·STEP2 폼 상태 흐름·결제 패널 필드 매핑·반응형 정책 확정. Stage B는 Claude Design 시안 수령 시 갱신.
