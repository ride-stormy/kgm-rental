# Feature Report: {{featureName}}

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | {{featureName}} |
| Epic | {{epicName}} |
| 완료일 | {{date}} |
| 프로필 | {{profileName}} |
| 최종 Match Rate | {{matchRate}}% |
| 총 Iteration | {{iterationCount}} |

### Value Delivered (4-Perspective)

| 관점 | 결과 |
|------|------|
| **Problem** | (해결된 문제) |
| **Solution** | (구현된 해결책) |
| **Function UX Effect** | (실제 사용자 경험 변화) |
| **Core Value** | (달성된 핵심 가치) |

---

## 1. PDCA 사이클 이력

| 단계 | 일시 | 비고 |
|------|------|------|
{{#each history}}
| {{this.from}} → {{this.to}} | {{this.timestamp}} | {{this.metadata}} |
{{/each}}

## 2. 구현 범위

### 2.1 생성된 파일

(파일 목록)

### 2.2 수정된 파일

(파일 목록)

## 3. 품질 검증 결과

### 3.1 최종 평가

| 관점 | 결과 |
|------|------|
| Build | (PASS/FAIL) |
| Type Safety | (PASS/FAIL) |
| Lint | (PASS/FAIL) |
| Functional | (PASS/FAIL) |
| Convention | (PASS/FAIL) |
| Design Match | (PASS/FAIL) |
| DS Match | (PASS/FAIL/N/A) |
| Scope Drift | (PASS/FAIL) |

### 3.2 수정 이력 (Iteration)

(각 iteration에서 수정된 내용)

## 4. Delta (계획 대비 변경사항)

> Plan/Design에서 정의한 것과 실제 구현의 차이를 기록한다.

### 4.1 추가된 것 (Plan/Design에 없었으나 구현된 것)

| # | 항목 | 사유 |
|---|------|------|
| 1 | (예: phone 필드 추가) | (예: Human Test 중 필요성 발견) |

### 4.2 변경된 것 (Plan/Design과 다르게 구현된 것)

| # | 원래 계획 | 실제 구현 | 사유 |
|---|----------|----------|------|
| 1 | (계획) | (실제) | (사유) |

### 4.3 제거된 것 (Plan/Design에 있었으나 구현하지 않은 것)

| # | 항목 | 사유 |
|---|------|------|
| 1 | (예: 엑셀 내보내기) | (예: 범위 축소, 다음 Feature로 이관) |

## 5. 핸드오프 (다음 Feature를 위한 정보)

> 이 Feature의 결과를 기반으로 다음 Feature가 알아야 할 내용.

### 5.1 생성된 공유 자원

| 자원 | 위치 | 설명 |
|------|------|------|
| (예: Dealer 타입) | (src/types/dealer.ts) | (스키마 정의) |

### 5.2 API/인터페이스

| 엔드포인트/함수 | 설명 |
|---------------|------|
| (예: GET /api/dealers) | (딜러 목록 반환) |

### 5.3 아키텍처 결정사항

(다음 Feature에 영향을 미치는 기술 결정)

## 6. 교훈 (Lessons Learned)

### 6.1 잘된 점

(반복할 것)

### 6.2 개선할 점

(하네스에 반영할 개선사항)

---

*이 문서는 `/harness:report` 단계의 산출물입니다.*
*다음 단계: `/harness:archive` 또는 다음 Feature의 `/harness:design`*
