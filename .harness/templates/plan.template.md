# Epic Plan: {{epicName}}

## Executive Summary

| 항목 | 내용 |
|------|------|
| Epic | {{epicName}} |
| 작성일 | {{date}} |
| 프로필 | {{profileName}} |
| 관련 Epic | (이전에 관련된 Epic이 있으면 경로 기재, 없으면 —) |

### Value Delivered (4-Perspective)

| 관점 | 내용 |
|------|------|
| **Problem** | (문제 정의) |
| **Solution** | (해결책) |
| **Function UX Effect** | (사용자 경험 변화) |
| **Core Value** | (핵심 가치) |

---

## 1. 배경 및 문제 정의

### 1.1 현재 상태

(현재 상태 분석)

### 1.2 목표

(달성하고자 하는 목표)

## 2. 요구사항

### 2.1 기능 요구사항

| # | 요구사항 | 우선순위 |
|---|---------|---------|
| 1 | (요구사항) | 높음/중간/낮음 |

### 2.2 비기능 요구사항

(성능, 보안, 호환성 등)

## 3. 범위

### 3.1 포함 (In Scope)

(이번에 구현할 것)

### 3.2 제외 (Out of Scope)

(이번에 구현하지 않을 것)

## 4. Features

> Epic은 하나 이상의 Feature로 분해된다.
> 작은 작업은 Feature 1개, 큰 작업은 여러 Feature로 나뉜다.

### 4.1 Feature 분해

| # | Feature | 범위 요약 | 의존성 |
|---|---------|----------|--------|
| 1 | (Feature 이름) | (이 Feature가 구현할 것) | — |
| 2 | (Feature 이름) | (이 Feature가 구현할 것) | Feature 1 |

### 4.2 의존성 그래프

```
Feature 1 ──→ Feature 2
    │
    └──→ Feature 3 (독립, 병렬 가능)
```

### 4.3 Feature별 검증 기준 (Acceptance Criteria)

#### Feature 1: (Feature 이름)

- [ ] (이것이 충족되면 이 Feature는 완료)
- [ ] (구체적이고 검증 가능한 기준)

#### Feature 2: (Feature 이름)

- [ ] (검증 기준)
- [ ] (검증 기준)

### 4.4 통합 검증 기준 (Epic-Level)

> 모든 Feature가 완료된 후 전체 통합 검증에 사용되는 기준.

- [ ] (Feature 간 연결이 정상 동작하는지)
- [ ] (전체 사용자 플로우가 끊김 없이 작동하는지)

## 5. 성공 기준

| # | 기준 | 측정 방법 |
|---|------|-----------|
| 1 | (기준) | (측정 방법) |

## 6. 리스크

| 리스크 | 영향 | 대응 |
|--------|------|------|
| (리스크) | (영향) | (대응) |

---

*이 문서는 `/harness:plan {{epicName}}` 단계의 산출물입니다.*
*다음 단계: `/harness:design` (첫 번째 Feature부터)*
