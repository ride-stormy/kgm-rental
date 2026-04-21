---
paths:
  - "**/backend/libs/**/*.ts"
---

# libs 레이어 컨벤션

## 역할

앱 간 공유 도메인 모델과 인프라 구현체. 모든 백엔드 앱이 공통으로 참조한다.

- **domain-entities**: 순수 도메인 모델, 비즈니스 불변식 보호
- **value-objects**: 불변 값 객체
- **exceptions**: 도메인 예외
- **db-entities**: TypeORM ORM 매핑 전용
- **mappers**: DB Entity ↔ Domain Entity 변환

## 디렉토리 구조

```
libs/src/
  modules/
    {module}/
      domain/
        domain-entities/
          {name}.domain-entity.ts
          interfaces/
            {name}.domain-entity.interface.ts
          test/
            {name}.domain-entity.spec.ts
        value-objects/                        # (필요 시)
          {name}-{vo}.value-object.ts
          interfaces/
            {name}-{vo}.value-object.interface.ts
          test/
            {name}-{vo}.value-object.spec.ts
        exceptions/
          {name}.exception.ts
      infrastructure/
        db-entities/
          {name}.db-entity.ts
        mappers/
          {name}.mapper.ts
          interfaces/
            {name}.mapper.interface.ts
          test/
            {name}.mapper.spec.ts
        exceptions/                           # (필요 시) 인프라 고유 예외
  config/                                     # NestJS ConfigModule 설정
  migrations/                                 # TypeORM 마이그레이션
```

---

## Domain Entity

### 파일 규칙

- 파일명: `{name}.domain-entity.ts`
- 클래스명: `{Name}` (예: `Member`, `Session`) — `DomainEntity` 접미사 없음

### 구현 규칙

- 모든 프로퍼티는 `private _{name}`으로 정의하고, `get {name}()` getter로만 노출한다.
- setter를 노출하지 않는다. 의미 있는 행위 메서드로 상태를 변경한다. (예: `activate()`, `revoke()`)
- **행위 메서드는 `void`를 반환하며 인스턴스 내부 상태를 직접 변경한다.** Entity는 고유 ID로 정체성이 유지되는 가변(mutable) 객체다. 새 인스턴스를 반환하는 패턴은 Value Object에만 적용한다.
- 생성은 반드시 정적 팩토리 메서드 `create()`로만 한다. `constructor`를 직접 호출하지 않는다.
- 재구성(DB → Domain)은 `restore()` 정적 팩토리로 한다.
- TypeORM 등 외부 라이브러리에 의존하지 않는 순수 도메인 모델이다.

```typescript
// 예시: member.domain-entity.ts
export class Member {
  private _id: string;
  private _name: string;
  private _status: MemberStatus;

  private constructor(id: string, name: string, status: MemberStatus) {
    this._id = id;
    this._name = name;
    this._status = status;
  }

  static create(input: CreateMemberInput): Member { ... }
  static restore(props: MemberRestoreProps): Member { ... }

  get id() { return this._id; }
  get name() { return this._name; }
  get status() { return this._status; }

  activate(): void {
    this._status = MemberStatus.Active;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._status = MemberStatus.Inactive;
    this._updatedAt = new Date();
  }
}
```

> **Entity vs Value Object 구분**
> - Entity: ID 기반 정체성, 가변(mutable), 행위 메서드 → `void`
> - Value Object: 값 기반 동등성, 불변(immutable), 상태 변경 → 새 인스턴스 반환

---

## Domain Exception

- 파일명: `{name}.exception.ts`
- `DomainException` (`libs/src/common/exceptions/domain.exception.ts`) 또는 `ApplicationException`을 상속한다.
- 하나의 파일에 해당 모듈의 모든 예외 클래스를 정의한다.

```typescript
// 예시: member.exception.ts
import { DomainException } from '@ride-office/backend-libs/common/exceptions/domain.exception';

export class MemberNotFoundException extends DomainException {
  constructor() { super('구성원을 찾을 수 없습니다.', 'MEMBER_NOT_FOUND'); }
}
```

---

## Value Object (필요 시)

- 불변(immutable)으로 설계한다.
- 동등성(equality)은 값으로 비교한다.
- 생성 시 자기 검증 로직을 포함한다. (예: `Email.create('invalid')` → 예외)
- 파일명: `{name}-{vo}.value-object.ts` (예: `member-email.value-object.ts`)

---

## DB Entity

- 파일명: `{name}.db-entity.ts`, 클래스명: `{Name}DbEntity` (예: `MemberDbEntity`)
- `@Entity`, `@Column` 등 TypeORM 데코레이터는 DB Entity에만 붙인다.
- ORM 스키마 매핑만 담당하며 비즈니스 로직을 포함하지 않는다.
- 모든 컬럼 데코레이터(`@PrimaryColumn`, `@Column`, `@CreateDateColumn`, `@UpdateDateColumn`, `@DeleteDateColumn` 등)에 `name` 옵션을 반드시 명시한다. 값은 프로퍼티명과 동일한 camelCase를 사용한다.
- 프로퍼티에 `!` (definite assignment assertion)를 붙이지 않는다. (TS 설정 → `be-typescript.md`)

```typescript
// 예시: member.db-entity.ts
@Entity('member')
export class MemberDbEntity {
  @PrimaryColumn({ name: 'id', type: 'varchar', length: 36 })
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'jobTitle', type: 'varchar', length: 255 })
  jobTitle: string;

  @CreateDateColumn({ name: 'createdAt', type: 'datetime' })
  createdAt: Date;
}
```

---

## Mapper

- 파일명: `{name}.mapper.ts`, 클래스명: `{Name}Mapper` (예: `MemberMapper`)
- 정적 메서드 `toDomain(entity: DbEntity): DomainEntity`와 `toOrm(domain: DomainEntity): Partial<DbEntity>`를 제공한다.

