---
paths:
  - "**/backend/**"
---

# 백엔드 모노레포 구조

백엔드는 항상 모노레포로 구성한다. 단일 앱 프로젝트는 허용하지 않는다.

---

## 앱 경로 규칙

모든 백엔드 앱은 `apps/backend/{appName}` 경로에 위치한다.

```
apps/backend/
  regular/          # 일반 사용자 API
  admin/            # 관리자 API
  batch/            # 배치/스케줄러
  libs/             # 앱 간 공유 라이브러리
```

- `{appName}`은 kebab-case로 작성한다.
- 새로운 앱을 추가할 때는 반드시 이 경로 규칙을 따른다. (예: `apps/backend/notification/`, `apps/backend/gateway/`)
- `apps/backend/` 바깥에 백엔드 앱을 생성하지 않는다.

---

## 기본 앱 유형

| 앱        | 역할                      | 특성                                      |
| --------- | ------------------------- | ----------------------------------------- |
| `regular` | 일반 사용자 대상 API 서버 | REST API, 인증/인가, 사용자 요청 처리     |
| `admin`   | 관리자 대상 API 서버      | 관리 기능, 내부 운영 도구, 별도 인증 체계 |
| `batch`   | 배치/스케줄러             | 정기 작업, 데이터 처리, 이벤트 기반 작업  |

프로젝트 요구에 따라 앱을 추가할 수 있다. (예: `gateway`, `notification`, `worker`)

---

## 앱 내부 구조

모든 앱은 동일한 DDD 4-Layer 구조를 따른다.

```
apps/backend/{appName}/
  src/
    decorators/                  # 횡단 관심사
    filters/
    interceptors/
    modules/                     # Bounded Context 단위 기능 모듈
      {module}/
        presentation/
        application/
        domain/
        infrastructure/
        {module}.module.ts
    app.module.ts
    main.ts
  test/                          # e2e 테스트
  tsconfig.app.json
  tsconfig.json
```

- 새로운 앱을 추가할 때 이 디렉토리 구조를 그대로 적용한다.
- 레이어별 세부 컨벤션은 각 레이어 룰 파일을 참조한다.

---

## 앱 간 격리 규칙

### 앱 간 직접 import 금지

```typescript
// ❌ 앱 간 직접 참조 금지
import { MemberService } from "../../regular/src/modules/member/application/services/member.service";

// ✅ 공유 코드는 libs를 통해 참조
import { Member } from "@ride-office/backend-libs/modules/member/domain/domain-entities/member.domain-entity";
```

### 공유 코드 배치 기준

| 공유 대상                                      | 위치                 | 예시                      |
| ---------------------------------------------- | -------------------- | ------------------------- |
| Domain Entity, Value Object, DB Entity, Mapper | `apps/backend/libs/` | 회원, 예약 등 도메인 모델 |
| 도메인 무관 상수, enum                         | `packages/shared/`   | 상태 코드, 공통 enum      |

- 2개 이상의 앱에서 사용하는 도메인 모델은 `libs/`로 추출한다.
- 1개 앱에서만 사용하는 코드는 해당 앱 내부에 둔다. 다른 앱에서 필요해지는 시점에 `libs/`로 이동한다.

---

## 신규 앱 추가 체크리스트

새로운 백엔드 앱을 추가할 때 다음을 확인한다.

1. **경로**: `apps/backend/{appName}/` 에 생성
2. **NestJS 설정**: `nest-cli.json`에 프로젝트 등록
3. **패키지 설정**: `apps/backend/{appName}/package.json` 생성, workspace 프로토콜로 libs 의존성 선언
4. **tsconfig**: `tsconfig.app.json`에 paths alias 설정
5. **빌드/실행 명령어**: `nest build {appName}`, `nest start {appName} --watch`
6. **린트 범위**: ESLint 설정에 새 앱 경로 추가
7. **환경 변수**: 앱별 `.env` 또는 공유 환경 설정 확인

---

## 워크스페이스 설정

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/backend/*"
  - "packages/*"
```

- 모든 앱은 pnpm workspace 멤버로 등록한다.
- Turborepo `turbo.json`에 빌드/린트/테스트 파이프라인을 정의한다.
- 앱별 `package.json`의 `name`은 `@{org}/backend-{appName}` 형태로 통일한다.
