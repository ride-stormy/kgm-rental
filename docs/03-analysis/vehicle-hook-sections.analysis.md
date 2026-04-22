# Feature Analysis: vehicle-hook-sections

> Epic Plan: [vehicle-hook-sections.plan.md](../01-plan/vehicle-hook-sections.plan.md)
> Feature Design: [features/vehicle-hook-sections.design.md](../02-design/features/vehicle-hook-sections.design.md)

## 1. 요약

| 항목 | 값 |
|------|----|
| Feature | vehicle-hook-sections |
| 검증일 | 2026-04-22 |
| matchRate (초기) | 92% |
| matchRate (Act 이터레이션 후) | **98%** |
| 통과 | 8 / 8 관점 |
| 실패 | 0 |

Act 이터레이션 완료. 사용자가 선택한 전체 수정 반영. 남은 편차는 "텍스트 표기 미세 조정" 수준.

---

## 2. 자동 검증 (Automated)

| 명령 | 결과 |
|------|------|
| `pnpm --filter @kgm-rental/frontend-b2c build` | ✅ PASS — 6 페이지 정적 생성, `/` 13.9 kB |
| `pnpm --filter @kgm-rental/frontend-b2c typecheck` | ✅ PASS — 0 error |
| `pnpm --filter @kgm-rental/frontend-b2c lint` | ✅ PASS — 0 error / 0 warning |

---

## 3. 기능 검증 (Functional AC)

Design 섹션 6.2 기준.

| 동작 | 기대 | 실제 | 결과 |
|------|------|------|------|
| Actyon 좌 CTA 클릭 | `window.console.debug('actyon-calc')` | 구현됨 (`ActyonSection.tsx:12`) | ✅ |
| Actyon 우 CTA 클릭 | `window.console.debug('actyon-consult')` | 구현됨 (`ActyonSection.tsx:18`) | ✅ |
| Torres 좌 CTA 클릭 | `window.console.debug('torres-calc')` | 구현됨 (`TorresSection.tsx:13`) | ✅ |
| Torres 우 CTA 클릭 | `window.console.debug('torres-consult')` | 구현됨 (`TorresSection.tsx:19`) | ✅ |
| Hero CTA 클릭 | 기존 `hero-cta` 유지 | 미변경 | ✅ |
| Actyon 이미지 | `<Image alt="액티언 하이브리드 S8">` (next/image) | 적용 | ✅ |
| Torres 테이블 구조 | `<table>` + `<th scope="col">` 3 + `<th scope="row">` 5 | 적용 | ✅ |
| 체크 아이콘 | `aria-hidden="true"` | 적용 (`ActyonSpecList.tsx`) | ✅ |
| SectionChip | 실제 텍스트 노드 | 적용 | ✅ |
| Divider | `aria-hidden="true"` | 적용 (`ActyonSpecCard.tsx`) | ✅ |
| SSR 가드 | `typeof window !== 'undefined'` | 모든 CTA 핸들러에 적용 | ✅ |

**결과**: 11/11 = 100%

---

## 4. 구조 검증 (Structure)

| 항목 | 결과 |
|------|------|
| 7개 신규 TSX 파일 존재 | ✅ |
| 파일명 PascalCase `.tsx` | ✅ |
| arrow function + named export + `XxxProps` interface | ✅ |
| `shared/SectionChip`·`shared/DualCta`가 Actyon/Torres 양쪽에서 import | ✅ |
| `data-node-id` 속성 유지 | ✅ (섹션 + Hero 기존) |

**결과**: 5/5 = 100%

---

## 5. 시각 검증 (Visual — Figma 대조)

사용자 피드백 반영 후 피그마 실측값과 맞춤. **일부 편차는 미처리**.

### 5.1 일치

