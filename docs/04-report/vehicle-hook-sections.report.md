# Feature Report: vehicle-hook-sections

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | vehicle-hook-sections |
| Epic | vehicle-hook-sections (1-Feature Epic) |
| 완료일 | 2026-04-22 |
| 검증 정책 | build + typecheck + lint + Figma 대조 + 기능/구조/컨벤션 AI 리뷰 |
| 최종 Match Rate | **98%** |
| 총 Iteration | 1 (check → act → check) |

### Value Delivered (4-Perspective)

| 관점 | 결과 |
|------|------|
| **Problem** | 기존 랜딩은 Hero 1개 섹션 뒤 바로 Product 그리드가 나와 "왜 이 차를?"에 대한 후킹이 부족했음 |
| **Solution** | Hero 하단에 Actyon 하이브리드 특장 카드 + Torres vs 티볼리 비교 테이블 2개 섹션을 삽입. Hero CTA 색상도 purple → blue로 정체성 정렬 |
| **Function UX Effect** | 모바일 375px에서 Hero 후킹 → Actyon 가격/스펙 → Torres 경쟁 차종 비교 → Product 목록으로 이어지는 스크롤 스토리 완성. 섹션별 `console.debug`로 CTA 이벤트 트래킹 경로 확보 |
| **Core Value** | 한정판매 차량의 가치 소구 → 상품 목록 전환율 상승 근거 마련. 피그마 디자인 시스템(Pretendard/Gmarket/KGM 블루·퍼플 팔레트) 정합성 완성 |

---

## 1. PDCA 사이클 이력

| 단계 | 일시 | 비고 |
|------|------|------|
| init → plan | 2026-04-22 13:14 | Epic Plan + Feature Plan 생성 |
| plan → design | 2026-04-22 13:25 | Option B (Clean Architecture) 선택 |
| design → do | 2026-04-22 13:31 | 11개 파일 구현 승인 |
| do → check | 2026-04-22 14:02 | 초기 matchRate 92% |
| check → act | 2026-04-22 14:02 | 전체 수정 선택 (사용자) |
| act → check | 2026-04-22 14:04 | 재검증 matchRate 98% |
| check → report | 2026-04-22 14:10 | Report 단계 진입 |

---

## 2. 구현 범위

### 2.1 생성된 파일 (8개)

| # | 경로 | 역할 |
|---|------|------|
| 1 | `apps/frontend/b2c/app/_components/landing/ActyonSection.tsx` | Actyon 섹션 오케스트레이터 |
| 2 | `apps/frontend/b2c/app/_components/landing/actyon/ActyonSpecCard.tsx` | 차량 이미지 + 가격 + 스펙 + CTA 카드 |
| 3 | `apps/frontend/b2c/app/_components/landing/actyon/ActyonSpecList.tsx` | ✓ SVG 아이콘 + 스펙 리스트 |
| 4 | `apps/frontend/b2c/app/_components/landing/TorresSection.tsx` | Torres 섹션 오케스트레이터 |
| 5 | `apps/frontend/b2c/app/_components/landing/torres/TorresComparisonTable.tsx` | 3컬럼 비교 테이블 (외곽 border + row 배경 + border-b) |
| 6 | `apps/frontend/b2c/app/_components/landing/shared/SectionChip.tsx` | 네이비 필 챕 (Actyon·Torres 공용) |
| 7 | `apps/frontend/b2c/app/_components/landing/shared/DualCta.tsx` | 다크 solid + 블루 solid 버튼 2개 묶음 |
| 8 | `apps/frontend/b2c/public/images/landing/check.svg` | 18×18 체크 아이콘 (원형 + 체크 stroke) |

### 2.2 수정된 파일 (4개)

| # | 경로 | 변경 요지 |
|---|------|----------|
| 1 | `apps/frontend/b2c/tailwind.config.ts` | `kgm.blue.900/600/500`, `kgm.purple.800/700/300` 토큰 추가 |
| 2 | `apps/frontend/b2c/app/_content/landing.ts` | `actyon`, `torres` 키 추가 + `productsHeader.titleLines` 문구 교체 |
| 3 | `apps/frontend/b2c/app/_components/landing/hero/HeroHeadline.tsx` | CTA 버튼 `bg-kgm-purple-600` → `bg-kgm-blue-600` |
| 4 | `apps/frontend/b2c/app/page.tsx` | `<ActyonSection />`, `<TorresSection />` Hero 뒤에 삽입 |

---

## 3. 품질 검증 결과

### 3.1 최종 평가 (8개 관점)

| 관점 | 결과 | 점수 |
|------|------|------|
| Build (`pnpm build`) | ✅ PASS | 100 |
| Type Safety (`tsc --noEmit`) | ✅ PASS (0 error) | 100 |
| Lint (`eslint`) | ✅ PASS (0 error / 0 warning) | 100 |
| Functional AC | ✅ 11/11 | 100 |
| Structure | ✅ 5/5 | 100 |
| Visual (Figma 대조) | ✅ | 95 |
| Convention Adherence | ✅ | 100 |
| Design-Implementation Match | ✅ | 95 |
| Scope Drift | ✅ | 95 |
| Frontend Best Practices | ✅ | 95 |

