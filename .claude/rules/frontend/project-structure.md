---
paths:
  - "**/frontend/src/**"
---

# 프로젝트 구조

디렉토리 구조, 도메인·공유 코드 배치 기준, export/import 패턴, co-location을 정의한다.

> 컴포넌트 계층 구조(Primitive/App-Shared/Domain)는 `components.md` 참조.

---

## 앱 디렉토리 구조

```
src/
├── app/                    # 화면/라우트 정의
│   ├── user/
│   │   ├── components/    # 도메인 전용 컴포넌트
│   │   ├── hooks/         # 도메인 전용 훅
│   │   └── page.tsx
│   └── order/
│       ├── components/
│       ├── hooks/
│       └── page.tsx
│
├── components/            # 앱 공통 컴포넌트 (2개 이상 도메인에서 사용)
│   ├── DataTable/
│   └── PageLayout/
│
├── services/              # 도메인별 API 로직 (react-query)
│   └── user/
│       ├── queries.ts     # React Query 훅
│       ├── schema.ts      # 요청/응답 검증 스키마 (zod)
│       ├── type.ts        # schema의 InferType
│       └── index.ts
│
├── hooks/                 # 공유 커스텀 훅
├── utils/                 # 공유 유틸리티 함수
├── store/                 # 전역 상태 관리
├── types/                 # 앱 공통 TypeScript 타입
├── assets/
│   └── style/             # 전역 스타일 (reset.css.ts, global.css.ts)
└── constants/             # 앱 전역 상수
    ├── routes.ts
    └── styles.ts          # 공유 레이아웃 치수
```

---

## 컴포넌트 디렉토리 구조

```
// ✅ 단순한 경우: 단일 파일
components/
  UserRoleTag.tsx

// ✅ 스타일·타입이 있는 경우: 디렉토리 + leaf barrel
components/
  UserRoleTag/
    UserRoleTag.tsx
    style.css.ts
    index.ts          ← leaf barrel

// ✅ 내부 sub-folder가 있어도 barrel 허용
components/
  SearchAddressSheet/
    SearchAddressSheet.tsx
    components/       ← 내부 구현 전용
    hooks/            ← 내부 구현 전용
    index.tsx         ← leaf barrel
```

---

## Export 규칙

### components/ — leaf 폴더에만 barrel index.ts 허용

**leaf 판단 기준**: 컴포넌트 하나를 대표 export하는 폴더면 leaf.
내부 구현용 `components/`, `hooks/` 하위 폴더는 leaf 판단에서 제외.

```typescript
// ✅ leaf barrel을 통한 import
import { DataTable } from '@/components/DataTable';

// ❌ 직접 파일 경로
import { DataTable } from '@/components/DataTable/DataTable';

// ❌ 독립 컴포넌트들을 묶는 그룹핑 폴더의 barrel 금지
// components/Payment/
//   FailPaymentLayout/   ← 독립 컴포넌트
//   FailPgLayout/        ← 독립 컴포넌트
//   index.ts             ← ❌ 금지
```

### services/ — wildcard export 허용

```typescript
// ✅ services/user/index.ts
export * from './queries';
export type * from './type';
```

---

## 폼 Schema Co-location

| 조건 | 위치 |
| --- | --- |
| 1개 컴포넌트에서만 사용 | 컴포넌트 디렉토리 `schema.ts` (예: `LoginForm/schema.ts`) |
| 2개 이상에서 공유 | `src/schema/{domain}/` (예: `src/schema/auth/loginSchema.ts`) |

> API 응답 검증용 schema → `services/{domain}/schema.ts`

---

## Path Aliases

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@utils/*": ["src/utils/*"],
      "@services/*": ["src/services/*"],
      "@types/*": ["src/types/*"],
      "@constants/*": ["src/constants/*"]
    }
  }
}

// ✅ path alias 사용
import { DataTable } from '@/components/DataTable';
import { useDebounce } from '@hooks/useDebounce';
import { useUserQuery } from '@services/user';

// ❌ 상대 경로 지옥
import { DataTable } from '../../../components/DataTable';
```

---

## 도메인 컴포넌트와 훅 배치

도메인 전용 코드는 해당 도메인 디렉토리 안에 위치한다. 재사용이 필요해지면 상위로 올린다.

```typescript
// ✅ 도메인 전용 훅
// src/app/user/hooks/useUserFilters.ts
export const useUserFilters = () => {
  const [filters, setFilters] = useState<UserFilters>({ search: '', page: 1 });
  const { data, isLoading } = useUsersQuery(filters);
  return { filters, data, isLoading };
};

// ✅ 도메인 전용 컴포넌트
// src/app/user/components/UserList.tsx
import { useUserFilters } from '../hooks/useUserFilters';

// ❌ 도메인 컴포넌트를 공유 폴더에 넣으면 안 됨
// src/components/UserCard.tsx ← 도메인 전용이면 안 됨
```

---

## 파일 간 co-location

관련 파일은 같은 디렉토리에 모아둔다.

```
// ✅ 컴포넌트 관련 파일 co-location
components/
  UserCard/
    UserCard.tsx       ← 컴포넌트
    UserCard.test.tsx  ← 테스트
    style.css.ts       ← 스타일
    types.ts           ← 타입
    index.ts           ← leaf barrel

// ❌ 파일 타입별로 분산
components/UserCard.tsx
tests/UserCard.test.tsx
styles/userCard.css.ts
```
