# Feature Plan: hero-hooking-v2

> Epic Plan: [hero-hooking-v2.plan.md](../hero-hooking-v2.plan.md)

## 범위

피그마 디자인 (node 20:781, file 9sxH4k4w6tWb9QK7guDgzV) 기준으로 랜딩 페이지 HeroSection을 전면 재구성.

### 구현 대상 (생성/수정 파일)

| 구분 | 경로 | 내용 |
|------|------|------|
| 수정 | `apps/frontend/b2c/app/_components/landing/HeroSection.tsx` | 3개 서브 컴포넌트 조합으로 재구성 |
| 신규 | `apps/frontend/b2c/app/_components/landing/hero/HeroHeadline.tsx` | 다크 퍼플 + 로고 + 헤드라인 + 밑줄·점 + CTA |
| 신규 | `apps/frontend/b2c/app/_components/landing/hero/HeroEventBand.tsx` | 검정 배경 "400대 한정 이벤트" 밴드 |
| 신규 | `apps/frontend/b2c/app/_components/landing/hero/HeroLineupImage.tsx` | 하단 156px 차량 라인업 이미지 |
| 신규 | `apps/frontend/b2c/app/_components/landing/hero/LogoKgmWithRide.tsx` | 인라인 SVG 로고 컴포넌트 |
| 수정 | `apps/frontend/b2c/app/layout.tsx` | Gmarket Sans 폰트 variable 주입 |
| 수정 | `apps/frontend/b2c/tailwind.config.ts` | Gmarket Sans 토큰, kgm-purple 토큰(#100f21 등) |
| 수정 | `apps/frontend/b2c/app/_content/landing.ts` | hero 콘텐츠 정리 (titleLines 유지, eyebrow 유지 — 밴드 문구로 재사용) |
| 신규 | `apps/frontend/b2c/public/images/landing/carlineup.png` | `asset/carimg.png` 복사 |

## 의존성

- 없음. 기존 frontend-b2c 패키지 내부 수정만. api-contracts, backend 변경 없음.

## 검증 기준 (Acceptance Criteria)

### 1. 시각 검증 (섹션별 피그마 대조)

| 영역 | 기준 | 기대 결과 |
|------|------|-----------|
| Hero 상단 블록 | 배경색 | `#100f21` |
| 로고 | 위치 / 크기 | 상단 중앙, 62×20px |
| 헤드라인 | 폰트 | Gmarket Sans Bold 28px / 48px line-height |
| 헤드라인 | 컬러 | `linear-gradient(115.96deg, #ffffff 5.17%, #b2cbff 92.35%)` bg-clip-text |
| 밑줄 바 (토레스!) | 위치 | headline 좌표 기준 피그마 일치 |
| 밑줄 바 (액티언 하이브리드) | 위치 | headline 좌표 기준 피그마 일치 |
| 점 dot 2개 | 위치 | "한", "잔" 글자 위, 4px 원 |
| CTA 버튼 | 스타일 | solid 퍼플 배경, 48px 높이, "상담 신청하기" 텍스트 |
| EventBand | 배경 | `#000000` |
| EventBand 텍스트 | 폰트 | Pretendard Bold 14px / 18px |
| EventBand 라인 | 그라데이션 | 좌: black→white, 우: white→black, 높이 2px |
| 라인업 이미지 | 높이 | 156px |
| 라인업 이미지 | 크롭 | 피그마 원본 이미지 296% 확대, -158% 오프셋 동일 |

### 2. 기능 검증

- [ ] CTA 버튼 클릭 시 기존 동작 유지 (`handleCtaClick`)
- [ ] 로고에 `aria-label="KGM with RIDE"` 존재
- [ ] 장식(밑줄, 점, 라인)은 `aria-hidden="true"` 처리
- [ ] 반응형: 모바일 375px / 540px 이상 중앙 고정

### 3. 품질 검증

- [ ] `pnpm --filter @kgm-rental/frontend-b2c build` 성공
- [ ] `pnpm --filter @kgm-rental/frontend-b2c typecheck` 통과
- [ ] `pnpm --filter @kgm-rental/frontend-b2c lint` 통과
- [ ] 기존 페이지 라우트(`/`, `/products`, `/products/[modelSlug]`) 영향 없음

### 4. 배포 검증

- [ ] GitHub push 후 Vercel 자동 배포 성공
- [ ] 프로덕션 URL에서 Hero 정상 렌더링
- [ ] Lighthouse 모바일 퍼포먼스 점수 저하 없음 (기준: 현재 배포 버전 대비 -5점 이내)

## 리스크 & 완화

| 리스크 | 완화책 |
|--------|--------|
| Gmarket Sans Google Fonts 미제공 | 미제공 시 Pretendard Bold + letter-spacing으로 fallback |
| 밑줄 바 위치를 absolute로 고정 시 폰트 렌더링 차이로 어긋남 | CSS custom property 변수화하여 미세 조정 가능하게 |
| Vercel LCP 저하 | 라인업 이미지 `priority=false` + 로고는 인라인 SVG로 즉시 렌더링 |
| 기존 HeroSection 코드에 의존하는 테스트/스토리 존재 가능성 | 초기 조사 단계에서 grep으로 참조 확인 |
