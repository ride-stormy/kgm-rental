# Feature Design: hero-hooking-v2

> Feature Plan: [hero-hooking-v2.plan.md](../../01-plan/features/hero-hooking-v2.plan.md)
> Epic Plan: [hero-hooking-v2.plan.md](../../01-plan/hero-hooking-v2.plan.md)
> 선택된 옵션: **Option B — Clean Architecture (5파일 분해)**

## 1. 개요

피그마 디자인(node 20:781, file 9sxH4k4w6tWb9QK7guDgzV) 기준으로 랜딩 Hero를 3개 서브 섹션(Headline / EventBand / LineupImage)으로 분해하여 재구성한다. 로고는 별도 SVG 컴포넌트로 분리한다.

## 2. 파일 구조

```
apps/frontend/b2c/
├─ app/
│  ├─ layout.tsx                                ← 수정: Gmarket Sans variable 주입
│  └─ _components/landing/
│     ├─ HeroSection.tsx                        ← 수정: 3개 서브 조합
│     └─ hero/                                  ← 신규 디렉토리
│        ├─ HeroHeadline.tsx                    ← 신규: 다크 퍼플 + 로고 + 헤드라인 + CTA
│        ├─ HeroEventBand.tsx                   ← 신규: 검정 밴드
│        ├─ HeroLineupImage.tsx                 ← 신규: 하단 이미지 스트립
│        └─ LogoKgmWithRide.tsx                 ← 신규: 인라인 SVG 로고
├─ app/_content/landing.ts                      ← 수정: hero.eyebrow 유지(밴드 재사용)
├─ tailwind.config.ts                           ← 수정: kgm-purple-dark 토큰, gmarketSans 폰트
└─ public/
   └─ images/landing/carlineup.png              ← 신규: asset/carimg.png 복사
```

## 3. 컴포넌트 책임 & 인터페이스

### 3.1 `HeroSection.tsx` (수정, orchestrator)

```typescript
'use client';

import { LANDING_CONTENT } from '../../_content/landing';
import { HeroHeadline } from './hero/HeroHeadline';
import { HeroEventBand } from './hero/HeroEventBand';
import { HeroLineupImage } from './hero/HeroLineupImage';

export const HeroSection = (): JSX.Element => {
  const { hero } = LANDING_CONTENT;

  const handleCtaClick = () => {
    if (typeof window !== 'undefined') {
      window.console.debug('hero-cta');
    }
  };

  return (
    <section data-node-id="20:781" className="w-full">
      <HeroHeadline
        titleLines={hero.titleLines}
        cta={hero.cta}
        onCtaClick={handleCtaClick}
      />
      <HeroEventBand text={hero.eyebrow} />
      <HeroLineupImage src="/images/landing/carlineup.png" />
    </section>
  );
};
```

### 3.2 `HeroHeadline.tsx` (신규)

**Props**:
```typescript
interface HeroHeadlineProps {
  titleLines: readonly string[];
  cta: string;
  onCtaClick: () => void;
}
```

