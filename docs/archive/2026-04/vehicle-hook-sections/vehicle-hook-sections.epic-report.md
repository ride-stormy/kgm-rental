# Epic Report: vehicle-hook-sections

> Plan: [../01-plan/vehicle-hook-sections.plan.md](../01-plan/vehicle-hook-sections.plan.md)
> Feature Report: [vehicle-hook-sections.report.md](vehicle-hook-sections.report.md)

## Executive Summary

| 항목 | 값 |
|------|----|
| Epic | vehicle-hook-sections |
| 구성 Feature | 1 (vehicle-hook-sections) |
| 완료일 | 2026-04-22 |
| 상태 | ✅ 완료 (모든 Feature archived 가능 상태) |
| 최종 Match Rate | **98%** |
| 이전 Epic 연결 | `docs/archive/2026-04/hero-hooking-v2/` |

### Value Delivered (4-Perspective)

| 관점 | 결과 |
|------|------|
| **Problem** | Hero 직하단 후킹 콘텐츠 부재 + Hero CTA 블루 통일 미적용 |
| **Solution** | Actyon 스펙 카드 + Torres 비교 테이블 섹션 2개 추가, Hero CTA 퍼플 → 블루 전환 |
| **Function UX Effect** | 스크롤 스토리: Hero(인상) → Actyon(가격·스펙) → Torres(경쟁 우위) → Products → Calculator. 블루 통일 CTA |
| **Core Value** | "하루 6,000원 프리미엄" + "티볼리보다 싼 토레스" + 구체 숫자(월 180,550원 / 월 39만원)의 3중 근거 |

---

## 1. Epic Plan 대비 최종 Delta

### 1.1 Plan에 있던 요구사항 이행

| # | 요구사항 | 결과 |
|---|----------|------|
| 1 | Hero 직하단 Actyon 섹션 추가 (node 20:908) | ✅ `ActyonSection.tsx` |
| 2 | 그 아래 Torres 비교 섹션 추가 (node 23:1089) | ✅ `TorresSection.tsx` |
| 3 | Hero CTA 색상 `#2e2c4b` → `#0A93FF` | ✅ `HeroHeadline.tsx` 1-line diff |

### 1.2 Plan 이후 확장된 범위 (사용자 요청에 의해)

| # | 변경 | 이유 |
|---|------|------|
| 1 | `check.svg` 에셋 추가 (유니코드 `✓` 대체) | 피그마 원본 18×18 원형 + 체크 stroke 반영, 사용자가 에셋 제공 |
| 2 | Chip 색상 재확인 (`#0A93FF` → `#0b3e91` 네이비) | 초기 구현 후 피그마 재실측으로 수정 |
| 3 | DualCta outline 버튼 → 다크 solid | 피그마 Code Connect 재확인 (두 버튼 모두 `solid` variant) |
| 4 | Torres 컬럼 하이라이트 `#0A93FF` → `#5bb7ff` | 피그마 실측 재확인 |
| 5 | Actyon/Torres 카드·테이블 반응형 (max-w-335 해제) | 540px 컨테이너 전폭 대응, 사용자 요청 |
| 6 | Torres 테이블 외곽 `border-2` + 행 `purple-800` + `border-b purple-600` | Act 이터레이션 Figma 정합성 개선 |
| 7 | Actyon 타이틀 폰트 Gmarket 28/40 (Torres와 통일) | Act 단계 사용자 선호 반영 |
| 8 | 카드 rounded 24px + 배경 `kgm-purple-800` + 모델명 Bold | Act 이터레이션 Figma 정합성 개선 |
| 9 | `productsHeader.titleLines` 문구 교체 | 사용자 요청 |

### 1.3 Plan에서 제외된 것

| # | 항목 | 사유 |
|---|------|------|
| — | 없음 | 계획된 11개 파일 변경 100% 이행 |

---

## 2. 아키텍처 영향

- `_components/landing/` 구조가 "오케스트레이터 + 서브 디렉토리 + shared" 3단으로 정착 — 후속 섹션 추가가 용이한 재사용 패턴
- Tailwind 토큰에 피그마 팔레트 9종 추가 (`kgm.blue.{900,600,500}`, `kgm.purple.{dark,800,700,600,300}`) — 랜딩 외 영역에서도 재사용 가능
- 정적 콘텐츠 단일 정본 유지: `_content/landing.ts`의 `LANDING_CONTENT` 확장성

## 3. 품질 신호

| 신호 | 결과 |
|------|------|
| build / typecheck / lint | ✅ 전 항목 PASS (0 error / 0 warning) |
| Feature matchRate | 98% (임계값 90% 초과) |
| Iteration | 1회 (check → act → check) — 사용자가 전체 수정 선택 |
| Scope Drift | 통제됨 (모든 범위 이탈은 사용자 승인) |

## 4. 후속 Epic 후보

1. **CTA 라우팅 Epic** — `actyon-calc / actyon-consult / torres-calc / torres-consult` 이벤트를 실제 상담 폼 / 제품 상세 / 견적 계산 화면으로 연결
2. **랜딩 인터랙션 Epic** — 스크롤 등장 애니메이션·번호 카운터 등 모션 추가
3. **A/B 테스트 Epic** — 후킹 섹션 유무 / 순서에 따른 전환율 비교

---

## 5. 핸드오프 자원

| 자원 | 위치 | 비고 |
|------|------|------|
| 공통 Chip | `landing/shared/SectionChip.tsx` | 다른 랜딩 섹션에 재사용 가능 |
| 공통 DualCta | `landing/shared/DualCta.tsx` | outline+solid 버튼 쌍 공용 |
| 체크 아이콘 | `public/images/landing/check.svg` | 스펙 리스트 공용 |
| Tailwind `kgm.*` 토큰 | `tailwind.config.ts` | 9종 색상 재사용 가능 |
| `_content/landing.ts` 패턴 | `LANDING_CONTENT.{actyon,torres,...}` | `as const` readonly 확장 패턴 |

---

*이 문서는 `/harness:report` 단계의 산출물입니다.*
*다음 단계: `/harness:archive`로 본 Epic 및 Feature를 완료 처리.*
