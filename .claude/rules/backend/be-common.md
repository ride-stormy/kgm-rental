---
paths:
  - "**/backend/**"
---

# 백엔드 공통 컨벤션

## 아키텍처

- **의존 방향**: Presentation → Application → Domain ← Infrastructure
- **ORM**: TypeORM 0.3.20

> 모노레포 구조·앱 경로·앱 간 격리 → `be-monorepo.md`
> TypeScript 설정·RORO 패턴·코드 스타일 → `be-typescript.md`

## 명령어

### 개발 서버

```bash
nest start {appName} --watch
```

### 빌드

```bash
nest build {appName}
```

> **`tsc`를 직접 실행하지 않는다.** 기본 `tsconfig.json`에 `outDir`이 없어서 소스 디렉토리에 `.js`, `.d.ts` 파일이 생성된다. 반드시 `nest build` 또는 `nest start`를 사용한다.

### 린트 & 포맷

```bash
eslint "{appName}/src/**/*.ts"
```

### 테스트

```bash
jest
```

## 레이어별 컨벤션 참조

작업 위치에 따라 해당 룰 파일을 읽고 따른다.

```
apps/backend/ (전체 구조)       → .claude/rules/be-monorepo.md
apps/backend/**/*.ts (TS/RORO)  → .claude/rules/be-typescript.md

libs/src/modules/{module}/       → .claude/rules/be-libs.md

{appName}/src/modules/{module}/
  {name}.module.ts               # NestJS Module (레이어에 속하지 않음)
  presentation/                  → .claude/rules/be-presentation.md
  application/                   → .claude/rules/be-application.md
  domain/                        → .claude/rules/be-domain.md
  infrastructure/                → .claude/rules/be-infrastructure.md
```
