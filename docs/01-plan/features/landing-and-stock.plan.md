# Feature Plan: landing-and-stock

| 항목 | 내용 |
|------|------|
| Epic | kgm-rental-platform |
| 순번 | 5 / 5 |
| 의존성 | Feature 3 (product-catalog), Feature 4 (quote-configurator-ui) |
| 레이어 | apps/b2c + apps/backend (재고 프록시) |
| 주 소스 | Figma `9sxH4k4w6tWb9QK7guDgzV` nodeId 4:9379 + `pre-docs/reference/1~4.png` |
| 업데이트 | 2026-04-21 — 피그마/레퍼런스 기반 확장 |

---

## 1. 배경

- F4 완료로 `/products/[slug]` 상세 내부 견적기는 동작. 이제 유입 페이지가 필요.
- **KGM 400대 한정 프로모션**을 중심으로 한 **이벤트 톤의 랜딩** 이 목표.
- 원본 Plan은 "유튜브 진입 메시지 + 상품 카드" 수준이었으나 피그마·레퍼런스 수령 후 7 섹션 구조로 구체화됨.

## 2. 디자인 원칙

- **이벤트 페이지 톤** — 한정·긴급·강한 대비 CTA, 숫자/배지로 희소성 강조 ("400대 한정", "재고 소진 임박" 등).
- **Figma 우선 재현** — 히어로 / 재고 상품 / "소유가 아니라" 헤더(3 섹션)는 Figma 스펙 그대로.
- **레퍼런스 확장 섹션** — Figma 이후 영역은 `reference/2.png`·`reference/3.png` 의 구조만 가져오되 **컬러는 프로젝트 블루**로 치환.
- **최대 너비 1100px · 데스크톱 px-10 · 태블릿/모바일 px-5** — Epic 전체 표준 유지 (F4에서 정립).
- **컨텐츠는 가변** — 카피/문구는 프리즈 아님, 구조·컴포넌트·데이터 바인딩에 집중.

## 3. 범위 (포함 — In Scope)

### 3.1 랜딩 페이지 `/` — 7 섹션 스택

| # | 섹션 | 소스 | 핵심 요소 |
|---|---|---|---|
| S1 | **Hero** | Figma `Frame 1618875004` (0–650px) | 배경 비주얼 영역 · "400대 한정 역대급 기회" 타이틀 · 3 베네핏 카드 (초기비용 없이 / 정비 보험 올인원 / 만기엔 선택) · 기본 CTA 2개 ("내 견적 1분만에 확인하기" · "상담 신청") |
| S2 | **재고 Product** | Figma `productsection` (664–1486px) + ref 1.png | 헤더 "400대 한정 수량 남은 재고를 확인하세요" · 총 잔여 대수 + 기준일 · 2 Car-Item (토레스 / 액티언 HEV). 각 Car-Item은 이미지·모델·부카피·잔여 재고·색상별 수량·"재고 소진 임박" 배지 |
| S3 | **운용 솔루션 헤더** | Figma `productsection`(1486–1646px) | "소유가 아니라, 운용 솔루션입니다" + 서브 카피 |
| S4 | **비교 테이블** | ref 2.png 하단 | 티볼리 할부 60개월 vs 토레스 장기렌트 60개월. 항목: 월 납입금 / 취등록세(7%) / 5년 자동차세 / 5년 보험료 / 5년 총 추가 부담 |
| S5 | **4 베네핏 카드** | ref 2.png 하단 | 초기 비용 최소화 / 세금·보험료 절감 / 차량 관리·사고 처리 편의 / 사업자 절세 혜택 |
| S6 | **요약 배너** | ref 2.png 맨 하단 | "장기렌트 = 단순 대여 ❌  /  차량 취득부터 세금·보험·관리까지 포함된 차량 운용 솔루션 ✅" |
| S7 | **KGM 공식 리테일러** | ref 3.png 하단 | "KGM 공식 리테일러가 직접 운영합니다" · 3 신뢰 기둥 (KGM Experience Center 2호점 운영 / 7년 Experience Center / 대량 캐파로 독점 제공) · 각 기둥 하단 stats 카드 |

### 3.2 재고 API 및 배지

- **백엔드 프록시**: `apps/backend/b2c` 에 외부 재고 API Adapter (`GET /stock` 또는 `GET /stock/:productSlug`). 키/토큰 서버 보관.
- **배지 표시**: 랜딩 S2 Car-Item + `/products/[slug]` 상단.
- **폴링**: native fetch + `setInterval(60_000)` + AbortController. (F4와 스택 일관성 유지 — TanStack Query 미도입)
- **Graceful degradation**: 오류/타임아웃 시 배지 숨김, 페이지는 정상.
- **단기 캐시**: 서버 프록시 10~30s 메모리 캐시.

### 3.3 UTM 수집

- 첫 방문 시 `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` 을 `sessionStorage` 에 저장.
- 주요 백엔드 요청 헤더(예: `X-UTM-Source`)에 첨부.
- PII 아님. 쿠키 동의 범위와 분리.

### 3.4 성능·접근성

- LCP 2.5s 이하 (히어로 이미지 `<img loading="eager">`, 하단 섹션 lazy).
- 모든 헤딩 사용으로 스크린리더 탐색 가능 (`<h1>` hero, `<h2>` 각 섹션).
- 모바일·데스크톱 레이아웃 동등 품질 (1100/40/20 표준).
- 금지 표현 가드 통과.

---

## 4. 범위 (제외 — Out of Scope)

