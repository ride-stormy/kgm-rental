# Epic Plan: hero-hooking-v2

## Executive Summary

| 항목 | 내용 |
|------|------|
| Epic | hero-hooking-v2 |
| 작성일 | 2026. 4. 22. |
| 프로필 | blank |
| 관련 Epic | `docs/archive/2026-04/landing-and-stock-v2/` (현재 HeroSection 원본) |

### Value Delivered (4-Perspective)

| 관점 | 내용 |
|------|------|
| **Problem** | 현재 랜딩 Hero는 카피 자체에 후킹 요소("티볼리 가격으로 토레스", "커피 한 잔 값")가 있으나 시각적 전달이 차분하여 임팩트가 약하다. 랜딩 첫 화면에서 희소성·가격 혜택이 즉시 전달되지 않는다. |
| **Solution** | 피그마 디자인(node 20:781) 기준으로 Hero를 재구성: 다크 퍼플 배경 + 그라데이션 헤드라인 + 핵심 단어 밑줄·점 강조 + "400대 한정" 밴드 승격 + 차량 라인업 이미지. |
| **Function UX Effect** | 첫 화면 진입 즉시 "한정 이벤트", "가격 파격", "차량 라인업"이 3초 안에 인지됨. CTA 클릭 전환율 상승 기대. |
| **Core Value** | 카피의 후킹 의도를 시각으로 증폭 — 디자인이 카피의 감정을 번역한다. |

---

## 1. 배경 및 문제 정의

### 1.1 현재 상태

- `apps/frontend/b2c/app/_components/landing/HeroSection.tsx` 에 라이트 회색 배경 + 다크 텍스트 + BG 이미지 레이아웃으로 구현됨
- 카피 자체는 후킹 의도("티볼리 가격으로 토레스!", "하루 커피 한 잔 값")가 강하지만, 시각 위계가 평평하여 강조 단어가 읽히지 않음
- "400대 한정 이벤트"는 상단 작은 eyebrow로만 존재 → 희소성 시그널이 약함

### 1.2 목표

- 피그마 디자인 `https://www.figma.com/design/9sxH4k4w6tWb9QK7guDgzV?node-id=20-781` 기준으로 Hero 시각 전면 재구성
- 카피의 후킹 의도를 시각 강조(밑줄·점·밴드·그라데이션)로 증폭
- 하단 CTA "상담 신청하기" 유지하여 전환 경로 확보

## 2. 요구사항

### 2.1 기능 요구사항

