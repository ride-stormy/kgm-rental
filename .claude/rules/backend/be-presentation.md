---
paths:
  - "**/backend/*/src/**/presentation/**/*.ts"
---

# Presentation Layer 컨벤션

## 역할

HTTP 요청/응답 처리. 비즈니스 로직을 포함하지 않는다.

## 디렉토리 구조

```
{module}/
  presentation/
    {name}.controller.ts
    dtos/
      {action}.{name}.dto.ts    # 예: create.staff.dto.ts
    interfaces/
      {name}.controller.interface.ts
    test/
      {name}.controller.spec.ts
```

## Controller

- 요청을 받아 Application Layer의 서비스에 위임만 한다.
- Domain 객체를 직접 반환하지 않는다. 반드시 Response DTO로 변환한다.
- Domain Layer, Infrastructure Layer에 직접 의존하지 않는다.
- 허용되는 의존: Application Service, Request DTO, Response DTO

## DTO

- 파일명은 `{action}.{name}.dto.ts` 형식을 따른다. (예: `create.staff.dto.ts`, `update.staff.dto.ts`)
- 하나의 파일에 Request DTO와 Response DTO를 함께 정의한다.
- Request 클래스명: `{Action}{Resource}RequestDto` (예: `CreateStaffRequestDto`)
- Response 클래스명: `{Action}{Resource}ResponseDto` (예: `CreateStaffResponseDto`)
- `class-validator` 데코레이터로 Request 입력값을 검증한다.
- `class-transformer`로 타입 변환이 필요한 경우 `@Type()` 데코레이터를 사용한다.
- Response DTO는 정적 팩토리 메서드 `from(domain)`으로 Domain → Response 변환을 캡슐화한다.
