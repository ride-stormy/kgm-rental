# Epic Plan: vehicle-hook-sections

## Executive Summary

| 항목 | 내용 |
|------|------|
| Epic | vehicle-hook-sections |
| 작성일 | 2026-04-22 |
| 프로필 | blank (verification.commands: frontend-b2c 설정 완료) |
| 관련 Epic | `docs/archive/2026-04/hero-hooking-v2/` (Hero 기본 블록 완료됨) |

### Value Delivered (4-Perspective)

| 관점 | 내용 |
|------|------|
| **Problem** | 랜딩 Hero 아래 영역이 비어 있어 "왜 지금 구매해야 하는가?"에 대한 구체 증거가 없다. 가격·스펙·경쟁사 대비 우위를 시각적으로 보여주지 못해 스크롤 이탈률이 높을 가능성 |
| **Solution** | Hero 직하단에 "후킹 섹션" 2개를 추가 — (1) Actyon 하이브리드 스펙 카드로 가격·스펙 자신감 제시, (2) 토레스 vs 티볼리 비교 테이블로 경쟁사 대비 우위 증명. Hero CTA 버튼은 블루 강조색으로 교체하여 후킹 섹션들과 시각 통일 |
| **Function UX Effect** | Hero (인상) → Actyon 카드 (상품 디테일/가격) → Torres 비교 (경쟁 우위) → CTA 흐름이 스토리텔링 구조로 연결. 스캔 깊이 증가 + CTA 클릭률 제고 |
| **Core Value** | 브랜드 자신감("하루 6,000원 프리미엄") + 경쟁 우위("티볼리보다 싼 토레스") + 구체 숫자(월 180,550원, 월 39만원)의 3중 근거로 구매 전환 유도 |

---

## 1. 배경 및 문제 정의

### 1.1 현재 상태

