# Frontend Rules

`.claude/rules/frontend/`에 배치. `apps/frontend/` 경로 기준으로 적용된다.

> **React 성능 최적화 및 best practices 검증**은 `~/.claude/skills/vercel-react-best-practices` 스킬이 담당한다.
> 이 디렉토리는 프로젝트 고유의 구조/컨벤션 규칙만 포함한다.

## 파일 목록

| File | 역할 | 적용 대상 |
|------|------|----------|
| `convention.md` | 명명 규칙, import 순서, 파일 내 코드 배치 순서 | `**/*.ts`, `**/*.tsx` |
| `typescript.md` | TypeScript 타입 시스템, 모듈, 타입 안전성 | `**/*.ts`, `**/*.tsx` |
| `components.md` | 2-Tier 컴포넌트 계층 구조 (App-Shared/Domain, Primitive는 선택) | `**/components/**/*.tsx` |
| `project-structure.md` | 디렉토리 구조, Export/Import 패턴, co-location | `src/**` |

## 교차참조 가이드

각 주제의 **단일 정본**:

| 주제 | 파일 |
|------|------|
| Import 순서 | `convention.md` |
| 파일 내 코드 배치 순서 | `convention.md` |
| Barrel export / 디렉토리 구조 | `project-structure.md` |
| Schema co-location | `project-structure.md` |
| 컴포넌트 위치 결정 | `components.md` |
| React 성능 / best practices | `vercel-react-best-practices` 스킬 |
