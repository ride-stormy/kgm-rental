# Backend Rules

`.claude/rules/backend/`에 배치. `apps/backend/` 경로 기준으로 적용된다.

> 이 디렉토리는 프로젝트 고유의 구조/컨벤션 규칙만 포함한다.

## 파일 목록

| File | 역할 | 적용 대상 |
|------|------|----------|
| `be-monorepo.md` | 모노레포 구조, 앱 경로 규칙, 앱 간 격리, 신규 앱 체크리스트 | `apps/backend/**` |
| `be-common.md` | 아키텍처 의존 방향, 명령어, 레이어별 참조 가이드 | `apps/backend/**` |
| `be-typescript.md` | TypeScript 설정, RORO 패턴, 코드 스타일, Import/Export 규칙 | `apps/backend/**/*.ts` |
| `be-libs.md` | 공유 라이브러리 — Domain Entity, Value Object, DB Entity, Mapper | `apps/backend/libs/**/*.ts` |
| `be-presentation.md` | Presentation Layer — Controller, DTO | `{appName}/src/**/presentation/**/*.ts` |
| `be-application.md` | Application Layer — Use Case Service, Application Exception | `{appName}/src/**/application/**/*.ts` |
| `be-domain.md` | Domain Layer — Repository Interface, Domain Service | `{appName}/src/**/domain/**/*.ts` |
| `be-infrastructure.md` | Infrastructure Layer — Repository 구현체, Adapter | `{appName}/src/**/infrastructure/**/*.ts` |

## 교차참조 가이드

각 주제의 **단일 정본**:

| 주제 | 파일 |
|------|------|
| 모노레포 구조 / 앱 경로 | `be-monorepo.md` |
| 앱 간 격리 / 공유 코드 배치 | `be-monorepo.md` |
| 의존 방향 | `be-common.md` |
| 빌드·린트·테스트 명령어 | `be-common.md` |
| RORO 패턴 / 코드 스타일 | `be-typescript.md` |
| index.ts 배럴 export 금지 | `be-typescript.md` |
| libs import alias | `be-typescript.md` |
| Domain Entity / Value Object / DB Entity / Mapper | `be-libs.md` |
| Controller / DTO | `be-presentation.md` |
| Application Service / Application Exception | `be-application.md` |
| Repository Interface / Domain Service | `be-domain.md` |
| Repository 구현체 / Adapter | `be-infrastructure.md` |
