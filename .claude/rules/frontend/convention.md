---
paths:
  - "**/frontend/**/*.ts"
  - "**/frontend/**/*.tsx"
---

# 네이밍 & 코딩 컨벤션

이 파일은 코드베이스 전반의 명명 규칙, import 순서, 파일 내 코드 배치 순서를 정의한다.

> TypeScript 타입 규칙은 `typescript.md` 참조.

---

## Boolean 변수는 `is` 접두어 사용

```typescript
// ❌
const loading = true;
const visible = false;

// ✅
const isLoading = true;
const isVisible = false;
const isActive = user.status === 'active';
const isAuthenticated = !!token;
```

---

## 파일 명명 규칙

```
// 컴포넌트 파일: PascalCase
UserProfile.tsx
DataTable.tsx

// 유틸리티, 훅, 타입 파일: camelCase
formatDate.ts
useAuth.ts
user.ts

// 스타일 파일: *.css.ts
style.css.ts
layout.css.ts
```

---

## 직관적이고 서술적인 함수 이름

```typescript
// ❌ 모호한 이름
const handleData = (d: User) => {};
const process = () => {};

// ✅ 명확한 이름
const formatUserDisplayName = (user: User) => {};
const validateEmailFormat = (email: string) => {};
const fetchUserProfile = (userId: string) => {};
const calculateTotalPrice = (items: Item[]) => {};
```

---

## Import 순서

모든 파일에서 아래 순서를 따른다.

```typescript
// 1. 외부 라이브러리 (React, third-party)
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. 내부 패키지 (디자인 시스템, 공유 패키지)
import { Button } from '@project/ui';

// 3. 공유 컴포넌트 (@/components/)
import { DataTable } from '@/components/DataTable';

// 4. 같은 도메인 내 import
import { useUserQuery } from '../queries/userQueries';

// 5. 스타일
import * as styles from './style.css';

// 6. import type — 출처(외부/내부)와 무관하게 모든 일반 import 뒤에 위치
import type { UserData } from '@/types';
import type { Metadata } from 'next';
```

---

## 파일 내 코드 배치 순서

파일은 위에서 아래로 읽힌다. 코드는 논리적 흐름 순서로 배치한다.

```typescript
// 1. import (위 순서대로)
import { useState } from 'react';
import type { User } from '@/types';

// 2. 타입/인터페이스
interface UserProfileProps {
  userId: string;
  onEdit?: (userId: string) => void;
}

// 3. 상수
const MAX_BIO_LENGTH = 200;

// 4. 메인 컴포넌트 또는 함수
export const UserProfile = ({ userId, onEdit }: UserProfileProps) => {
  // ...
};

// 5. 헬퍼 함수 (사용 순서대로)
const formatDisplayName = (user: User | undefined) => {
  if (!user) return '로딩 중...';
  return user.name || user.email;
};

const truncateBio = (bio: string | undefined) => {
  if (!bio) return '';
  return bio.length <= MAX_BIO_LENGTH ? bio : `${bio.slice(0, MAX_BIO_LENGTH)}...`;
};
```

**원칙**: 헬퍼 함수는 호출하는 코드 아래에 위치. 파일을 위아래로 오가며 읽어야 하는 구조를 피한다.
