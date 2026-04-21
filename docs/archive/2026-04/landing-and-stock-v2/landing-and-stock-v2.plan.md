# Feature Plan: landing-and-stock-v2

| 항목 | 내용 |
|------|------|
| Epic | kgm-rental-platform |
| 순번 | 5 / 5 (v1 cancelled 후 재작성) |
| 의존성 | F3 product-catalog (XLSX fixture), F4 quote-configurator-ui (계산 로직 참조) |
| 레이어 | apps/frontend/b2c 전면 · 백엔드 미사용 (XLSX 기반) |
| 단일 소스 | **Figma `9sxH4k4w6tWb9QK7guDgzV` nodeId `8:1844`** |
| 에셋 | `asset/heroimg.png` + 모델 6장 (`actyon/torres/musso/mussogrand/mussoev/tivoli.png`) |
| 작성일 | 2026-04-21 |

---

## 1. 배경

- v1(`landing-and-stock`)은 피그마 + 레퍼런스 이미지 혼합 소스로 인한 스코프 혼란으로 **cancelled**.
- v2는 **오직 피그마 8:1844 단일 소스**만 따른다. 레퍼런스 이미지, 과거 v1 구현물은 참고만.
- **스코프 축소**: v1의 7 섹션(비교 테이블 / 베네핏 카드 / 요약 배너 / 트러스트 섹션)은 **전부 제외**. v2는 4 섹션으로 단순화하고 **간이 계산기(Calculator)**를 추가.

## 2. 디자인 원칙

- **Figma 100% 재현** — 다른 소스(레퍼런스 이미지, 임의 확장) 도입 금지.
- **2 뷰포트 대응만** — Figma가 **375px(모바일) + 540px(확장)** 2개 프레임만 제공. **1024px+ 데스크톱 레이아웃은 범위 외**.
- **모바일 우선**: 컨테이너 `min-w-[375px] max-w-[540px] mx-auto`, 좌우 padding `px-5` (20px).
- **컨텐츠 상수화** — 카피는 `_content/landing.ts` 한 파일에 집중.
- **Figma nodeId 추적** — 각 컴포넌트에 nodeId를 주석으로 남겨 디자인-코드 매핑 유지.

## 3. 범위 (포함 — In Scope)

### 3.1 페이지 `/` — 5 섹션

| # | 섹션 | Figma nodeId | 핵심 요소 |
|---|---|---|---|
| S1 | **hero** | `7:7764` | SUV 배경 이미지(`asset/heroimg.png`) + eyebrow "400대 한정 이벤트" + 3줄 타이틀 + **CTA "상담 신청하기"** (클릭 핸들러만, 동작 없음) |
| S2 | **productsection header** | `7:7769` | 타이틀 "티볼리보다 싼 토레스, 월 18만 원대 액티언 하이브리드" + 서브 "한정 수량으로 소진 시 즉시 마감될 수 있습니다" |
| S3 | **filterset (sticky)** | `7:7772` | 7 필터 가로 스크롤: `전체` / `액티언 HEV` / `토레스` / `무쏘` / `무쏘그랜드` / `무쏘 EV` / `티볼리` |
| S4 | **productsection (cars)** | `7:7787` | 헤더 "**총 400대** · 2026. 04. 15 기준" (400 고정) + **Car-Item 6개** (220h, 20 gap) |
| S5 | **calculate-section** | `8:1862` | 간이 계산기: 모델/트림/기간/거리/선수금/보조금 → 예상 월 납입금 + CTA "이 조건으로 상담 신청" (클릭 핸들러만) |

### 3.2 Car-Item 스펙

각 6개 모델별 **하나의 카드**.

**레이아웃** (Figma `7:7795` 기준)
- 좌측: 모델명 + 배지 · **가격 "{최저가}원 부터"** (XLSX 계산값) · 조건 텍스트 "계약기간 5년 · 선납:10% · 주행거리:2만 km 기준" · **"견적내보기 →"** 링크
- 우측: 차량 썸네일 (`asset/{model}.png`)