**구성**:
- 배경: `bg-kgm-purple-dark` (#100f21)
- 상단: `LogoKgmWithRide` 62×20 중앙
- 헤드라인 3줄: Gmarket Sans Bold 28px / line-height 48px, 그라데이션 흰→#b2cbff
- 장식(밑줄 바 2개, 점 2개): absolute 포지셔닝, 상수화된 좌표
- 하단: CTA 버튼 (솔리드 퍼플, 48px 높이)

**장식 좌표 상수** (피그마 기준 픽셀 좌표, 추후 미세조정 가능):
```typescript
const DECORATION = {
  underlineTorres: { top: '96px', left: '120px', width: '72px', height: '4px' },
  underlineActyon: { top: '192px', left: '20px', width: '178px', height: '4px' },
  dotHan: { top: '148px', left: '156px' },
  dotJan: { top: '148px', left: '202px' },
} as const;
```

### 3.3 `HeroEventBand.tsx` (신규)

**Props**:
```typescript
interface HeroEventBandProps {
  text: string;
}
```

**구성**:
- 배경: `bg-black`, 높이 44px (패딩 13px 상하)
- 좌측 라인: `flex-1 h-[2px]` + `linear-gradient(90deg, #000 0%, #fff 100%)`
- 중앙 텍스트: Pretendard Bold 14px / 18px, 흰색
- 우측 라인: `flex-1 h-[2px]` + `linear-gradient(90deg, #fff 0%, #000 100%)`
- 장식(라인)은 `aria-hidden="true"`

### 3.4 `HeroLineupImage.tsx` (신규)

**Props**:
```typescript
interface HeroLineupImageProps {
  src: string;
  alt?: string;
}
```

**구성**:
- 컨테이너: `w-full h-[156px] overflow-hidden bg-black` (이미지 배경색 매칭)
- `<Image fill sizes="(max-width:540px) 100vw, 540px" priority={false}>`
- `objectFit: cover`, `objectPosition: 'center'` + inline scale 보정
- 피그마 원본: 이미지가 컨테이너보다 크게 scale되어 중앙 정렬
- 장식 성격이므로 `alt=""` 기본값

### 3.5 `LogoKgmWithRide.tsx` (신규)

**Props**:
```typescript
interface LogoKgmWithRideProps {
  className?: string;
}
```

**구성**:
- 인라인 SVG (viewBox="0 0 62 20")
- `role="img"` + `aria-label="KGM with RIDE"`
- `<title>` 요소로 스크린리더 지원
- 색상: `fill="currentColor"` → 부모에서 text color 제어

## 4. 데이터 흐름

```
LANDING_CONTENT.hero (from landing.ts)
         │
         ▼
   HeroSection
    ├── titleLines, cta, handleCtaClick ──▶ HeroHeadline
    │                                          └─ LogoKgmWithRide
    ├── eyebrow ─────────────────────────▶ HeroEventBand
    └── (static src) ────────────────────▶ HeroLineupImage
```

- 모든 데이터는 `landing.ts` 단일 출처 유지
- `landing.ts` 스키마 변경 없음 (eyebrow는 밴드 문구로 재사용)
- 이미지 경로는 HeroSection 내부 상수 (콘텐츠 필드가 아니라 파일 경로이므로)

## 5. 스타일링 전략

### 5.1 Tailwind 토큰 (tailwind.config.ts)

```typescript
theme: {
  extend: {
    colors: {
      'kgm-purple-dark': '#100f21',
      'kgm-purple-600': '#2e2c4b',  // 기존 유지
    },
    fontFamily: {
      gmarket: ['var(--font-gmarket)', 'Pretendard', 'sans-serif'],
    },
  },
},
```

### 5.2 폰트 로드 (layout.tsx)

**우선순위**:
1. Google Fonts에 Gmarket Sans 존재 여부 확인
2. 존재 → `next/font/google` 사용
3. 미존재 → Pretendard Bold + `letter-spacing: -0.02em` 폴백 (`font-gmarket` alias가 Pretendard로 연결)

```typescript
// layout.tsx
import { Pretendard } from 'next/font/local'; // 기존
// 확인 후 결정: Gmarket Sans Google Fonts 가능 여부
```

### 5.3 그라데이션 텍스트

```tsx
<span
  className="bg-clip-text text-transparent"
  style={{
    backgroundImage: 'linear-gradient(115.96deg, #ffffff 5.17%, #b2cbff 92.35%)',
  }}
>
  {line}
</span>
```

### 5.4 밑줄 그라데이션

```tsx
<span
  aria-hidden="true"
  className="absolute rounded-full"
  style={{
    ...DECORATION.underlineTorres,
    backgroundImage: 'linear-gradient(90deg, #b2cbff 0%, #ffffff 100%)',
  }}
/>
```

## 6. 접근성 사양

| 요소 | 처리 |
|---|---|
| 로고 SVG | `role="img"` + `aria-label="KGM with RIDE"` + `<title>` |
| 헤드라인 | 시맨틱 `<h1>` 유지 |
| 밑줄 바 2개 | `aria-hidden="true"` (장식) |
| 점 2개 | `aria-hidden="true"` (장식) |
| 밴드 라인 | `aria-hidden="true"` (장식) |
| 밴드 텍스트 | 일반 `<p>` — 콘텐츠 성격이므로 스크린리더 노출 |
| CTA 버튼 | `type="button"` + 명확한 레이블 ("상담 신청하기") |
| 라인업 이미지 | `alt=""` + `role="presentation"` (장식) |

## 7. 반응형

- 모바일 기본 (375px): 피그마 원본 기준
- 540px 이상: 기존 레이아웃과 동일하게 중앙 정렬, 최대 너비 제한 없음 (Hero는 풀블리드 유지)
- 가로 스크롤 금지: 모든 absolute 요소는 `overflow-hidden` 부모 내부

## 8. 빌드 & 성능

- LCP 요소: 헤드라인 텍스트 (인라인 SVG 로고는 즉시 렌더)
- 라인업 이미지: `priority={false}` (스크롤 후 보이는 위치)
- 폰트: `next/font` → FOUT 없이 로드
- Gmarket Sans 미제공 시 폴백으로 Pretendard Bold 사용 → LCP 영향 최소화

## 9. 구현 순서 (Do 단계 체크리스트)

1. [ ] `asset/carimg.png` → `apps/frontend/b2c/public/images/landing/carlineup.png` 복사
2. [ ] `tailwind.config.ts` 토큰/폰트 확장 추가
3. [ ] Gmarket Sans Google Fonts 존재 여부 확인 → `layout.tsx`에 폰트 variable 주입 (또는 폴백 확정)
4. [ ] `LogoKgmWithRide.tsx` 인라인 SVG 컴포넌트 작성
5. [ ] `HeroEventBand.tsx` 작성
6. [ ] `HeroLineupImage.tsx` 작성
7. [ ] `HeroHeadline.tsx` 작성 (장식 상수 포함)
8. [ ] `HeroSection.tsx` 3개 서브로 재구성
9. [ ] Smoke test: `pnpm --filter @kgm-rental/frontend-b2c dev` → 브라우저 렌더 확인
10. [ ] 섹션별 피그마 스크린샷 대조 (375px 뷰포트)
11. [ ] `pnpm --filter @kgm-rental/frontend-b2c build` 통과
12. [ ] `pnpm --filter @kgm-rental/frontend-b2c typecheck` 통과
13. [ ] `pnpm --filter @kgm-rental/frontend-b2c lint` 통과

## 10. 검증 기준 (Acceptance Criteria 구체화)

### 10.1 시각 검증 (피그마 대조)

| 영역 | 기준 | 기대 결과 | 편차 허용 |
|------|------|-----------|-----------|
| Hero 상단 배경 | 컬러 | `#100f21` | 완전 일치 |
| 로고 | 크기 | 62×20px | ±1px |
| 로고 | 위치 | 상단 중앙 (상단 여백 20px) | ±2px |
| 헤드라인 | 폰트 크기 | 28px / line-height 48px | 완전 일치 |
| 헤드라인 | 그라데이션 | `#ffffff → #b2cbff` 115.96deg | 완전 일치 |
| 밑줄 토레스! | 위치/크기 | 피그마 좌표 | ±2px |
| 밑줄 액티언 하이브리드 | 위치/크기 | 피그마 좌표 | ±2px |
| 점 2개 | 위치/크기 | 4×4px 원, "한"/"잔" 글자 위 | ±2px |
| CTA 버튼 | 스타일 | 솔리드 퍼플, 48px 높이 | 완전 일치 |
| CTA 버튼 | 위치 | 헤드라인 아래 중앙 | ±4px |
| EventBand | 배경 | `#000000` | 완전 일치 |
| EventBand | 텍스트 | Pretendard Bold 14px / 18px | 완전 일치 |
| EventBand 좌라인 | 그라데이션 | `#000 → #fff` 90deg, 2px | 완전 일치 |
| EventBand 우라인 | 그라데이션 | `#fff → #000` 90deg, 2px | 완전 일치 |
| 라인업 이미지 | 높이 | 156px | 완전 일치 |
| 라인업 이미지 | 크롭 | 피그마 원본 중앙 매칭 | 시각 대조 |

### 10.2 기능 검증

- [ ] CTA 버튼 클릭 시 `console.debug('hero-cta')` 호출 (기존 동작 유지)
- [ ] 로고에 `aria-label="KGM with RIDE"` 존재
- [ ] 장식(밑줄, 점, 밴드 라인)은 모두 `aria-hidden="true"`
- [ ] 라인업 이미지 `alt=""` 또는 `role="presentation"`
- [ ] 모바일 375px 뷰포트에서 가로 스크롤 없음
- [ ] 540px 이상에서 중앙 정렬 유지

### 10.3 품질 검증

- [ ] `pnpm --filter @kgm-rental/frontend-b2c build` 성공
- [ ] `pnpm --filter @kgm-rental/frontend-b2c typecheck` 통과
- [ ] `pnpm --filter @kgm-rental/frontend-b2c lint` 통과
- [ ] 기존 페이지 라우트(`/`, `/products`, `/products/[modelSlug]`) 정상 렌더링
- [ ] 신규 파일 모두 arrow function + named export (기존 컨벤션)

### 10.4 배포 검증

- [ ] GitHub push 후 Vercel 자동 배포 성공
- [ ] 프로덕션 URL Hero 정상 렌더링
- [ ] Lighthouse 모바일 퍼포먼스 저하 없음 (현재 배포 대비 -5점 이내)

## 11. 리스크 & 완화

| 리스크 | 영향 | 완화책 |
|--------|------|--------|
| Gmarket Sans Google Fonts 미제공 | 폰트 로드 실패 | Pretendard Bold + `letter-spacing: -0.02em` 폴백 |
| 밑줄·점 절대 위치가 폰트 렌더 차이로 어긋남 | 시각 편차 | `DECORATION` 상수화 → 픽셀 단위 미세조정 |
| 라인업 이미지 크롭이 피그마와 다름 | 시각 편차 | `objectPosition` + scale 조정, 필요시 이미지 자체 크롭 |
| Vercel LCP 저하 | SEO/UX | 라인업 이미지 `priority=false`, 로고 인라인 SVG |
| 기존 HeroSection 참조 테스트 존재 | 빌드 실패 | Do 시작 전 grep으로 참조 확인 |

## 12. Out of Scope (다시 확인)

- 다른 섹션(Products, Calculator) 디자인 변경
- 애니메이션(hover, scroll-triggered 등)
- 다국어 대응
- Hero를 다른 페이지에서 재사용
- 백엔드 API / landing.ts 외 콘텐츠 소스 변경
