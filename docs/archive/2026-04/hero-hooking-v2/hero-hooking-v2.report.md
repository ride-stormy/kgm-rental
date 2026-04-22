# Feature Report: hero-hooking-v2

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | hero-hooking-v2 |
| Epic | hero-hooking-v2 (single-feature epic) |
| 완료일 | 2026-04-22 |
| 프로필 | blank (verification.commands 설정됨) |
| 최종 Match Rate | **98%** |
| 총 Iteration | 0 (첫 시도 성공) |

### Value Delivered (4-Perspective)

| 관점 | 결과 |
|------|------|
| **Problem** | 랜딩 Hero의 시각적 후킹이 약함 — 가격 비교 메시지("티볼리 가격으로 토레스", "커피 한 잔 값")가 평면적 텍스트로만 표현 |
| **Solution** | 피그마 원본(node 20:781) 기반 3-파트 분해 (Headline/EventBand/LineupImage) + 다크 퍼플 배경 + 그라데이션 헤드라인 + 다크 강조 바 + 점 장식 + 이벤트 밴드 + 차량 라인업 이미지 |
| **Function UX Effect** | Hero 영역이 3개 시각 블록으로 구조화되어 스캔성 ↑, 가격 비교 키워드("토레스!", "액티언 하이브리드")가 다크 그라데이션 바로 강조되어 읽기 순서 가이드 형성 |
| **Core Value** | 브랜드 신뢰(KGM with RIDE 로고) + 희소성(400대 한정 밴드) + 제품 다양성(라인업 이미지) 3박자 노출로 CTA 클릭 유도력 강화 |

---

## 1. PDCA 사이클 이력

| 단계 | 일시 | 비고 |
|------|------|------|
| init → plan | 2026-04-22 02:33 | Epic Plan + Feature Plan 생성 |
| plan → design | 2026-04-22 02:43 | Option B (Clean Architecture, 5파일) 선택 |
| design → do | 2026-04-22 02:50 | 구현 시작 |
| do → check | 2026-04-22 03:45 | 품질 검증 |
| check → report | 2026-04-22 03:46 | 본 문서 |

## 2. 구현 범위

### 2.1 생성된 파일

| 파일 | 역할 |
|------|------|
| `apps/frontend/b2c/app/_components/landing/hero/LogoKgmWithRide.tsx` | KGM with RIDE 로고 (public SVG 래핑) |
| `apps/frontend/b2c/app/_components/landing/hero/HeroEventBand.tsx` | 검정 이벤트 밴드 (그라데이션 라인 + 중앙 텍스트) |
| `apps/frontend/b2c/app/_components/landing/hero/HeroLineupImage.tsx` | 차량 라인업 이미지 스트립 |
| `apps/frontend/b2c/app/_components/landing/hero/HeroHeadline.tsx` | 헤드라인 + 장식 + CTA (중앙 고정 335px 박스) |
| `docs/04-report/hero-hooking-v2.report.md` | 본 문서 |

### 2.2 수정된 파일

| 파일 | 변경 내용 |
|------|----------|
| `apps/frontend/b2c/app/_components/landing/HeroSection.tsx` | 오케스트레이터로 슬림화 |
| `apps/frontend/b2c/tailwind.config.ts` | `kgm-purple-dark` 토큰, `font-gmarket` 추가 |
| `apps/frontend/b2c/app/layout.tsx` | `next/font/local`로 Gmarket Sans 3종 주입 |

### 2.3 에셋 추가

| 에셋 | 위치 |
|------|------|
| Gmarket Sans Light/Medium/Bold | `apps/frontend/b2c/public/fonts/` |
| `carlineup.png` | `apps/frontend/b2c/public/images/landing/carlineup.png` |
| `KGMwithRIDE.svg` | `apps/frontend/b2c/public/images/landing/logo/KGMwithRIDE.svg` |

## 3. 품질 검증 결과

### 3.1 최종 평가

| 관점 | 결과 |
|------|------|
| Build | ✅ PASS (6 static pages, First Load JS 107KB) |
| Type Safety | ✅ PASS (0 errors) |
| Lint | ✅ PASS (0 errors, 0 warnings) |
| Functional | ✅ PASS (dev 서버 200 OK, 전 요소 렌더) |
| Convention | ✅ PASS (arrow + named export + Props suffix + const object) |
| Design Match | ✅ PASS (Delta 5건, 모두 사용자 승인 또는 피그마 실측) |
| DS Match | N/A (DS 없음) |
| Scope Drift | ✅ PASS (범위 내) |

### 3.2 수정 이력 (Iteration)

첫 시도 성공. Iteration 없음. 구현 중 사용자 피드백 3건 반영:
1. Gmarket Sans 로컬 OTF 사용 (Pretendard 폴백 대신)
2. 라인업 이미지 높이 156px → 180px
3. 강조 장식 반응형 정렬 (`w-full` → `w-[335px] mx-auto`)
4. 로고 교체 (단일 파일 SVG `<img>` 사용)