**모델별 배지 카피** (사용자 확정)
| 모델 slug | 모델명 | 배지 |
|---|---|---|
| `2025-torres` | 토레스 | 베스트셀러 SUV |
| `actyon-hev` | 액티언 HEV | 실용과 스타일 |
| `musso` | 무쏘 | 정통 픽업 |
| `musso-grand` | 무쏘그랜드 | 프리미엄 픽업 |
| `musso-ev` | 무쏘 EV | 전기 픽업 |
| `tivoli` | 티볼리 | 엔트리 SUV |

**가격 계산 규칙**
- XLSX fixture(`vehicles.json`)에서 **각 모델의 최저가 SKU** 선택
- 계산 조건: **계약 60개월(5년) · 연간 2만km · 선납 10% · 보조금 10%**
- 계산 로직은 F4의 quote-calculator 공식을 **프론트 로컬 함수로 재구현** (서버 미사용)
- 결과를 `카드별 "{금액}원 부터"` 표기

**견적내보기 동작** (사용자 확정)
- 현재는 상세 페이지 미제작 → **calculator 섹션으로 스크롤 + 해당 모델·트림 pre-select**
- 향후 상세 페이지 완성 시 → `/products/{slug}` 이동으로 전환

### 3.3 Filterset 동작 (sticky)

- **가로 스크롤**: `overflow-x-auto` + 스크롤바 숨김
- **초기 선택**: "전체"
- **스티키**: 스크롤 진입 시 `position: sticky; top: 0` 상단 고정
- **마지막 Car-Item 지나면 언핀**: 마지막 카드 하단 경계 지나면 일반 위치로 복귀
- **클릭 → 해당 모델 섹션으로 스크롤** (anchor + smooth scroll)
- **스크롤 → 자동 선택**: IntersectionObserver로 현재 화면 중앙의 모델 감지 → 필터 버튼 활성 토글 (애니메이션)
- **"전체" 활성 규칙**:
  - 스크롤 위치가 **첫 Car-Item 위쪽** → "전체" 활성 (기본값)
  - 스크롤이 Car-Item들 사이 → **해당 모델** 활성
  - 스크롤이 **마지막 Car-Item 아래** → **마지막(티볼리)** 활성

### 3.4 Calculator 스펙

**입력 필드**
| 필드 | 컴포넌트 | 기본값 |
|---|---|---|
| 모델 | Dropdown | 토레스 |
| 트림 | Dropdown | 토레스의 **최저가** SKU 트림 |
| 계약 기간 | 3-segment | 36개월 / 48개월 / **60개월** (기본) |
| 연간 주행거리 | 4-segment | 1만 / **2만** / 3만 / 4만 km (기본) |
| 선수금 비율 | Slider | 0~50%, 10% 간격 → **10% 기본** |
| 보조금 비율 | Slider | 0~50%, 10% 간격 → **10% 기본** |

**제약 규칙**
- 선수금 %, 보조금 % 각각 0~50% (10% 간격, 6 steps)
- **합산 제약**: `선수금% + 보조금% ≤ 50%`
  - 예: 선수금 30% 선택 시 보조금은 0·10·20%만 선택 가능
  - 초과 시 자동 클램프 또는 disabled 상태로 가드
- 사유: 차량가의 50%를 초과하는 초기 지불 방지 (차량가 4천 → 합계 2천 이하)

**표시**
- 슬라이더 우측: `{percent}%  {원화 금액}` (차량가 × percent)
- 트림 dropdown 하단: `차량 가격 {totalVehiclePrice}원`
- 중앙 상단: "예상 월 납입금" + **{monthly}** `원/월` (큰 숫자)

**계산 로직**
- 모델+트림 선택 시 해당 모델+트림의 **최저가 SKU 데이터** 사용
- F4 계산 공식 로컬 재구현 (서버 미사용)
- 입력 변경 시 debounce(200ms) 적용하여 재계산
- "대략적인 가격" 경고는 서브 카피로 이미 노출 ("차종과 조건을 선택하면 대략적인 월 납입금을 즉시 확인할 수 있습니다")

### 3.5 CTA 동작 (사용자 확정: 클릭 이벤트만)

