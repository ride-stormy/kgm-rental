---
paths:
  - "**/backend/*/src/**/application/**/*.ts"
---

# Application Layer 컨벤션

## 역할

`{appName}/src/modules/{module}/application/` 에 위치한다.

유스케이스 오케스트레이션. 도메인 객체를 조합하여 비즈니스 흐름을 실행한다.

## 디렉토리 구조

```
{module}/
  application/
    services/
      {name}.service.ts
      interfaces/
        {name}.service.interface.ts
      test/
        {name}.service.spec.ts
    exceptions/                    # (필요 시) 유스케이스 실행 중 발생하는 예외
      {name}.exception.ts
```

## Application Service

- 파일명: `{name}.service.ts`, 클래스명: `{Name}Service`
- 하나의 퍼블릭 메서드가 하나의 유스케이스를 표현한다.
- 도메인 로직을 직접 구현하지 않는다. Domain Layer의 Entity/Domain Service에 위임한다.
- Repository 인터페이스(Domain Layer에 정의)를 주입받아 데이터에 접근한다.
- Infrastructure Layer의 구체 클래스에 직접 의존하지 않는다. (DIP 원칙)
- 트랜잭션 경계는 Application Service에서 관리한다.
- 입출력 타입은 `services/interfaces/`에 정의한다. (RORO 패턴 → `be-typescript.md`)
- 허용되는 의존: Domain Entity (`libs`), Domain Service, Repository Interface (Domain Layer에 정의)

```typescript
// 예시: member.service.ts
@Injectable()
export class MemberService implements IMemberService {
  constructor(
    @Inject(MEMBER_REPOSITORY)
    private readonly memberRepository: MemberRepository,
  ) {}

  async findById(input: FindMemberByIdServiceInput): Promise<FindMemberByIdServiceOutput> {
    const result = await this.memberRepository.findById({ id: input.id });
    return { member: result.member };
  }
}
```

## Application Exception

`application/exceptions/`에는 유스케이스 실행 중 Service가 던지는 예외 클래스를 정의한다.

- **언제 만드나**: Service 메서드가 특정 조건에서 예외를 던져야 할 때. 예를 들어 `findOne`을 했는데 데이터가 없는 경우, 상태가 기대와 다른 경우 등.
- **base class**: `ApplicationException` (`@ride-office/backend-libs/common/exceptions/application.exception`) 상속.
- `DomainException`을 상속하는 예외(도메인 불변식 위반)는 `libs/src/modules/{module}/domain/exceptions/`에 정의한다.

```typescript
// 예시: application/exceptions/member.application-exception.ts
import { ApplicationException } from '@ride-office/backend-libs/common/exceptions/application.exception';

export class MemberNotFoundApplicationException extends ApplicationException {
  constructor(id: string) {
    super(`구성원(${id})을 찾을 수 없습니다.`, 'MEMBER_NOT_FOUND');
  }
}
```

## 단위 테스트

- Repository는 mock으로 대체한다.
- 유스케이스 흐름(정상/예외)을 검증한다.
