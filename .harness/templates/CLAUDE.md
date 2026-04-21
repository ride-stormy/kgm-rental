## 프로젝트 구조 규칙

- MUST: 프론트엔드 코드는 `frontend` 폴더 안에 작성한다.
- MUST: 백엔드 코드는 `backend` 폴더 안에 작성한다.
- MUST: 새 파일을 생성하기 전에 해당 파일이 `frontend/` 또는 `backend/` (또는 허용된 예외 경로) 하위인지 확인한다.

`frontend` / `backend` 폴더의 위치(루트 직접 또는 모노레포 `apps/` 하위 등)는 기존 프로젝트 구조를 따른다.

### NEVER — 다음 행동은 절대 금지

- NEVER: `src/`, `app/`, `web/`, `client/`, `server/`, `api/` 등 대체 폴더명을 `frontend`/`backend` 대신 사용한다
- NEVER: "공통 코드"라는 이유로 `utils/`, `lib/`, `common/`, `shared/`를 루트에 직접 생성한다
- NEVER: 소스 파일을 루트에 임시로 생성한 뒤 나중에 이동하겠다고 판단한다 — 처음부터 올바른 위치에 생성한다
- NEVER: `index.ts`, `main.ts`, `app.ts` 등 진입점 파일을 `frontend/`·`backend/` 밖 루트에 생성한다
- NEVER: 테스트 파일(`.spec.ts`, `.test.ts`)을 `frontend/`·`backend/` 밖에 배치한다 — 테스트도 해당 앱 폴더 안에 위치한다
- NEVER: 스크립트·유틸리티라는 이유로 실질적인 비즈니스 로직을 구조 밖에 작성한다

### 예외 — 허용되는 위치

- 모노레포 공유 패키지: `packages/ui`, `packages/shared`, `packages/utils` 등 `packages/` 하위
- 프로젝트 루트 설정 파일: `package.json`, `turbo.json`, `tsconfig.json`, `.env`, `docker-compose.yml` 등
- CI/CD 설정: `.github/`, `.gitlab/` 등

## 세션 복원

세션 시작 시 진행 중인 피처가 있으면 복원 안내가 출력될 수 있습니다.
`/clear` 또는 `/compact` 이후에는 `/harness:status`로 현재 상태를 직접 확인하세요.
