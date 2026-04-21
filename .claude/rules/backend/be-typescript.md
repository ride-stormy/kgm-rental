---
paths:
  - "**/backend/**/*.ts"
---

# TypeScript 컨벤션

## TypeScript 설정

- strict 모드 활성화
- `strictPropertyInitialization` 비활성화 (DI 프레임워크 호환)
- 데코레이터 활성화

## 코드 스타일

- 싱글 쿼트, 트레일링 콤마 (Prettier)
- ESLint `@typescript-eslint/recommended` 적용

## RORO 패턴

모든 함수/메서드의 input과 output은 객체 형태로 정의한다.

- interface 파일은 작업 폴더 하위 `interfaces/` 디렉토리에 관리한다.
- interface명: `{Action}{Class}{Input/Output}` (예: `CreateMemberServiceInput`)
- 반환값이 없는 메서드의 output은 `type {Action}{Class}Output = Record<string, never>`로 정의한다.

### 레이어별 RORO 적용

| 레이어 | 규칙 |
| --- | --- |
| Presentation | HTTP input은 DTO가 그 역할을 하므로 별도 input interface를 만들지 않아도 된다 |
| Application | 입출력 타입은 `services/interfaces/`에 정의한다 |
| Domain | 입출력 타입은 `repositories/interfaces/`, `domain-services/interfaces/`에 정의한다 |
| Infrastructure | Domain Layer에서 정의한 interface를 따른다. 인프라 고유 메서드가 있을 경우에만 별도 정의한다 |

## Import / Export 규칙

### index.ts 배럴 export 금지

`index.ts` 배럴 export 파일을 만들지 않는다. 모든 import는 실제 파일 경로를 직접 지정한다.

```typescript
// ✅ 실제 파일 경로
import { Member } from '@ride-office/backend-libs/modules/member/domain/domain-entities/member.domain-entity';

// ❌ 배럴 export
import { Member } from '@ride-office/backend-libs/modules/member';
```

### libs import alias

libs 내부 파일 간 상호 참조 시 `@ride-office/backend-libs/*` alias를 사용한다.

```typescript
// ✅ alias
import { Member } from '@ride-office/backend-libs/modules/member/domain/domain-entities/member.domain-entity';
import { DomainException } from '@ride-office/backend-libs/common/exceptions/domain.exception';

// ❌ 상대경로
import { Member } from '../../domain/domain-entities/member.domain-entity';
```