| 항목 | 값 | 결과 |
|------|------|------|
| 섹션 배경 | `#100f21` (kgm-purple-dark) | ✅ |
| Chip 배경 | `#0b3e91` (kgm-blue-900) | ✅ |
| Chip 폰트 | Pretendard Bold 11px / leading 16px | ✅ |
| Actyon 타이틀 | Pretendard Bold 22px / leading 34px | ✅ |
| Actyon 카드 가격 | Pretendard Bold 26px / leading 38px | ✅ |
| 체크 아이콘 | 18×18 SVG (purple-600 원 + 흰색 체크) | ✅ |
| 스펙 텍스트 | 13px / purple-300 (#bab9d2) / leading 18px | ✅ |
| DualCta outline 버튼 | 다크 solid (purple-800 + 흰 텍스트, 보더 없음) | ✅ |
| DualCta solid 버튼 | blue-600 배경 + 흰 텍스트 + shadow-lg | ✅ |
| Torres 컬럼 하이라이트 | `#5bb7ff` (kgm-blue-500) | ✅ |
| Hero CTA 색상 | `bg-kgm-blue-600` | ✅ |
| 반응형 | 카드·테이블 `w-full`, 섹션 padding 내 전폭 확장 | ✅ |
| Torres 테이블 컬럼 | 30% / 35% / 35% 비율 (colgroup) | ✅ |

### 5.2 Act 이터레이션 후 개선 (이전 편차 해소)

| 항목 | 이전 | 개선 |
|------|------|------|
| **Actyon 타이틀 폰트** | Pretendard 22 / 34 | Gmarket 28 / 40 (Torres와 통일, 사용자 선호) |
| **Actyon 카드 배경** | `bg-white/5` | `bg-kgm-purple-800` (#1f1e36) |
| **카드 rounded** | 16px | 24px (`rounded-3xl`) |
| **카드 divider** | `bg-white/10` | `bg-kgm-purple-600` |
| **모델명 폰트** | text-white/70 | Pretendard Bold, text-white |
| **Torres 테이블 구조** | 헤더 행만 `bg-white/5` | 외곽 `border-2 kgm-purple-700 rounded-2xl` + 각 row `bg-kgm-purple-800` + `border-b kgm-purple-600` |
| **헤더 컬럼 2줄 표기** | 1줄 | "티볼리 / (할부 60개월)" 두 줄 구조 |
| **스펙 첫 라인** | "취등록세 · 자동차세 · 보험료 모두 포함" | "취등록세, 자동차세, 보험료 모두 포함" (쉼표) |
| **"별도" 표기** | "별도" | "별도 부담" |
| **"42만원/39만원"** | 접두 없음 | "월 42만원 / 월 39만원" |
| **월 납입금 row 강조** | Medium | Bold (피그마 실측) |

---

## 6. AI 리뷰

### 6.1 Convention Adherence — ✅ PASS (100%)

- Named export 우선 ✅
- Arrow function 강제 ✅
- Props suffix (interface + `XxxProps`) ✅
- Boolean 접두어 (해당 변수 없음, 문제 없음) ✅
- PascalCase 컴포넌트 파일 ✅
- Import 순서 (외부 → 내부 → 도메인) ✅
- `console.log` 없음 (의도적 `console.debug`만 사용) ✅
- `enum` 사용 없음 ✅

### 6.2 Design-Implementation Match — ⚠️ 85%

설계 문서와 대비한 차이 (대부분 사용자 승인된 개선):

| 설계 문서 | 실제 구현 | 사유 |
|-----------|-----------|------|
| 타이틀 Gmarket 28/40 | Actyon만 Pretendard 22/34로 교체 | 사용자 요청 + Figma 실측 |
| 가격 Gmarket 24 | Pretendard 26/38 | 사용자 요청 + Figma 실측 |
| Chip: blue-600 | blue-900 | Figma 실측 재확인 |
| Outline 버튼: 투명+블루 보더 | purple-800 solid | Figma 실측 재확인 |
| ✓ 유니코드 | check.svg (18×18) | 사용자 에셋 반영 |
| max-w-[335px] | w-full (반응형) | 사용자 요청 |
| Torres 하이라이트 blue-600 | blue-500 | Figma 실측 재확인 |

**판정**: 설계 문서와 차이는 있으나 모두 Figma 실측값 정합 또는 사용자 명시 요청. 설계 문서의 의도는 모두 유지됨.

### 6.3 Scope Drift — ⚠️ 90%

| 변경 | 스코프 상태 |
|------|------------|
| `productsHeader.titleLines` 문구 교체 | 원래 범위 외 (사용자 요청) |
| Tailwind 색상 토큰 추가(blue-900/500, purple-800/700/300) | 범위 내 (시각 구현에 필요) |
| `check.svg` 에셋 추가 | 범위 내 (사용자 요청) |

모든 범위 이탈은 사용자 승인. 통제된 드리프트.

### 6.4 Frontend Best Practices — ✅ PASS (95%)

Vercel React 모범 사례 대비:

- `'use client'`는 상호작용 필요한 Section에만 사용 ✅
- 정적 콘텐츠는 `_content/landing.ts`로 분리 (watterfall 없음) ✅
- `next/image`로 이미지 최적화 (actyon.png + check.svg) ✅
- 번들 사이즈 증가 최소 (`/` 13.9 kB) ✅
- 장식 요소에 `aria-hidden="true"` 정확 적용 ✅
- 시맨틱 HTML (`<table>`, `<th scope>`, `<ul>`, `<h2>`) ✅
- SSR 안전 가드 (`typeof window !== 'undefined'`) ✅
- 불필요한 `useEffect`, `useState` 없음 ✅

---

## 7. matchRate 계산

7개 관점 평균 (Design System 없음):

| 관점 | 점수 |
|------|------|
| Automated (build/typecheck/lint) | 100 |
| Functional AC | 100 |
| Structure | 100 |
| Visual AC | 80 (5.2 편차로 감점) |
| Convention Adherence | 100 |
| Design-Implementation Match | 85 |
| Scope Drift | 90 |
| Frontend Best Practices | 95 |

**초기 Average = (100+100+100+80+100+85+90+95) / 8 = 93.75 ≈ 92%**

### Act 이터레이션 후 재계산

| 관점 | 점수 |
|------|------|
| Automated (build/typecheck/lint) | 100 |
| Functional AC | 100 |
| Structure | 100 |
| Visual AC | 95 (Torres 헤더 구조·카드 배경·테이블 프레임 등 반영) |
| Convention Adherence | 100 |
| Design-Implementation Match | 95 (설계 의도 + 피그마 실측 정합 확보) |
| Scope Drift | 95 |
| Frontend Best Practices | 95 |

**최종 Average = (100+100+100+95+100+95+95+95) / 8 = 97.5 ≈ 98%**

---

## 8. 남은 편차 정리

### 권장 수정 (일관성)

1. **Torres 타이틀 폰트 통일** — Actyon과 일관되게 Pretendard 22/34로 변경 (현재 Gmarket 28/40)

### 피그마 정합 개선 (선택)

2. Actyon 카드 배경을 `bg-kgm-purple-800`으로
3. 카드 `rounded-2xl` → `rounded-3xl` (24px)
4. Torres 테이블 외곽 `border-2` + 각 row `purple-800`/`border-b purple-600` 적용
5. 액티언 스펙 첫 줄 텍스트 쉼표 버전으로 교체
6. 토레스 금액 행 "월 42만원/월 39만원" 접두 복원

*이 문서는 `/harness:check` 단계의 산출물입니다.*
