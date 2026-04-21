---
paths:
  - "**/backend/*/src/**/infrastructure/**/*.ts"
---

# Infrastructure Layer 컨벤션

## 역할

`{appName}/src/modules/{module}/infrastructure/` 에 위치한다.

Domain Layer에 정의된 Repository 인터페이스를 구체적으로 구현한다. DB 접근, 외부 서비스 연동 등 기술적 구현 세부사항을 담당한다.

> DB Entity, Mapper는 `libs/`에 위치한다. → `.claude/rules/be-libs.md` 참조

## 디렉토리 구조

```
{module}/
  infrastructure/
    repositories/
      {name}.{tech}.repository.ts             # 예: member.typeorm.repository.ts
      interfaces/
        {name}.{tech}.repository.interface.ts # (인프라 고유 메서드가 있을 경우만)
      test/
        {name}.{tech}.repository.spec.ts
    adapters/                                 # (필요 시) 외부 서비스 어댑터
      {name}.{tech}.adapter.ts
```

## 파일 네이밍

- `{tech}`에는 구현 기술명을 사용한다. (예: `typeorm`, `redis`, `axios`)
- 클래스명: `{Name}{Tech}Repository` (예: `MemberTypeormRepository`)

## Repository 구현

- Domain Layer에 정의된 Repository 인터페이스를 구현한다.
- `@Injectable()` 데코레이터를 붙인다.
- `@InjectRepository(DbEntity)`로 TypeORM Repository를 주입받는다. DB Entity는 `@ride-office/backend-libs` alias로 import한다.
- DB Entity ↔ Domain Entity 변환은 `libs/`의 Mapper를 사용한다.
- 쿼리 최적화, 페이징 등 기술적 관심사는 이 레이어에서 처리한다.
- 인프라 고유 메서드(도메인 인터페이스에 없는 것)가 있는 경우에만 `interfaces/` 서브디렉토리에 별도 인터페이스를 정의한다.

```typescript
// 예시: member.typeorm.repository.ts
@Injectable()
export class MemberTypeormRepository implements MemberRepository {
  constructor(
    @InjectRepository(MemberDbEntity)
    private readonly ormRepository: Repository<MemberDbEntity>,
  ) {}

  async findById(input: FindMemberByIdRepositoryInput): Promise<FindMemberByIdRepositoryOutput> {
    const entity = await this.ormRepository.findOne({ where: { id: input.id } });
    return { member: entity ? MemberMapper.toDomain(entity) : null };
  }
}
```

## 외부 서비스 어댑터 (필요 시)

- 외부 API 호출, 메시지 큐 등은 `adapters/` 에 어댑터로 구현한다.
- Domain Layer에 정의된 인터페이스(Port)를 구현하는 형태(Adapter)로 작성한다.
