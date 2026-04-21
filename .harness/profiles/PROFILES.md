# Available Profiles

> 이 파일은 사용 가능한 프로필 목록입니다.
> /harness:init 실행 시 반드시 이 파일을 읽고, 여기에 있는 프로필만 선택지로 제공하세요.
> 이 목록에 없는 프로필을 임의로 만들어내는 것을 금지합니다.

## Profiles

| Name | Version | Architecture | Description |
|------|---------|-------------|-------------|
| blank | 1.0.0 | custom | 빈 프로필. 빌드/린트 명령 없이 시작. |
| ridenow-fullstack | 1.0.0 | ddd-4layer | pnpm + Turborepo 모노레포. React 19 + Vite(admin), Next.js 15(b2c), NestJS 10, PostgreSQL, TypeORM, Vanilla Extract, DDD 4-Layer. |
| rachelin | 1.0.0 | custom | 라슐랭 프로젝트 프로필. React + TypeScript, Nest.js + TypeScript, MySQL, Tailwind CSS. |
| ride-hr | 1.0.0 | ddd-4layer | ride-hr 프로젝트 프로필. React + TypeScript, Nest.js + TypeScript, MySQL, Tailwind CSS. |

## How to Add

새 프로필을 추가하면 이 파일도 함께 업데이트하세요.
