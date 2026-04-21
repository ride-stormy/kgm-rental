---
paths:
  - "**/backend/*/src/**/domain/**/*.ts"
---

# Domain Layer 컨벤션

## 역할

`{appName}/src/modules/{module}/domain/` 에 위치한다.

- **Repository Interface**: Domain Layer에서 데이터 접근 계약을 정의한다. 구현체는 Infrastructure Layer에 둔다.
- **Domain Service** (필요 시): 단일 Entity에 속하지 않는 도메인 로직을 담당한다.

> Domain Entity, Value Object, Domain Exception은 `libs/`에 위치한다. → `.claude/rules/be-libs.md` 참조

## 디렉토리 구조

```
{module}/
  domain/
    repositories/
      {name}.repository.ts                   # Repository 인터페이스 + Symbol
      interfaces/
        {name}.repository.interface.ts       # 입출력 타입 정의
    domain-services/                         # (필요 시)
      {name}.domain-service.ts
      interfaces/
        {name}.domain-service.interface.ts
      test/
        {name}.domain-service.spec.ts
```

---

## Repository Interface

- `{name}.repository.ts`에 인터페이스와 주입 토큰(Symbol)을 함께 정의한다.
- 메서드명은 도메인 언어를 사용한다. (예: `findActiveMembers()`, `save()`)
- 입출력 타입은 `interfaces/` 서브디렉토리에 정의한다.
- 구체 구현은 Infrastructure Layer에 둔다. Domain Layer는 인터페이스에만 의존한다.

```typescript
// 예시: member.repository.ts
import {
  FindMemberByIdRepositoryInput,
  FindMemberByIdRepositoryOutput,
  SaveMemberRepositoryInput,
  SaveMemberRepositoryOutput,
} from './interfaces/member.repository.interface';

export const MEMBER_REPOSITORY = Symbol('MEMBER_REPOSITORY');

export interface MemberRepository {
  findById(input: FindMemberByIdRepositoryInput): Promise<FindMemberByIdRepositoryOutput>;
  save(input: SaveMemberRepositoryInput): Promise<SaveMemberRepositoryOutput>;
}
```

```typescript
// 예시: member.repository.interface.ts
import { Member } from '@ride-office/backend-libs/modules/member/domain/domain-entities/member.domain-entity';

export interface FindMemberByIdRepositoryInput { id: string }
export interface FindMemberByIdRepositoryOutput { member: Member | null }

export interface SaveMemberRepositoryInput { member: Member }
export interface SaveMemberRepositoryOutput { member: Member }
```

---

## Domain Service (필요 시)

- 단일 Entity에 속하지 않는 도메인 로직을 담당한다.
- 상태를 갖지 않는다 (stateless).