| # | 요구사항 | 우선순위 |
|---|---------|---------|
| 1 | 다크 퍼플(#100f21) 배경 Hero 상단 블록 구현 | 높음 |
| 2 | KGM with RIDE 로고를 인라인 SVG 컴포넌트로 재작성하여 상단 배치 | 높음 |
| 3 | 헤드라인 3줄을 흰색→라이트블루 그라데이션 텍스트로 렌더링 (Gmarket Sans Bold 28px, line-height 48px) | 높음 |
| 4 | "토레스!"와 "액티언 하이브리드" 아래 그라데이션 밑줄 바(CSS linear-gradient) 배치 | 높음 |
| 5 | "한"과 "잔" 글자 위 점(dot) 2개 배치 (CSS border-radius) | 중간 |
| 6 | CTA 버튼 "상담 신청하기" (solid 퍼플 배경, 48px 높이) Hero 다크 영역 하단에 배치 | 높음 |
| 7 | 검정 배경 "400대 한정 이벤트" 밴드 (양옆 검정→흰색 그라데이션 라인) | 높음 |
| 8 | 하단 156px 차량 라인업 이미지 스트립 (`asset/carimg.png` 사용) | 높음 |
| 9 | Gmarket Sans 폰트를 Google Fonts(next/font/google)로 로드 | 높음 |
| 10 | 기존 landing.ts 콘텐츠 구조 유지하되 신규 필드 추가(장식 위치 등은 컴포넌트 내부 상수) | 중간 |

### 2.2 비기능 요구사항

- **성능**: Hero는 LCP(Largest Contentful Paint) 요소이므로 이미지 `priority` + 적절한 `sizes` 속성 필요
- **반응형**: 모바일 375px 기준 피그마 디자인 → 540px 이상에서는 중앙 고정 (기존 레이아웃과 동일)
- **접근성**: 로고에 `aria-label`, CTA 버튼에 명확한 레이블, 데코레이션 요소는 `aria-hidden`
- **빌드 영향**: Next.js build 성공, 기존 페이지 라우트 영향 없음

## 3. 범위

### 3.1 포함 (In Scope)

- `HeroSection.tsx` 전면 재작성 (3개 서브 컴포넌트로 분해: Headline / EventBand / LineupImage)
- `landing.ts` 콘텐츠 스키마 확장 (hero eyebrow 제거, 추가 필드 없음 — 기존 titleLines/cta 그대로 사용)
- 신규 이미지: `asset/carimg.png` → `apps/frontend/b2c/public/images/landing/carlineup.png`로 이동
- Gmarket Sans 폰트 도입 (`next/font/google`을 통해 layout.tsx 또는 전용 font.ts)
- 인라인 SVG 로고 컴포넌트 `LogoKgmWithRide.tsx` 신규 생성

### 3.2 제외 (Out of Scope)

- Products 섹션, Calculator 섹션의 디자인 변경
- CarItem, FilterTabs의 스타일 변경
- 백엔드 API 변경 (견적 계산 로직 무관)
- 다국어 대응
- 애니메이션 추가 (정적 구현만)
- 이후 다른 페이지에 Hero 재사용 (landing 전용)

## 4. Features

> Epic은 하나 이상의 Feature로 분해된다.

### 4.1 Feature 분해

작은 단위 UI 교체 작업이므로 **Feature 1개**로 구성한다.

| # | Feature | 범위 | 의존성 | 검증 기준 |
|---|---------|------|--------|-----------|
| 1 | `hero-hooking-v2` | HeroSection 전면 재구성 + 로고 SVG 컴포넌트 + Gmarket Sans 폰트 도입 + carlineup 이미지 배치 | 없음 (frontend only) | (1) 피그마 섹션별 스크린샷 비교 편차 없음 (2) Lighthouse 모바일 퍼포먼스 점수 유지 (3) 빌드/타입체크/lint 통과 |

### 4.2 Feature 상세

#### Feature 1: hero-hooking-v2

**목적**: 피그마 디자인에 따라 Hero를 후킹 강조 버전으로 재구성

**구현 영역**:
- `apps/frontend/b2c/app/_components/landing/HeroSection.tsx` — 3영역 조합
- `apps/frontend/b2c/app/_components/landing/hero/HeroHeadline.tsx` — 다크 퍼플 + 로고 + 헤드라인 + 장식 + CTA
- `apps/frontend/b2c/app/_components/landing/hero/HeroEventBand.tsx` — 검정 배경 "400대 한정" 밴드
- `apps/frontend/b2c/app/_components/landing/hero/HeroLineupImage.tsx` — 하단 156px 이미지 스트립
- `apps/frontend/b2c/app/_components/landing/hero/LogoKgmWithRide.tsx` — 인라인 SVG 로고
- `apps/frontend/b2c/app/layout.tsx` — Gmarket Sans 폰트 variable 주입
- `apps/frontend/b2c/public/images/landing/carlineup.png` — carimg.png 복사본

**검증 기준 (Acceptance Criteria)**:

1. **시각 검증**
   - 피그마 node 20:781과 모바일 375px 뷰포트에서 섹션별 비교 시 레이아웃 일치
   - 다크 퍼플 배경 `#100f21` 정확히 적용
   - 헤드라인 그라데이션 (흰색 → `rgb(178,203,255)`) 정확히 적용
   - 밑줄 바 2개 ("토레스!", "액티언 하이브리드" 아래) 위치·길이 피그마 일치
   - 점(dot) 2개 ("한", "잔" 위) 위치 피그마 일치
   - "400대 한정 이벤트" 밴드 양옆 그라데이션 라인 방향 (좌: 검정→흰색, 우: 흰색→검정)
   - 하단 라인업 이미지 156px 높이, 이미지 크롭 위치 피그마와 동일

2. **기능 검증**
   - CTA 버튼 클릭 시 기존 `handleCtaClick` 동일 동작 (console.debug 또는 추후 라우팅)
   - 로고 SVG 접근성 속성 (`aria-label="KGM with RIDE"`) 존재
   - 모바일 375px / 태블릿 540px / 데스크톱 중앙 고정 확인

3. **품질 검증**
   - `pnpm --filter @kgm-rental/frontend-b2c build` 성공
   - `pnpm --filter @kgm-rental/frontend-b2c typecheck` 통과
   - `pnpm --filter @kgm-rental/frontend-b2c lint` 통과
   - LCP 요소(하단 이미지 또는 로고) 적절한 priority 지정

4. **Vercel 배포 검증**
   - 프리뷰 배포 성공
   - 프로덕션 도메인에서 Hero 정상 렌더링

---

## 5. 진행 체크리스트

- [ ] Plan 승인
- [ ] Design 문서 작성 (피그마 상세 레이아웃 트리 포함)
- [ ] 구현 (Do)
- [ ] 피그마 섹션별 비교 검증 (Check)
- [ ] Vercel 프리뷰 배포 확인
- [ ] Report 작성
- [ ] Archive