- `hero-hooking-v2` 완료로 Hero 영역(Headline/EventBand/LineupImage)은 다크 퍼플 배경 + Gmarket 헤드라인 + 이벤트 밴드 + 차량 라인업 이미지로 구성 완료
- `apps/frontend/b2c/app/page.tsx`의 랜딩은 현재 Hero 이후 하단 콘텐츠가 얕거나 비어 있음
- Hero CTA 버튼 색상은 `bg-kgm-purple-600` (#2e2c4b, 다크)으로 저대비 — 후킹 섹션의 블루 강조와 불일치

### 1.2 목표

피그마 노드 `20:825`(전체 hero 그룹, file `9sxH4k4w6tWb9QK7guDgzV`) 기준:
1. Hero 직하단에 Actyon 하이브리드 스펙 카드 섹션(20:908) 추가
2. 그 아래 토레스 vs 티볼리 비교 테이블 섹션(23:1089) 추가
3. Hero CTA 버튼 색상을 블루(#0A93FF)로 변경하여 시각 통일

## 2. 요구사항

### 2.1 기능 요구사항

| # | 요구사항 | 우선순위 |
|---|---------|---------|
| 1 | Actyon 스펙 카드 섹션 렌더 (chip + title + product card + CTA 2버튼) | 높음 |
| 2 | 토레스 vs 티볼리 비교 테이블 섹션 렌더 (chip + title + 3열 테이블 + CTA 2버튼) | 높음 |
| 3 | Hero 기존 CTA 버튼 색상 블루(#0A93FF) 변경 | 높음 |
| 4 | 모든 CTA 버튼 클릭 시 console.debug 로그 (이벤트명 구분) | 중간 |
| 5 | Actyon/Torres 콘텐츠는 `_content/landing.ts`에 정적 하드코딩 (actyon, torres 키 추가) | 높음 |
| 6 | Actyon 차량 이미지는 `public/images/landing/` 하위에 배치 (Figma 에셋 다운로드) | 높음 |

### 2.2 비기능 요구사항

- **반응형**: 모바일 375px 기준 설계, 540px 초과 시 중앙 고정 (기존 Hero 패턴 동일)
- **성능**: Actyon 이미지 `next/image` 사용, 첫 화면 LCP 영향 최소화 (`priority={false}`)
- **접근성**: 장식 요소는 `aria-hidden`, 테이블은 `<table>` 시맨틱 태그 사용 (screen reader 친화)
- **일관성**: 기존 `kgm-purple-dark` 배경 토큰 재사용, Gmarket/Pretendard 폰트 체계 계승

## 3. 범위

### 3.1 포함 (In Scope)

- Actyon 섹션 컴포넌트(신규) + 서브 컴포넌트(chip, SpecCard, SpecList)
- Torres 섹션 컴포넌트(신규) + 테이블 컴포넌트
- 공통 `SectionChip` 컴포넌트 (블루 pill — Actyon/Torres 공통 사용)
- 공통 `DualCta` 컴포넌트 (outline 보조 + solid 주 CTA 묶음 — Actyon/Torres 공통 사용)
- Hero CTA 버튼 색상 변경 (HeroHeadline 수정)
- Tailwind 토큰 추가 (`kgm-blue-600: #0A93FF` 등)
- `_content/landing.ts` 확장 (actyon, torres 키)
- Actyon 차량 이미지 에셋 다운로드 및 `public/images/landing/actyon.png` 배치
- Smoke Test (build / typecheck / lint / dev)

### 3.2 제외 (Out of Scope)

- CTA 버튼의 실제 라우팅 연결 (상담 신청 페이지, 계산기 페이지) — 후속 피처
- 모달/드로어 UI — 후속 피처
- 백엔드 API 연동 / 동적 가격 데이터 — 후속 피처
- Lighthouse 성능 최적화 작업 — 별도 피처
- 다른 차종(Torres 전용 페이지, Actyon 전용 페이지) 상세 — 별도 피처
- 애니메이션/스크롤 인터랙션 — 별도 피처

## 4. Features

### 4.1 Feature 분해

작업 성격상 **Feature 1개**로 구성한다 (frontend-only, 동일 디렉토리, 동일 토큰 체계, 파일 수 8~10개 수준, 기존 `hero-hooking-v2`와 유사 규모).

| # | Feature | 범위 요약 | 의존성 |
|---|---------|----------|--------|
| 1 | `vehicle-hook-sections` | Actyon/Torres 두 섹션 + 공통 Chip/DualCta 컴포넌트 + Hero 버튼 색상 변경 + Tailwind 블루 토큰 | — (hero-hooking-v2 완료 전제) |

### 4.2 의존성 그래프

```
hero-hooking-v2 (archived) ──→ vehicle-hook-sections (현재)
```

### 4.3 Feature별 검증 기준 (Acceptance Criteria)

#### Feature 1: vehicle-hook-sections

**시각 검증 (Figma 대조)**
- [x] Actyon 섹션 배경 `#100f21` (kgm-purple-dark)
- [x] Actyon 섹션 Chip: 블루 솔리드(#0A93FF?) pill, "하루 6,000원에 프리미엄 하이브리드 SUV" 텍스트 중앙
- [x] Actyon 섹션 Title: Gmarket Bold, 2줄 ("월 180,550원" / "고유가 시대의 정답.")
- [x] Actyon 카드: 어두운 보조 배경 + rounded + 내부 이미지/텍스트/스펙 4줄/CTA 2버튼
- [x] Actyon 스펙 리스트: ✓ 아이콘 + 텍스트 포맷 4줄 (36개월·선수금 30%·1만 km / 취등록세,자동차세,보험료 모두 포함 / 충전 걱정, 화재 우려 없는 하이브리드 / ADAS 편의사양 기본, 쿠페형 SUV 디자인)
- [x] Actyon 카드 내 디바이더 라인 피그마 일치
- [x] Actyon CTA 2버튼: 좌 "월 납입금 계산하기"(outline), 우 "액티언HEV 상담 신청"(solid 블루)
- [x] Torres 섹션 배경 `#100f21`
- [x] Torres 섹션 Chip: 블루 pill, "티볼리 보다 싼 토레스"
- [x] Torres Title: Gmarket Bold, 2줄 ("준중현 SUV를" / "소형 SUV 가격으로.")
- [x] Torres 비교 테이블: 3열(항목/티볼리/토레스), 5행(월 납입금, 취등록세(7%), 5년 자동차세, 5년 보험료, 5년 추가 부담) + 헤더 행
- [x] Torres 컬럼 값들이 블루 강조색(#0A93FF 등)으로 하이라이트
- [x] Torres CTA 2버튼: 좌 "월 납입금 계산하기"(outline), 우 "토레스 상담 신청"(solid 블루)
- [x] Hero CTA 버튼: 기존 보라 → 블루(`#0A93FF`)로 변경, 텍스트는 "상담 신청하기" 유지

**기능 검증**
- [x] 4개 CTA 버튼 클릭 시 고유 console.debug 이벤트명 출력 (예: `actyon-calc`, `actyon-consult`, `torres-calc`, `torres-consult`)
- [x] Actyon 이미지 `alt` 속성 적절(차종명 포함)
- [x] Torres 테이블이 `<table>` 시맨틱 태그 사용, 헤더에 `<th scope="col">`
- [x] 장식 chip/icon은 `aria-hidden` 또는 적절한 label 처리
- [x] 반응형: 375px 모바일 및 540px 이상 중앙 고정 확인

**품질 검증**
- [x] `pnpm --filter @kgm-rental/frontend-b2c build` 성공
- [x] `pnpm --filter @kgm-rental/frontend-b2c typecheck` 통과
- [x] `pnpm --filter @kgm-rental/frontend-b2c lint` 통과 (0 error, 0 warning)
- [x] 기존 랜딩 Hero (Headline/EventBand/LineupImage)은 변경 없음(색상만)
- [x] 기존 페이지 라우트(`/`, `/products`, `/products/[modelSlug]`)에 영향 없음

### 4.4 통합 검증 기준 (Epic-Level)

- [x] 페이지 플로우: Hero → Actyon 섹션 → Torres 섹션 순서로 자연스럽게 스크롤 연결
- [x] Hero 블루 CTA와 Actyon/Torres 블루 요소들의 색상 일관성(동일 토큰)
- [x] dev 서버 기동 후 `/` 경로 200 OK, 모든 섹션 정상 렌더
- [x] 전체 페이지 스크롤 시 레이아웃 파손 없음 (가로 스크롤 없음, 세로만 흐름)

## 5. 성공 기준

| # | 기준 | 측정 방법 |
|---|------|-----------|
| 1 | Figma 대조 편차 < 2% | Check 단계 Design Match ≥ 98% |
| 2 | 빌드/타입/린트 모두 통과 | 자동 검증 PASS |
| 3 | CTA 4개 모두 고유 로그 호출 | devtools console 확인 |
| 4 | Hero와 후킹 섹션의 시각 통일 | 블루 강조 토큰 공유 확인 |
| 5 | 반응형 깨짐 없음 | 375px/540px/1024px에서 육안 확인 |

## 6. 리스크

| 리스크 | 영향 | 대응 |
|--------|------|------|
| Actyon 차량 이미지 에셋 누락 | 카드 렌더 불가 | Figma `get_design_context`로 에셋 URL 추출 → `public/images/landing/`에 저장 |
| Torres 비교 테이블 숫자/문구 오탈자 | 잘못된 정보 노출 | Figma 스크린샷과 1:1 대조 체크리스트 실행 |
| Hero CTA 색상 변경이 기존 테스트에 영향 | 시각 회귀 | 기존 스냅샷/스토리 없음 확인, lint만 재검증 |
| Chip/DualCta 공통 컴포넌트 추상화가 빠를 수 있음 | 오버 엔지니어링 | 두 섹션만 사용하므로 prop interface 최소, 필요 시 인라인 유지 |
| 테이블 모바일 375px에서 컬럼 좁아 가독성 저하 | 사용성 | Figma 디자인 고정 너비 기준(항목 101px, 각 열 117px) 반영, 넘침 시 내용 우선 절삭 |

---

*이 문서는 `/harness:plan vehicle-hook-sections` 단계의 산출물입니다.*
*다음 단계: `/harness:design` (첫 번째 Feature: vehicle-hook-sections)*
