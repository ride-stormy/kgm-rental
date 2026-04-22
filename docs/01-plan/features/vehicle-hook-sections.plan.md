# Feature Plan: vehicle-hook-sections

> Epic Plan: [vehicle-hook-sections.plan.md](../vehicle-hook-sections.plan.md)

## 범위

피그마 디자인 (node 20:825, file `9sxH4k4w6tWb9QK7guDgzV`) 중 Hero 직하단의 두 후킹 섹션(Actyon 스펙 카드, Torres 비교 테이블) 신규 추가 + Hero CTA 버튼 색상 블루 교체.

### 구현 대상 (생성/수정 파일)

| 구분 | 경로 | 내용 |
|------|------|------|
| 신규 | `apps/frontend/b2c/app/_components/landing/ActyonSection.tsx` | Actyon 섹션 오케스트레이터 (chip + title + card + dual CTA) |
| 신규 | `apps/frontend/b2c/app/_components/landing/actyon/ActyonSpecCard.tsx` | 차량 이미지 + 모델명/가격 + 스펙 리스트 |
| 신규 | `apps/frontend/b2c/app/_components/landing/actyon/ActyonSpecList.tsx` | ✓ 아이콘 + 스펙 4줄 리스트 |
| 신규 | `apps/frontend/b2c/app/_components/landing/TorresSection.tsx` | Torres 섹션 오케스트레이터 (chip + title + table + dual CTA) |
| 신규 | `apps/frontend/b2c/app/_components/landing/torres/TorresComparisonTable.tsx` | 3열 비교 테이블 시맨틱 `<table>` |
| 신규 | `apps/frontend/b2c/app/_components/landing/shared/SectionChip.tsx` | 블루 pill 헤더 chip (Actyon/Torres 공통) |
| 신규 | `apps/frontend/b2c/app/_components/landing/shared/DualCta.tsx` | outline + solid 블루 버튼 2개 묶음 (Actyon/Torres 공통) |
| 수정 | `apps/frontend/b2c/app/_components/landing/hero/HeroHeadline.tsx` | CTA 버튼 색상 `bg-kgm-purple-600` → `bg-kgm-blue-600` |
| 수정 | `apps/frontend/b2c/app/page.tsx` 또는 landing index | ActyonSection, TorresSection 임포트하여 Hero 다음에 배치 |
| 수정 | `apps/frontend/b2c/app/_content/landing.ts` | `actyon`, `torres` 키 추가 (콘텐츠 하드코딩) |
| 수정 | `apps/frontend/b2c/tailwind.config.ts` | `kgm.blue: { 600: '#0A93FF' }` 토큰 추가 |
| 신규 | `apps/frontend/b2c/public/images/landing/actyon.png` (또는 svg) | Figma에서 추출한 Actyon 차량 에셋 |

## 의존성

- **선행 피처**: `hero-hooking-v2` (archived) — Hero 구조, `kgm-purple-dark` 토큰, `font-gmarket` 토큰, `HeroHeadline.tsx`가 이미 존재함을 전제
- **병렬 피처**: 없음
- **외부 의존**: 없음 (api-contracts, backend 변경 없음)

## 검증 기준 (Acceptance Criteria)

### 1. 시각 검증 (Figma 대조)