**최종 matchRate = 98%** (임계값 90% 초과)

### 3.2 Act 이터레이션에서 수정된 내용

| # | 항목 | 이전 | 개선 |
|---|------|------|------|
| 1 | Actyon 타이틀 폰트 | Pretendard 22/34 | Gmarket 28/40 (Torres와 통일) |
| 2 | Actyon 카드 배경 | `bg-white/5` | `bg-kgm-purple-800` (#1f1e36) |
| 3 | 카드 rounded | 16px (`rounded-2xl`) | 24px (`rounded-3xl`) |
| 4 | 카드 divider | `bg-white/10` | `bg-kgm-purple-600` |
| 5 | 모델명 스타일 | white/70 regular | white Bold |
| 6 | Torres 테이블 외곽 | 없음 | `border-2 kgm-purple-700 rounded-2xl` |
| 7 | Torres 행 배경 | 없음 | `bg-kgm-purple-800` |
| 8 | Torres 행 구분선 | 없음 | `border-b kgm-purple-600` |
| 9 | Torres 헤더 2줄 | 1줄 | "티볼리 / (할부 60개월)" 2줄 구조 |
| 10 | 월 납입금 행 | Medium | Bold (피그마 실측) |
| 11 | 스펙 첫 라인 | "취등록세 · 자동차세 · 보험료 모두 포함" | "취등록세, 자동차세, 보험료 모두 포함" (쉼표) |
| 12 | 티볼리 컬럼 표기 | "별도" | "별도 부담" |
| 13 | 월 납입금 표기 | "42만원 / 39만원" | "월 42만원 / 월 39만원" |

---

## 4. Delta (계획 대비 변경사항)

### 4.1 추가된 것 (Plan/Design에 없었으나 구현된 것)

| # | 항목 | 사유 |
|---|------|------|
| 1 | `check.svg` 18×18 아이콘 에셋 + public 배치 | 사용자가 원본 아이콘 에셋 제공, Figma 실측 (원형+체크 stroke) 반영을 위해 유니코드 `✓` 대체 |
| 2 | Tailwind 토큰 `kgm.purple.800/700/300` | 카드 배경·테이블 외곽·스펙 텍스트 색상 정합을 위해 필요 |
| 3 | Torres 테이블 헤더 2줄 렌더 헬퍼 `renderTwoLineHeader` | "티볼리 (할부 60개월)" 피그마 구조를 재현 |
| 4 | `productsHeader.titleLines` 문구 교체 | 사용자 요청 — 기존 2줄 문구 → "한정 판매하는 차량을 확인해보세요" 1줄 |

### 4.2 변경된 것 (Plan/Design과 다르게 구현된 것)

| # | 원래 계획 (Design 문서) | 실제 구현 | 사유 |
|---|----------------------|----------|------|
| 1 | Chip `bg-kgm-blue-600` (#0A93FF) Medium 12px | `bg-kgm-blue-900` (#0b3e91) Bold 11px | Figma 실측 재확인 — 진한 네이비 |
| 2 | DualCta outline 버튼: 투명+블루 보더+블루 텍스트 | 다크 solid (`bg-kgm-purple-800` + 흰 텍스트) | Figma 실측 — Code Connect도 두 버튼 모두 `solid` variant |
| 3 | Torres 컬럼 하이라이트 `kgm-blue-600` (#0A93FF) | `kgm-blue-500` (#5bb7ff) | Figma 실측 (밝은 sky blue) |
| 4 | Actyon 가격 Gmarket 24px | Pretendard 26/38 | 사용자 요청 + Figma 실측 (Pretendard Bold) |
| 5 | 스펙 텍스트 14px white/80 | 13px `kgm-purple-300` (#bab9d2) | Figma 실측 |
| 6 | 카드 / 테이블 `max-w-[335px]` 고정 | `w-full` (반응형) | 사용자 요청 — 540px 컨테이너에서 확장 허용 |
| 7 | Torres 테이블 컬럼 101/117/117 px 고정 | colgroup 30% / 35% / 35% 비율 | 반응형 대응 |
| 8 | Hero 버튼 `bg-kgm-purple-600` | `bg-kgm-blue-600` | 원 계획대로 반영 (diff 적용) |

### 4.3 제거된 것 (Plan/Design에 있었으나 구현하지 않은 것)

| # | 항목 | 사유 |
|---|------|------|
| — | 없음 | 설계된 7개 컴포넌트 모두 구현됨 |

---

## 5. 아키텍처 결정사항 (ADR)

1. **오케스트레이터 + 서브 디렉토리 패턴 채택** — 기존 `HeroSection + hero/` 선례와 동일하게 `ActyonSection + actyon/`, `TorresSection + torres/` 구조. 섹션이 늘어나도 `_components/landing/` 루트가 평평하게 유지됨.
2. **`shared/`는 landing 도메인 로컬** — `SectionChip`·`DualCta`는 Actyon/Torres만 사용하므로 App-Shared가 아닌 `landing/shared/`. 다른 라우트에서 쓰이면 그때 승격.
3. **정적 콘텐츠 → `_content/landing.ts` 단일 정본** — 모든 텍스트·이미지 경로·CTA 라벨을 `LANDING_CONTENT`로 흡수. 컴포넌트는 props만 받는 순수 프레젠테이션.
4. **CTA 이벤트는 `window.console.debug`로 스텁** — 실제 라우팅/이벤트 전송은 후속 Feature에서 연결. `typeof window !== 'undefined'` SSR 가드 유지.
5. **Tailwind 토큰으로 피그마 팔레트 인덱싱** — `kgm.purple.{dark,800,700,600,300}`, `kgm.blue.{900,600,500}` 9개 토큰으로 피그마 실측 색상을 1:1 매핑.
6. **Table colgroup으로 반응형 컬럼** — 고정 px 대신 30/35/35% 비율 → 375px·540px 양쪽에서 깨짐 없음.

---

## 6. 핸드오프 (향후 연결 포인트)

### 6.1 생성된 공유 자원

| 자원 | 경로 | 향후 사용처 |
|------|------|------------|
| `SectionChip` | `landing/shared/SectionChip.tsx` | 다른 랜딩 섹션에 마케팅 라벨 필요 시 재사용 |
| `DualCta` | `landing/shared/DualCta.tsx` | 다른 랜딩 섹션의 outline+solid 버튼 쌍에 재사용 |
| `check.svg` | `public/images/landing/check.svg` | 스펙 리스트 공통 아이콘 — 다른 차량 섹션에서 그대로 사용 가능 |
| Tailwind 토큰 | `tailwind.config.ts` → `kgm.*` | 랜딩 전 영역의 다크 배경/블루 강조에 사용 가능 |

### 6.2 남은 작업 (후속 Feature 후보)

1. **CTA 실제 라우팅** — `actyon-calc` → 상담 요청 폼 또는 `/products/actyon-hev` 이동. 현재는 `console.debug` 스텁.
2. **분석 이벤트 연동** — GA/Amplitude 등으로 CTA 이벤트 송신.
3. **카드 이미지 고해상도** — 현재 64×64 사용, 필요 시 2x/3x 에셋.
4. **모션 추가** — Figma CPS에 있던 스크롤 인터랙션 (있다면 분리 Feature로).

### 6.3 다음 Feature가 즉시 쓸 수 있는 정보

- `LANDING_CONTENT.actyon` / `LANDING_CONTENT.torres` 타입은 `as const`로 readonly — 새 섹션 추가 시 동일 패턴으로 키 확장.
- 섹션 배경은 항상 `bg-kgm-purple-dark`, 내부 카드는 `bg-kgm-purple-800`, 테이블 외곽은 `kgm-purple-700` — 3단 계조가 디자인 규칙.
- 섹션 루트에 `data-node-id="{Figma nodeId}"` 유지 규칙 — Figma 추적용.

---

## 7. 리스크 & 후속 관찰 포인트

| 리스크 | 완화 상태 |
|--------|----------|
| 반응형 540px 컨테이너에서 카드 너비가 지나치게 넓어짐 | `w-full` + 섹션 `px-5` padding으로 500px로 제한됨. 필요 시 상위 `<main className="max-w-[540px]">`에서 추가 제한 가능 |
| Torres 테이블 컬럼 비율이 좁은 화면에서 텍스트 줄바꿈 | "월 42만원" 같은 짧은 문자열은 문제없음. 긴 문자열이 추가될 경우 `word-break` 또는 셀 너비 조정 필요 |
| CTA 이벤트 스텁 (`console.debug`)이 프로덕션에도 배포됨 | 실제 연동 Feature에서 replace. 현재는 명시적 스텁으로 설계 승인됨 |
| Figma "준중현/준중형" 원본 오타 | 구현에서는 "준중형"으로 교정 (맞춤법 기준). 디자이너와 향후 재확인 |

---

## 8. 최종 결과물 스크린샷 접근 경로

- 개발 서버 실행: `pnpm --filter @kgm-rental/frontend-b2c dev`
- 브라우저: http://localhost:3000 (루트 `/`에서 Hero → Actyon → Torres → Products → Calculator 순 확인)
- 모바일 프리뷰: 375px 뷰포트
- 데스크톱 프리뷰: 540px 컨테이너 내부

---

*이 문서는 `/harness:report` 단계의 산출물입니다.*
*다음 단계: `/harness:archive`*
