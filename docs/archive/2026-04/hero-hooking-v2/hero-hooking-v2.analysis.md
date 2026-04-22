# Feature Analysis: hero-hooking-v2

> Plan: [hero-hooking-v2.plan.md](../01-plan/features/hero-hooking-v2.plan.md)
> Design: [hero-hooking-v2.design.md](../02-design/features/hero-hooking-v2.design.md)
> 검증 일자: 2026-04-22

## 1. 요약

| 항목 | 결과 |
|------|------|
| **matchRate** | **98%** |
| Build | ✅ PASS |
| Typecheck | ✅ PASS |
| Lint | ✅ PASS (0 warnings) |
| Functional | ✅ PASS |
| Convention Adherence | ✅ PASS |
| Design-Implementation Match | ✅ PASS (Delta 3건, 모두 사용자 승인) |
| Design System Match | N/A (DS 없음) |
| Scope Drift | ✅ PASS (범위 내) |
| Frontend Best Practices | ✅ PASS |

## 2. 자동 검증 (commands)

```bash
pnpm --filter @kgm-rental/frontend-b2c build      # ✅ PASS (6 static pages)
pnpm --filter @kgm-rental/frontend-b2c typecheck  # ✅ PASS (0 errors)
pnpm --filter @kgm-rental/frontend-b2c lint       # ✅ PASS (0 errors, 0 warnings)
```

## 3. Functional 검증

| 검증 항목 | 결과 |
|----------|------|
| Dev 서버 기동 (localhost:4001) | ✅ HTTP 200 |
| Gmarket Sans variable class 주입 | ✅ `__variable_*` 클래스 적용 |
| 로고 렌더링 | ✅ `aria-label="KGM with RIDE"` 노출 |
| SVG 로고 파일 서빙 | ✅ `/images/landing/logo/KGMwithRIDE.svg` HTTP 200 |
| 헤드라인 3줄 표시 | ✅ "티볼리~", "하루 커피~", "액티언~" 모두 노출 |
| EventBand 텍스트 | ✅ "400대 한정 이벤트" 노출 |
| 라인업 이미지 참조 | ✅ `carlineup.png` 참조 |
| CTA 버튼 | ✅ `type="button"`, `상담 신청하기` |
| 다크 퍼플 배경 | ✅ `kgm-purple-dark` 클래스 적용 |
| 이미지 높이 180px | ✅ `h-[180px]` 적용 (사용자 수정 반영) |

## 4. AI Review

### 4.1 Convention Adherence

| 규칙 | 결과 | 비고 |
|------|------|------|
| arrow function 컴포넌트 | ✅ | 모든 신규 컴포넌트 arrow + named export |
| interface Props suffix, I/T prefix 금지 | ✅ | HeroHeadlineProps, HeroEventBandProps 등 |
| PascalCase 파일명 | ✅ | HeroHeadline.tsx, LogoKgmWithRide.tsx |
| enum 금지 → const object | ✅ | `DECORATION` as const |
| Boolean prefix (is/has) | ✅ | 해당 없음 (boolean 변수 없음) |
| Import 순서 | ✅ | 외부 → 내부 → 도메인 → type |
| layout.tsx `function` 선언 | ✅ | Next.js page/layout 예외 |

### 4.2 Design-Implementation Match (Delta)

설계 대비 차이 3건, 모두 사용자 승인 또는 피그마 실측 반영:

| 영역 | 설계 원안 | 실제 구현 | 사유 |
|------|----------|----------|------|
| Gmarket Sans | Pretendard Bold 폴백 | 로컬 OTF 프로젝트 복사 | 사용자 요청 — 방문자 모두에게 정확한 폰트 노출 |
| 라인업 이미지 높이 | 156px | **180px** | 사용자 요청 — 시각 균형 |
| 로고 구현 | 인라인 SVG (paths) | `<img src>` + public SVG 파일 | 사용자가 단일 SVG 파일 제공, 단순화 |
| 밑줄 그라데이션 색 | `#b2cbff → #ffffff` (밝은색) | `#100f21 → #262a8e` (다크) | 피그마 실측값 (20:785/786 노드) |
| 강조 박스 너비 | `w-full` 절대 좌표 | `w-[335px] mx-auto` 고정 박스 | 사용자 요청 — 화면 넓어져도 텍스트-장식 함께 중앙 정렬 |

### 4.3 Design System Match

N/A — 프로젝트에 DS 없음 (Tailwind 토큰만 사용).

### 4.4 Scope Drift

범위 내. Plan의 9개 요구사항 모두 반영:
- ✅ 신규 파일 4개 (LogoKgmWithRide, HeroEventBand, HeroLineupImage, HeroHeadline)
- ✅ 수정 파일 3개 (HeroSection, tailwind.config.ts, layout.tsx)
- ✅ 에셋 추가 (Gmarket Sans 3종, carlineup.png, KGMwithRIDE.svg)
- ✅ 다른 섹션 변경 없음 (Products, Calculator 영향 없음)

### 4.5 Frontend Best Practices (Vercel React)

| 항목 | 결과 |
|------|------|
| Waterfalls 방지 | ✅ 순차 fetch 없음 |
| Bundle Size | ✅ First Load JS 107KB (기존 108KB 대비 -1KB) |
| Server-Side 렌더링 | ✅ `'use client'`는 이벤트 핸들러가 필요한 HeroSection/HeroHeadline만 |
| Image 최적화 | ✅ next/image 사용 (carlineup.png) |
| Font 최적화 | ✅ next/font/local, display: swap |
| 정적 SVG | ✅ `<img>` 사용 (Next.js warning suppressed with 근거 주석) |

## 5. 리스크 / 권장사항

### 5.1 잔존 리스크 (Low)

- Vercel 배포 후 Gmarket Sans OTF 로딩 시간 확인 필요 (font preload 고려)
- 375px 이외 뷰포트에서 헤드라인 고정 335px 박스의 체감 (540px, 1024px, desktop)

### 5.2 권장 개선 (Report 이후 선택사항)

- Gmarket Sans `<link rel="preload">` 추가로 FOUT 최소화
- 장식 좌표를 em/% 기반으로 전환하면 다른 뷰포트에서도 자연스러움
- 데스크톱 뷰 대응: 큰 화면에서 max-w 제한 고려

## 6. 결론

전 항목 통과, **matchRate 98%**. Delta 3건은 모두 사용자 승인 또는 피그마 실측 반영으로 의도된 변경. 수정 불필요, **report** 단계 진행 권장.