| 영역 | 기준 | 기대 결과 |
|------|------|-----------|
| Actyon 배경 | 색 | `#100f21` |
| Actyon Chip | 위치/색 | 상단 중앙, 블루 pill, Pretendard Medium 12px |
| Actyon Title | 폰트 | Gmarket Bold 28px, 2줄 ("월 180,550원" / "고유가 시대의 정답.") |
| Actyon Card | 스타일 | rounded 2xl, 보조 어두운 배경, 내부 padding |
| Actyon Spec 이미지 | 에셋 | Figma `20:1021` actyon 이미지 (64×64) |
| Actyon Spec 모델 | 텍스트 | "액티언 하이브리드 S8" |
| Actyon Spec 가격 | 폰트 | Gmarket Bold 32px, "월 180,550원" |
| Actyon Spec Divider | 선 | 1px, 투명 화이트 또는 동일 토큰 |
| Actyon Spec List | 아이콘+텍스트 | ✓ 아이콘 18×18 + 18px 텍스트 4줄 |
| Actyon CTA (좌) | 스타일 | outline 버튼, "월 납입금 계산하기", 141×48 |
| Actyon CTA (우) | 스타일 | solid 블루 버튼, "액티언HEV 상담 신청", 141×48 |
| Torres 배경 | 색 | `#100f21` |
| Torres Chip | 스타일 | 블루 pill, "티볼리 보다 싼 토레스" |
| Torres Title | 폰트 | Gmarket Bold, "준중현 SUV를" / "소형 SUV 가격으로." |
| Torres Table | 구조 | 3열(101/117/117) × 7행 (header+6), 행 높이 64/42 |
| Torres Header Row | 텍스트 | "항목" / "티볼리 (할부 60개월)" / "토레스 (할부 60개월)" |
| Torres Data Rows | 텍스트 | 월 납입금(42만/39만), 취등록세(별도/포함), 자동차세(별도/포함), 보험료(별도/포함), 추가부담(780만/0원) |
| Torres 블루 강조 | 스타일 | 토레스 컬럼 값은 `#0A93FF` 강조 |
| Torres CTA (좌) | 스타일 | outline, "월 납입금 계산하기", 161×48 |
| Torres CTA (우) | 스타일 | solid 블루, "토레스 상담 신청", 161×48 |
| Hero CTA | 색상 | solid 블루 `#0A93FF`로 변경 (기존 `kgm-purple-600` 교체) |

### 2. 기능 검증

- [ ] Actyon 좌 CTA 클릭 → `console.debug('actyon-calc')`
- [ ] Actyon 우 CTA 클릭 → `console.debug('actyon-consult')`
- [ ] Torres 좌 CTA 클릭 → `console.debug('torres-calc')`
- [ ] Torres 우 CTA 클릭 → `console.debug('torres-consult')`
- [ ] Hero CTA는 기존 `hero-cta` 로그 유지
- [ ] Actyon 이미지 `alt="액티언 하이브리드 S8"` 또는 유사
- [ ] Torres 테이블이 `<table>` 시맨틱 태그와 `<th scope="col">` 사용
- [ ] Chip/아이콘 장식은 `aria-hidden="true"` 처리

### 3. 품질 검증

- [ ] `pnpm --filter @kgm-rental/frontend-b2c build` 성공
- [ ] `pnpm --filter @kgm-rental/frontend-b2c typecheck` 0 error
- [ ] `pnpm --filter @kgm-rental/frontend-b2c lint` 0 error 0 warning
- [ ] 기존 Hero 렌더링 영향 없음 (색상 외 변화 無)
- [ ] 기존 라우트(`/`, `/products`, `/products/[modelSlug]`) 영향 없음

### 4. 반응형 검증

- [ ] 375px 모바일에서 가로 스크롤 없이 렌더
- [ ] 540px 이상에서 섹션 중앙 고정 (기존 Hero 패턴과 동일)

## 리스크 & 완화

| 리스크 | 완화책 |
|--------|--------|
| Actyon 이미지 에셋 다운로드 실패 | `get_design_context` 재호출 → Figma asset URL → `public/images/landing/actyon.png` 저장. 실패 시 사용자에게 즉시 보고 |
| 테이블 375px에서 좁아짐 | Figma 실측 너비(101/117/117 = 335) 그대로 사용, `w-full max-w-[335px] mx-auto` 적용 |
| Chip 색상이 Blue 600과 미세 다를 수 있음 | `get_design_context` 재호출로 Chip 정확 색 확인 후 토큰 추가 |
| Hero 버튼 변경으로 시각 회귀 | 기존 스냅샷 테스트 없음 확인, 수동 /#diff 확인만 |
| 공통 SectionChip/DualCta 과도한 추상화 | prop interface 최소(label, onLeft, onRight 등), 두 곳 사용이므로 소형 유지 |
