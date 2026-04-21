# Epic Report: {{epicName}}

## Executive Summary

| 항목 | 내용 |
|------|------|
| Epic | {{epicName}} |
| 완료일 | {{date}} |
| 프로필 | {{profileName}} |
| 총 Features | {{featureCount}} |

### Value Delivered (4-Perspective)

| 관점 | 결과 |
|------|------|
| **Problem** | (해결된 문제) |
| **Solution** | (구현된 해결책) |
| **Function UX Effect** | (실제 사용자 경험 변화) |
| **Core Value** | (달성된 핵심 가치) |

---

## 1. Feature 완료 현황

| # | Feature | Match Rate | Iterations | 상태 |
|---|---------|-----------|------------|------|
{{#each features}}
| {{this.order}} | {{this.name}} | {{this.matchRate}}% | {{this.iterations}} | {{this.status}} |
{{/each}}

## 2. Epic Delta (원래 계획 대비 최종 상태)

> Epic Plan에서 정의한 것과 최종 구현의 차이를 **직접 비교**한다.
> Feature별 Delta를 합산하지 않고, Epic Plan 기준으로 독립 계산한다.

### 2.1 추가된 것

| # | 항목 | 어느 Feature에서 | 사유 |
|---|------|----------------|------|
| 1 | (항목) | (Feature 이름) | (사유) |

### 2.2 변경된 것

| # | 원래 계획 | 최종 구현 | 사유 |
|---|----------|----------|------|
| 1 | (계획) | (실제) | (사유) |

### 2.3 제거된 것

| # | 항목 | 사유 |
|---|------|------|
| 1 | (항목) | (사유) |

## 3. 통합 검증 결과

> Epic Plan의 "통합 검증 기준"에 대한 평가 결과.

| # | 통합 검증 기준 | 결과 | 비고 |
|---|-------------|------|------|
| 1 | (기준) | PASS/FAIL | (비고) |

## 4. 교훈 (Lessons Learned)

### 4.1 잘된 점

(Epic 전체에서 반복할 것)

### 4.2 개선할 점

(워크플로우, 분해 전략, 의존성 관리 등에서 개선할 것)

### 4.3 하네스 개선 제안

(ETHOS 원칙 3: 하네스를 고쳐라)

---

*이 문서는 Epic 완료 시 자동 생성되는 산출물입니다.*
*모든 Feature Report가 완료된 후, Plan/Design 역반영을 진행합니다.*