- Hero "상담 신청하기" → `onClick` 핸들러만 연결 (body empty or console.log only)
- Calculator "이 조건으로 상담 신청" → 동일
- 토스트/alert 사용 안함, 단순 noop 핸들러

### 3.6 데이터 소스 (Stage A)

- **XLSX fixture 전면 사용** (v1에서 구축한 `apps/frontend/b2c/app/products/xlsx/_fixtures/vehicles.json`)
- 6 모델 + SKU 전체 로컬 로드 (RSC + client 양쪽 접근 가능)
- **백엔드/DB 불필요** — Next.js 단독 실행
- 재고 수량은 **고정 "400대"** 표시 (XLSX 기반 동적 계산 안함)

### 3.7 에셋 매핑

| 에셋 파일 | 사용처 |
|---|---|
| `asset/heroimg.png` | S1 Hero 배경 |
| `asset/torres.png` | `2025-torres` Car-Item |
| `asset/actyon.png` | `actyon-hev` Car-Item |
| `asset/musso.png` | `musso` Car-Item |
| `asset/mussogrand.png` | `musso-grand` Car-Item |
| `asset/mussoev.png` | `musso-ev` Car-Item |
| `asset/tivoli.png` | `tivoli` Car-Item |

→ Design 단계에서 `apps/frontend/b2c/public/images/landing/`으로 복사/참조 경로 확정.

---

## 4. 범위 (제외 — Out of Scope)

| 항목 | 사유 |
|---|---|
| 1024px+ 데스크톱 레이아웃 | Figma 미제공 (375/540만) |
| 비교 테이블, 베네핏 카드, 요약 배너, 트러스트 섹션 | v1 스코프 축소 (피그마에 없음) |
| Hero/Calculator CTA 실제 폼 연결 | **클릭 핸들러만** (사용자 확정) — 다음 Epic `kgm-rental-consultation` |
| 상세 페이지 `/products/{slug}` 제작 | 화면 시안 부재 — 현재는 calculator fallback |
| 재고 API, 재고 배지, 재고 폴링, 재고 프록시 | v2 스코프 외 (400 고정) |
| UTM 수집 | Epic 확장으로 별도 feature |
| Backend NestJS 모듈 (stock/products) | XLSX fixture 전면 사용으로 불필요 |
| Playwright E2E, 성능 측정(Lighthouse) | Stage A 유지 — 추후 QA feature |
| v1 잔존 코드(landing 7 섹션, backend stock) | Design 단계에서 정리 방향 결정 |

---

## 5. 의존성

- **선행**
  - F3 `product-catalog` — XLSX fixture (`vehicles.json`) 파싱 완료 (6 모델 / 166 SKU)
  - F4 `quote-configurator-ui` — quote 계산 공식 (로컬 재구현 대상)
- **외부**: 없음 (백엔드·DB·외부 API 미사용)

## 6. 검증 기준 (Acceptance Criteria)

**랜딩 렌더**
- [ ] `/` 페이지가 S1~S5 5 섹션을 **Figma 스펙대로** 렌더.
- [ ] 컨테이너 폭 `min-w-[375px] max-w-[540px] mx-auto px-5` 전 섹션 준수.

**Hero (S1)**
- [ ] 배경 이미지 `heroimg.png` + eyebrow + 3줄 타이틀 + CTA "상담 신청하기".
- [ ] CTA 클릭 시 핸들러 호출 확인 (동작 없이 noop).

**Product section + filterset (S2/S3/S4)**
- [ ] S3 필터 7개 (전체 + 6 모델) 가로 스크롤 가능.
- [ ] 스크롤 시 S3가 상단 sticky. 마지막 Car-Item 지나면 unpin.
- [ ] 필터 클릭 → 해당 모델 Car-Item 위치로 smooth scroll.
- [ ] 스크롤 중 현재 모델 자동 활성화 (IntersectionObserver 기반).
- [ ] "전체" 활성 규칙: 위쪽 = 전체, 중간 = 해당 모델, 아래쪽 = 마지막(티볼리).
- [ ] S4 "총 400대 · 2026. 04. 15 기준" 표시 (400 고정).
- [ ] Car-Item 6개 순서: 액티언 HEV → 토레스 → 무쏘 → 무쏘그랜드 → 무쏘 EV → 티볼리 (Figma 순서).
- [ ] 각 Car-Item: 모델명 + **배지(모델별 카피)** + 가격 "{최저가}원 부터" + 조건 + "견적내보기 →" + 썸네일.
- [ ] 가격은 XLSX 최저가 SKU 기준 **60개월/2만km/선납10%/보조금10%** 조건으로 계산된 값.
- [ ] "견적내보기" 클릭 → calculator 섹션 scroll + 해당 모델·트림 pre-select.

