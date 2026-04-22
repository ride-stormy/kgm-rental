# Epic Report: hero-hooking-v2

## Executive Summary

| 항목 | 내용 |
|------|------|
| Epic | hero-hooking-v2 |
| 완료일 | 2026-04-22 |
| 프로필 | blank (verification.commands 설정됨) |
| 총 Features | 1 (single-feature epic) |

### Value Delivered (4-Perspective)

| 관점 | 결과 |
|------|------|
| **Problem** | 랜딩 Hero의 시각적 후킹이 약해 가격 비교 카피가 평면적으로 노출됨 |
| **Solution** | 피그마 원본 기반 3-파트 분해 + 다크 퍼플 배경 + 그라데이션 헤드라인 + 강조 장식 + 이벤트 밴드 + 차량 라인업 |
| **Function UX Effect** | Hero가 3개 시각 블록으로 구조화되어 스캔성/읽기 순서 ↑, 가격 비교 키워드 강조 |
| **Core Value** | 브랜드 신뢰 + 희소성 + 제품 다양성 3박자 노출 → CTA 전환력 강화 |

---

## 1. Feature 완료 현황

| # | Feature | Match Rate | Iterations | 상태 |
|---|---------|-----------|------------|------|
| 1 | hero-hooking-v2 | 98% | 0 (첫 시도 성공) | ✅ report |

## 2. Epic Delta (원래 계획 대비 최종 상태)

### 2.1 추가된 것

| # | 항목 | 어느 Feature에서 | 사유 |
|---|------|----------------|------|
| 1 | Gmarket Sans 로컬 OTF 3종 프로젝트 복사 | hero-hooking-v2 | 사용자 로컬 존재 확인 → 배포 시 방문자 모두에게 정확 노출 |
| 2 | 장식 박스 고정 너비 `w-[335px] mx-auto` | hero-hooking-v2 | 데스크톱 폭에서 텍스트-장식 세트가 함께 중앙 정렬 |

### 2.2 변경된 것

| # | 원래 계획 | 최종 구현 | 사유 |
|---|----------|----------|------|
| 1 | 폰트 폴백 전략 (Pretendard Bold) | `next/font/local` + 로컬 OTF 로드 | 사용자 요청, 폰트 정확도 우선 |
| 2 | 라인업 이미지 높이 156px | 180px | 사용자 시각 판단 |
| 3 | 로고 — 인라인 SVG paths | `<img src>` + public SVG 파일 | 사용자가 단일 SVG 파일 제공 |
| 4 | 밑줄 그라데이션 밝은색 (`#b2cbff → #ffffff`) | 다크 (`#100f21 → #262a8e`) | 피그마 실측 반영 |

### 2.3 제거된 것

없음.

## 3. 통합 검증 결과

| # | 통합 검증 기준 | 결과 | 비고 |
|---|-------------|------|------|
| 1 | Build 성공 (6 static pages) | ✅ PASS | First Load JS 107KB (-1KB) |
| 2 | Typecheck 0 errors | ✅ PASS | |
| 3 | Lint 0 errors, 0 warnings | ✅ PASS | |
| 4 | Dev 서버 HTTP 200 | ✅ PASS | localhost:4001 |
| 5 | 기존 라우트 영향 없음 | ✅ PASS | /, /products, /products/[modelSlug] 정상 |
| 6 | Hero 모든 서브 요소 렌더 | ✅ PASS | 로고, 헤드라인, 장식, CTA, 이벤트밴드, 라인업 |

## 4. 교훈 (Lessons Learned)

### 4.1 잘된 점

- **Single-feature Epic도 PDCA 풀사이클 적용**: 작은 규모여도 Plan → Design → Do → Check → Report 과정을 생략하지 않아 결과물과 회고 모두 확보
- **Figma MCP 적극 활용**: Design 단계의 가정 대신 실측값으로 구현 → Delta 최소화
- **사용자 피드백 즉각 반영 + Delta 기록**: 3건의 사용자 수정 요청을 그때그때 반영하면서 근거를 누적

### 4.2 개선할 점

- **Design 단계에서 Figma 실측 의무화**: 장식 색(밝은색 → 다크), 좌표가 설계 문서와 구현이 달랐음. Design 단계에 Figma get_design_context 호출을 필수 절차로 포함
- **반응형 전략 조기 명시**: `w-full` 절대 좌표는 모바일에서만 유효했음. Design 단계에서 "고정 너비 박스 + mx-auto" 패턴 제시 필요
- **로컬 폰트 자산 확인 체크리스트**: 폰트 의존 디자인에서 사용자 로컬/사내 자산 확인을 Discovery 단계에 포함

### 4.3 하네스 개선 제안

- **dev/build 충돌 방지 가이드**: `/harness:check` 스킬이 build를 실행할 때 기존 dev 서버 `.next` 캐시를 덮어쓰는 이슈 — 가이드 또는 pre-check 단계에서 dev 서버 중단 권장
- **Design 템플릿에 Figma MCP 호출 섹션 추가**: "실측 확인된 색상/좌표" 섹션을 의무 항목으로 추가
- **Delta 자동 수집**: 사용자 피드백으로 인한 변경을 Do 단계 중 자동 태깅 → Report에서 자동 채움

---

*이 문서는 Epic 완료 시 생성되는 산출물입니다.*
*다음 단계: `/harness:archive`*