| 항목 | 사유 | 이관 |
|---|---|---|
| **외부 견적기** (ref 2.png 상단) | 견적은 `/products/[slug]` 내부에서만 제공 (F4 구현) — 중복 UI 방지 | — |
| **두 차종, 두 개의 해답** 섹션 (ref 3.png 상단) | 사용자 제외 요청 | — |
| **상담 신청 폼** (ref 4.png 상단 좌) | 상담은 별도 플로우, 범위 큼 | 다음 에픽 `kgm-rental-consultation` |
| **Experience Center 방문 카드** (ref 4.png 상단 우) | 상담 에픽과 함께 | 다음 에픽 `kgm-rental-consultation` |
| **FAQ 아코디언** (ref 4.png 중단) | 컨텐츠 확정 지연, 범위 분리 | 다음 에픽 `kgm-rental-consultation` |
| **Footer** (ref 4.png 하단) | Epic 전체 공통으로 `app/layout.tsx` 에 별도 작업 | 차기 Epic 또는 B1 스타일 정리 |
| **Playwright E2E** | Stage A 수준 유지 | 향후 QA feature |

---

## 5. 의존성

- 선행
  - F3 `product-catalog` — 상품 슬러그/이름/이미지 메타 (S2 Car-Item 렌더에 필요)
  - F4 `quote-configurator-ui` — 상세 페이지 견적기 완료 (Hero CTA "내 견적 1분만에 확인하기" 이동 대상)
- 외부: 재고 API 스펙(Adapter 최종 필드 · Design 단계에서 확정)

---

## 6. 검증 기준 (Acceptance Criteria)

랜딩 렌더 및 기능

- [ ] `/` 페이지가 S1~S7 7개 섹션을 **Figma/레퍼런스 스펙대로** 렌더.
- [ ] Hero CTA "내 견적 1분만에 확인하기" 클릭 시 대표 상품 상세(`/products/2025-torres`) 로 이동.
- [ ] Hero CTA "상담 신청" 클릭 시 **placeholder 동작** (다음 에픽 연결 전까지 disabled 또는 토스트).
- [ ] S2 Car-Item 클릭 시 `/products/[slug]` 로 이동.
- [ ] S4 비교 테이블이 데이터 바인딩 가능하도록 **구조화된 배열 상수**로 제공 (하드코딩 JSON).

재고 API

- [ ] 백엔드 `apps/backend/b2c` 에 재고 프록시 엔드포인트 등록, Zod DTO로 응답 검증.
- [ ] 외부 API 호출 실패·타임아웃(3s) 시 배지 숨김, 페이지 렌더 영향 없음.
- [ ] 서버 프록시에 10~30s 메모리 캐시 적용.
- [ ] 프론트 폴링 60s 주기 동작, unmount 시 AbortController로 정리.

UTM

- [ ] 첫 진입 시 UTM 5종 `sessionStorage` 저장.
- [ ] 백엔드 요청 헤더(`X-UTM-*`) 첨부 확인.

디자인/품질

- [ ] 컨테이너 `max-w-[1100px] mx-auto`, 데스크톱 `px-10`, 태블릿/모바일 `px-5` 준수.
- [ ] 이벤트 톤: 한정 수량 배지/CTA 대비 충분, 버튼 상태 호버/포커스 모두 스타일링.
- [ ] 컬러: 레퍼런스 레드 대체용 **프로젝트 블루** 를 accent로 사용 (에러/금칙 표시는 기존 red 유지).
- [ ] LCP 2.5s 이하 (4G 에뮬레이션).
- [ ] Build / Typecheck / Lint 전체 PASS.
- [ ] 금지 표현 가드 통과.

---

## 7. 리스크 & 대응

| 리스크 | 대응 |
|---|---|
| 재고 API 레이트 리밋/비용 | 60s 폴링 + 서버 프록시 단기 캐시(10~30s). 사용자 수에 따라 서버 캐시 상향 |
| 재고 값 튐(깜빡임) | 이전 값 유지 + 부드러운 트랜지션, 최신값 도달 전까지 stale 표시 |
| UTM 파라미터 개인정보 오해 | UTM은 PII 아님 문서화, 쿠키 동의 범위와 분리 |
| 외부 재고 API 스펙 변동 | Adapter 경계에 Zod 계약 테스트, 스펙 변경은 Adapter만 수정 |
| 컨텐츠 변경으로 인한 재작업 | **컨텐츠는 상수 객체**로 모아 한 곳에서 수정 가능 (S4 비교 테이블, S5 베네핏, S7 기둥) |
| Stage A 디자인-레퍼런스 편차 논쟁 | "레퍼런스는 스타일 가이드, 컨텐츠는 가변" 을 PR 설명 및 Design 문서에 명시 |
| Figma 벗어난 컬러/타이포 | 프로젝트 토큰(`brand-accent` 등) 매핑 표를 Design에서 확정 |

---

## 8. 개발 순서 힌트 (Design 단계에서 상세화)

1. 데이터 상수 정리 (베네핏/비교/기둥)
2. 백엔드 재고 프록시 엔드포인트 + Zod DTO
3. 프론트 재고 훅 (`useStock`) — F4의 `useResidualValue` 패턴 재사용
4. UTM 캡처 유틸 + sessionStorage + API 클라이언트 헤더 연동
5. S1 Hero → S7 KGM 공식 리테일러 순으로 구현
6. S2 상품 섹션에 실제 F3 `/products` 데이터 + 재고 배지 결합
7. 성능 측정 (Lighthouse 4G)

---

## 9. 다음 단계

- `/harness:design landing-and-stock` — 컴포넌트 구조·재고 API 스펙·배지 위치·컬러 토큰 매핑·모바일 breakpoint 확정.