## 4. Delta (계획 대비 변경사항)

### 4.1 추가된 것

| # | 항목 | 사유 |
|---|------|------|
| 1 | 프로젝트 내 Gmarket Sans OTF 3종 (Light/Medium/Bold) | 사용자 로컬에 설치되어 있음 확인 → 배포 시 방문자 모두에게 정확한 폰트 노출 위해 public/ 복사 |
| 2 | 장식 박스 고정 너비 335px + mx-auto | 데스크톱 폭에서 장식과 텍스트가 함께 중앙 이동하도록 |

### 4.2 변경된 것

| # | 원래 계획 | 실제 구현 | 사유 |
|---|----------|----------|------|
| 1 | Gmarket Sans — Pretendard Bold 폴백 | `next/font/local`로 로컬 OTF 로드 | 사용자 요청, 폰트 정확도 우선 |
| 2 | 라인업 이미지 높이 156px | **180px** | 사용자 시각 판단 |
| 3 | 로고 — 인라인 SVG paths (viewBox 62×20 직접 작성) | `<img src="/images/landing/logo/KGMwithRIDE.svg">` | 사용자가 단일 SVG 파일 제공, 유지보수 단순화 |
| 4 | 밑줄 그라데이션 `#b2cbff → #ffffff` (밝은색) | `#100f21 → #262a8e` (다크) | 피그마 실측 (node 20:785/786 확인) |

### 4.3 제거된 것

없음.

## 5. 핸드오프 (다음 Feature를 위한 정보)

### 5.1 생성된 공유 자원

| 자원 | 위치 | 설명 |
|------|------|------|
| `kgm-purple-dark` 토큰 | `tailwind.config.ts` | `#100f21` — 다크 퍼플 배경 (Hero 외에도 재사용 가능) |
| `font-gmarket` 토큰 | `tailwind.config.ts` | Gmarket Sans CSS variable 연결 |
| `LogoKgmWithRide` 컴포넌트 | `app/_components/landing/hero/` | 재사용 가능 로고 (다른 섹션에서도 import 가능) |
| Gmarket Sans 폰트 3종 | `public/fonts/` | 다른 페이지/섹션에서도 `font-gmarket` 클래스로 사용 가능 |

### 5.2 API/인터페이스

랜딩 페이지 콘텐츠는 `_content/landing.ts`의 `LANDING_CONTENT.hero` 구조를 그대로 사용 (스키마 변경 없음).

### 5.3 아키텍처 결정사항

- **Hero 서브 분해 패턴**: `HeroSection` 오케스트레이터 + `hero/` 서브 디렉토리 분리 → 다른 섹션(Products, Calculator)도 유사 패턴 적용 가능
- **장식 좌표 상수화**: `DECORATION` const object로 관리 → 추가 장식 반영 시 좌표만 추가
- **고정 너비 박스 + mx-auto**: 반응형 중앙 정렬 패턴, 다른 콘텐츠 블록에도 적용 고려
- **로컬 폰트 공급**: `next/font/local` + `public/fonts/` 패턴 확립 → 추가 폰트 필요 시 동일 방식

## 6. 교훈 (Lessons Learned)

### 6.1 잘된 점 (반복할 것)

- **피그마 MCP로 실측값 확인**: 설계 문서에 예측치를 적지 않고, Figma get_design_context로 좌표/색상 정확 확인 → 편차 최소화
- **Delta 추적**: 사용자 요청을 그때그때 반영하면서 동시에 Delta 기록 → Report에서 일목요연하게 정리 가능
- **Smoke Test로 조기 감지**: 구현 직후 dev 서버로 렌더 확인 → 문제 조기 발견
- **사용자 로컬 자원 활용**: Gmarket Sans 폴백을 바로 쓰지 않고 로컬 존재 여부 먼저 확인 → 더 나은 결과

### 6.2 개선할 점 (하네스에 반영 제안)

- **dev/build 동시 실행 주의**: Check 단계에서 build가 dev 서버의 `.next` 캐시를 덮어쓰는 사고 발생 → 가이드 추가 ("dev 서버 실행 중에는 build 대신 typecheck만 사용" 권장)
- **Figma 좌표 검증을 Design 단계에 포함**: 설계 문서를 먼저 쓰고 구현 중 실측값과 차이를 발견 → Design 단계에서 MCP 호출을 의무화하면 Delta 감소
- **Gmarket 같은 로컬 폰트 자산 체크리스트**: 폰트 의존 디자인에서 첫 단계에 "로컬/사내 폰트 자산 유무 확인" 체크리스트 추가

---

*이 문서는 `/harness:report` 단계의 산출물입니다.*
*다음 단계: `/harness:archive`*