**Calculator (S5)**
- [ ] 초기값: 모델=토레스, 트림=토레스 최저가 SKU 트림, 60개월, 2만km, 선수금 10%, 보조금 10%.
- [ ] 모델 변경 시 트림 자동 재선택 (해당 모델 최저가 트림).
- [ ] 슬라이더 0~50% 10% 간격.
- [ ] **선수금 + 보조금 합 ≤ 50% 가드** 동작 (클램프 또는 disabled).
- [ ] 트림 dropdown 하단 `차량 가격 {total}원` 표시.
- [ ] 입력 변경 시 예상 월 납입금 재계산 (debounce 200ms).
- [ ] CTA "이 조건으로 상담 신청" 클릭 핸들러 연결 (noop).

**기술**
- [ ] Build / Typecheck / Lint 전부 PASS.
- [ ] v1 잔존 코드 정리 방향은 Design 단계에서 결정.
- [ ] 금지 표현 가드 통과.

---

## 7. 리스크 & 대응

| 리스크 | 대응 |
|---|---|
| Sticky + IntersectionObserver의 iOS Safari 동작 차이 | Design 단계에서 `scroll-margin-top` + rootMargin 값 사전 검증. 필요시 scroll 이벤트 fallback |
| Calculator 계산 공식이 실제 견적과 어긋남 | "대략적인 가격" 서브 카피 + 상담 CTA로 공식 견적 유도 |
| XLSX SKU 데이터 불완전 (색상 1개만 등) | 랜딩에서는 색상 미표시 → 영향 없음 |
| Hero 배경 이미지 사이즈 최적화 누락 | Next.js Image 컴포넌트 + priority eager loading |
| Figma 외 관점 혼입 (과거 v1/레퍼런스) | **Design 문서에 "Figma 단일 소스" 원칙 명시**, PR 설명에도 반복 기재 |
| 1024px+ 뷰포트 접근 사용자 | 540px 초과 구간은 **540px 레이아웃 유지**(상단 정렬). 별도 스타일 추가 안함 |
| v1 잔존 코드 충돌 | Design 단계에서 **삭제 목록** 명시 (Backend stock module, landing 7 섹션, v1 stock-fixture, route handlers 등) |

---

## 8. 개발 순서 힌트 (Design 단계에서 상세화)

1. **v1 코드 정리 계획 수립** (Design 단계)
2. Tailwind 토큰 재정비 (Figma 색/폰트/spacing 추출)
3. `_content/landing.ts` 재작성 (4 섹션 + Car-Item 6 + Calculator 기본값)
4. 에셋 복사 (`asset/*.png` → `public/images/landing/`)
5. XLSX 기반 `lib/vehicle-pricing.ts` (모델별 최저가 + Quote 공식 로컬 재구현)
6. Primitive UI: `components/ui/slider.tsx`, `components/ui/segmented-picker.tsx`, `components/ui/select.tsx`
7. Calculator 훅 `lib/use-quote-estimation.ts` (제약 가드 포함)
8. Sticky filter 훅 `lib/use-scroll-filter.ts` (IntersectionObserver + anchor scroll)
9. 섹션 컴포넌트 S1~S5 순서
10. `app/page.tsx` 조립
11. Build / Typecheck / Lint

---

## 9. 다음 단계

`/harness:design landing-and-stock-v2`

- Figma 토큰 → Tailwind 매핑
- v1 잔존 코드 정리 목록 확정
- Car-Item / Calculator 컴포넌트 구조 상세화
- Sticky + 자동 선택 로직 구현 방식 확정
- 검증 기준 구체화
