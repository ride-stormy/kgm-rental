---
paths:
  - "**/frontend/**/*.ts"
  - "**/frontend/**/*.tsx"
---

# TypeScript 패턴 & 규칙

이 파일은 TypeScript 타입 시스템 활용 규칙, 모듈 시스템, 타입 안전성 보장 방법을 정의한다. 타입 정의 기준, import/export 규칙, 함수 선언 방식을 포함한다.

---

## 기본 설정

모든 워크스페이스는 아래 설정을 따른다.

- `strict: true` — 모든 strict 옵션 활성화
- `noUnusedLocals: true`, `noUnusedParameters: true` — 미사용 코드 금지
- `noFallthroughCasesInSwitch: true` — switch fallthrough 금지

---

## 모듈 시스템

- ES Modules (`import`/`export`) 사용
- `require()` 금지

---

## Named Export 우선

```typescript
// ✅ named export
export const Button = ({ children }: ButtonProps) => { ... };
export const API_URL = '...';

// ❌ default export 지양
// 예외: Next.js의 page/layout 컴포넌트는 default export 필요
export default function Page() { ... }
```

---

## 타입 정의

### Interface vs Type

```typescript
// 컴포넌트 props, 객체 구조 → interface (확장 가능)
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

// 유니온 타입, 유틸리티 타입 → type
type Theme = 'light' | 'dark';
type Nullable<T> = T | null;
type UserStatus = 'active' | 'inactive' | 'withdrawn';
```

### Props 타입 네이밍

```typescript
// ✅ 컴포넌트명 + Props
interface CardProps { ... }
interface ModalProps { ... }

// ❌ I prefix, T prefix 사용 금지
interface ICardProps { ... }   // X
type TTheme = 'light' | 'dark'; // X
```

### 제네릭 타입 활용 — 중복 타입 제거

비슷한 구조의 타입이 반복되면 제네릭으로 통일한다.

```typescript
// ❌ 반복되는 타입 정의
interface UserListResponse {
  data: User[];
  total: number;
  page: number;
}

interface PostListResponse {
  data: Post[];
  total: number;
  page: number;
}

// ✅ 제네릭 타입으로 통일
interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
}

type UserListResponse = ListResponse<User>;
type PostListResponse = ListResponse<Post>;

// ✅ 제네릭 컴포넌트
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
}

const DataTable = <T,>({ data, columns, onRowClick }: DataTableProps<T>) => {
  return <table>{/* 구현 */}</table>;
};
```

---

## 함수 & 컴포넌트 선언 방식

모든 함수와 컴포넌트는 **arrow function**으로 작성한다.

```typescript
// ❌ function 선언문 사용 금지
function UserProfile(props: UserProfileProps) {
  return <div>{props.name}</div>;
}

function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ arrow function 사용
export const UserProfile = (props: UserProfileProps) => {
  return <div>{props.name}</div>;
};

export const calculateTotal = (items: Item[]) => {
  return items.reduce((sum, item) => sum + item.price, 0);
};
```

### 제네릭 이름 규칙

```typescript
// ✅ 의미있는 제네릭 이름
const useList = <TItem,>(initialItems: TItem[]) => { ... };
const fetchData = <TResponse,>(url: string): Promise<TResponse> => { ... };

// ❌ 복잡한 경우 단일 문자 사용 지양
const process = <T, U, V>() => { ... };
```

---

> Import 순서는 `convention.md` 참조.

---

## 타입 안전성

### Non-null Assertion 최소화

```typescript
// ❌ 남용 금지
const el = document.getElementById('root')!;

// ✅ 타입 가드 또는 early return
const el = document.getElementById('root');
if (!el) throw new Error('Root element not found');
```

### as 캐스팅 최소화

```typescript
// ❌ 무분별한 캐스팅
const data = response as UserData;

// ✅ 타입 가드 + 검증
const isUserData = (data: unknown): data is UserData =>
  typeof data === 'object' && data !== null && 'id' in data;
```

### unknown over any

```typescript
// ❌ any 사용 금지
const parse = (data: any) => { ... };

// ✅ unknown + 타입 가드
const parse = (data: unknown) => {
  if (typeof data === 'string') { ... }
};
```

---

## Enum 대신 const object

```typescript
// ❌ enum (tree-shaking 불가, 런타임 코드 생성)
enum Status {
  Active,
  Inactive,
}

// ✅ const object + as const
const Status = {
  Active: 'active',
  Inactive: 'inactive',
} as const;

type Status = (typeof Status)[keyof typeof Status];
// type Status = 'active' | 'inactive'

// 사용
const currentStatus: Status = Status.Active;
```

---

## 에러 처리

```typescript
// ✅ try-catch에서 unknown 타입 사용
const fetchUser = async (id: string): Promise<User> => {
  try {
    const response = await fetch(`/api/users/${id}`);

    if (!response.ok) {
      throw new Error(`사용자 조회 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error('사용자 조회 오류:', error.message);
    }
    throw error;
  }
};
```

