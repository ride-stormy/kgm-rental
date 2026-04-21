---
paths:
  - "**/frontend/**/components/**/*.tsx"
---

# 컴포넌트 계층 구조

2-Tier 컴포넌트 계층 구조와 각 계층의 역할, 컴포넌트 위치 결정 기준을 정의한다.

컴포넌트를 작성하기 전, 반드시 아래 기준으로 **어디에 만들어야 할지 먼저 결정**한다.

> 컴포넌트 디렉토리 구조와 barrel export 규칙은 `project-structure.md` 참조.
> 컴포넌트 내부 import 순서는 `convention.md` 참조.

---

## 2-Tier 컴포넌트 구조

```
[Primitive]  │ 디자인 시스템  │ packages/ui/src/      ← 선택 (있는 경우 외부 패키지로 import)
──────────────────────────────────────────────────
Tier 1       │ App-Shared    │ src/components/
Tier 2       │ Domain        │ src/{feature}/**/components/
                               또는 src/app/{route}/**/components/
```

계층은 단방향 의존만 허용된다.

```
Domain → App-Shared → Primitive(있는 경우)
```

상위 계층이 하위 계층을 import하는 것은 금지다.

```typescript
// ❌ App-Shared가 Domain을 import
// src/components/Table.tsx
import { UserRoleTag } from '@/user/components/UserRoleTag';

// ❌ Primitive가 있는 경우, App-Shared를 import하면 안 됨
// ui/src/Button.tsx
import { useAppTheme } from '@/app/theme';
```

---

## Tier 판별 기준 (결정 트리)

```
Q1. 비즈니스 로직, API 호출, 도메인 지식이 있는가?
    ├─ Yes → Tier 2 (Domain)
    └─ No  ↓

Q2. 특정 도메인/메뉴에서만 의미가 있는가?
    ├─ Yes → Tier 2 (Domain)
    └─ No  ↓

Q3. 2개 이상의 도메인/페이지에서 공유하는가?
    ├─ Yes → Tier 1 (App-Shared)
    └─ No  → Tier 2 (Domain) — 아직 재사용 필요 없음, 낮은 계층에서 시작

Q4. (Primitive가 있는 경우만) 어느 앱/도메인에서도 그대로 쓰일 수 있는가?
    ├─ Yes → Primitive (packages/ui에 추가 요청)
    └─ No  → Tier 1 (App-Shared)
```

판별이 애매하면 **낮은 계층(Domain)부터 시작**하고, 재사용 필요가 생길 때 상위로 올린다.

---

## Tier 1: App-Shared 컴포넌트

특정 앱 내부에서 2개 이상의 도메인/페이지에서 사용되는 공통 컴포넌트.

**필수 조건**:
- 특정 도메인 로직 없음
- 2개 이상의 라우트에서 공유 (하나의 라우트에서만 쓰이면 Tier 2)
- API 호출 없음

```typescript
// ✅ 앱 전반에서 반복되는 패턴
DataTable, PageLayout, Breadcrumb, ErrorBoundary, ConfirmModal, FormField;

// ❌ 한 도메인에서만 쓰이는 컴포넌트
UserStatusBadge; // user 도메인만 → Tier 2 (Domain)
```

> Export 규칙은 `project-structure.md` 참조.

---

## Tier 2: Domain 컴포넌트

특정 도메인/메뉴에 종속된 컴포넌트. 도메인의 비즈니스 규칙, API 호출, 도메인 타입을 직접 다룬다.

**필수 조건**:
- 도메인 경계 준수: 다른 도메인의 컴포넌트를 직접 import하지 않음
- 필요 시 Tier 1(App-Shared)로 올리거나, 도메인 경계를 props로 분리

```typescript
// ✅ 도메인 지식을 포함하는 컴포넌트
UserRoleTag; // UserRole 타입 알고 있음
OrderStatusBadge; // OrderStatus 알고 있음
ProductPriceDisplay; // 할인율, 세금 계산 로직 포함
```

**다른 도메인 의존 시 처리 방법**:
```typescript
// ❌ 다른 도메인 컴포넌트 직접 import 금지
import { UserAvatar } from '@/user/components/UserAvatar';

// ✅ props로 받거나, Primitive가 있는 경우 Primitive 컴포넌트를 사용
interface OrderCardProps {
  order: Order;
  sellerName: string;     // user 도메인 데이터를 값으로 받음
  sellerAvatarUrl: string;
}

export const OrderCard = ({ order, sellerName, sellerAvatarUrl }: OrderCardProps) => (
  <div>
    <Avatar src={sellerAvatarUrl} name={sellerName} />
    <OrderStatusBadge status={order.status} />
  </div>
);
```

---

## 계층 이동 기준

**올려야 할 때 (Domain → App-Shared)**:
- 2개 이상의 도메인에서 동일한 컴포넌트가 필요할 때
- 비즈니스 로직 없이 UI만 공유하면 충분할 때

**내리면 안 될 때**: 상위 계층 컴포넌트에 도메인 로직 추가 목적으로 하위로 내리는 것은 금지.

```typescript
// ❌ App-Shared에 도메인 로직 추가 금지
// src/components/PageLayout.tsx에 권한 체크 추가 — 금지

// ✅ Domain 컴포넌트에서 감싸서 확장 (Primitive 또는 App-Shared를 합성)
import { PageLayout } from '@/components/PageLayout';
import { usePermission } from '@/hooks/usePermission';

export const AdminPageLayout = ({ action, children, ...props }: AdminPageLayoutProps) => {
  const { canPerform } = usePermission();
  if (!canPerform(action)) return null;
  return <PageLayout {...props}>{children}</PageLayout>;
};
```

---

## 요약 판별표

| 기준 | Primitive (선택, 외부) | App-Shared (Tier 1) | Domain (Tier 2) |
| --- | --- | --- | --- |
| 비즈니스 로직 | ❌ 없음 | ❌ 없음 | ✅ 허용 |
| API 호출 | ❌ 없음 | ❌ 없음 | ✅ 허용 |
| 도메인 타입 import | ❌ 없음 | ❌ 없음 | ✅ 허용 |
| 사용 범위 | 앱 무관 | 동일 앱 내 전역 | 동일 도메인 내 |
| Storybook | ✅ 필수 | 선택 | ❌ 불필요 |
