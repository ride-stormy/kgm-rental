# Feature Design: vehicle-hook-sections

> Epic Plan: [vehicle-hook-sections.plan.md](../../01-plan/vehicle-hook-sections.plan.md)
> Feature Plan: [features/vehicle-hook-sections.plan.md](../../01-plan/features/vehicle-hook-sections.plan.md)

## 1. Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | vehicle-hook-sections |
| 선택 옵션 | **Option B — Clean Architecture** |
| 근거 | 선행 Feature `hero-hooking-v2`의 `HeroSection + hero/` 패턴을 그대로 계승. 공통 컴포넌트(SectionChip, DualCta)를 `shared/`로 분리해 Actyon/Torres 두 섹션에서 재사용 |
| 작성일 | 2026-04-22 |
| 프로필 | blank (verification.commands: frontend-b2c 설정 완료) |

### 설계 원칙

1. **오케스트레이터 + 서브 컴포넌트**: 각 Section은 `_content/landing.ts`에서 콘텐츠를 읽고 서브 컴포넌트에 props로 넘긴다.
2. **2-Tier 준수**: 모든 신규 컴포넌트는 Domain Tier(`app/_components/landing/`)에 위치. `shared/`는 **landing 도메인 내부 공용**이며 App-Shared로 올리지 않는다(다른 라우트에서 쓰이지 않음).
3. **Arrow function + Named export + Props suffix** 컨벤션 유지.
4. **Figma 실측값 사용**: 색상·간격·폰트는 Figma `get_design_context`로 확인한 값만 기록. 추측 금지.

---

## 2. 디렉토리 구조

### 2.1 최종 트리 (변경 파일 표시)

```
apps/frontend/b2c/
├── app/
│   ├── _components/
│   │   └── landing/
│   │       ├── HeroSection.tsx                      (무변경)
│   │       ├── hero/
│   │       │   ├── HeroHeadline.tsx                 (M — 버튼 색상)
│   │       │   ├── HeroEventBand.tsx                (무변경)
│   │       │   ├── HeroLineupImage.tsx              (무변경)
│   │       │   └── LogoKgmWithRide.tsx              (무변경)
│   │       ├── ActyonSection.tsx                    (N)
│   │       ├── actyon/
│   │       │   ├── ActyonSpecCard.tsx               (N)
│   │       │   └── ActyonSpecList.tsx               (N)
│   │       ├── TorresSection.tsx                    (N)
│   │       ├── torres/
│   │       │   └── TorresComparisonTable.tsx        (N)
│   │       └── shared/
│   │           ├── SectionChip.tsx                  (N)
│   │           └── DualCta.tsx                      (N)
│   ├── _content/
│   │   └── landing.ts                               (M — actyon/torres 키 추가)
│   └── page.tsx                                     (M — 섹션 삽입)
├── public/
│   └── images/
│       └── landing/
│           └── actyon.png                           (N — Figma 에셋)
└── tailwind.config.ts                               (M — kgm.blue.600 토큰)
```

범례: N = 신규, M = 수정

### 2.2 파일 수

- 신규 TSX: 7개 (`ActyonSection`, `ActyonSpecCard`, `ActyonSpecList`, `TorresSection`, `TorresComparisonTable`, `SectionChip`, `DualCta`)
- 신규 에셋: 1개 (`actyon.png`)
- 수정 TSX/TS: 4개 (`HeroHeadline.tsx`, `landing.ts`, `page.tsx`, `tailwind.config.ts`)

---

## 3. 컴포넌트 상세 설계

### 3.1 `shared/SectionChip.tsx`

Blue pill chip. Actyon/Torres 섹션의 최상단 헤더 장식 + 라벨.

```tsx
interface SectionChipProps {
  label: string;
  className?: string;
}

export const SectionChip = ({ label, className }: SectionChipProps): JSX.Element => (
  <span
    className={clsx(
      'inline-flex items-center justify-center rounded-full bg-kgm-blue-600 px-3 py-1.5',
      'text-[12px] font-medium leading-none text-white',
      className,
    )}
  >
    {label}
  </span>
);
```

- `clsx`가 없으면 템플릿 리터럴로 대체 (`${className ?? ''}`).
- 폰트: Pretendard Medium 12px (글로벌 기본).
- aria-hidden 아님 — 실제 의미 있는 마케팅 메시지.

### 3.2 `shared/DualCta.tsx`

Outline + Solid 블루 버튼 2개 묶음. Actyon/Torres 하단 공통.

```tsx
interface DualCtaProps {
  outlineLabel: string;
  solidLabel: string;
  onOutlineClick: () => void;
  onSolidClick: () => void;
  className?: string;
}

export const DualCta = ({
  outlineLabel,
  solidLabel,
  onOutlineClick,
  onSolidClick,
  className,
}: DualCtaProps): JSX.Element => (
  <div className={`flex w-full items-stretch gap-2 ${className ?? ''}`}>
    <button
      type="button"
      onClick={onOutlineClick}
      className="flex-1 inline-flex h-12 items-center justify-center rounded-xl border border-kgm-blue-600 bg-transparent text-[14px] font-medium text-kgm-blue-600 transition-opacity hover:opacity-80"
    >
      {outlineLabel}
    </button>
    <button
      type="button"
      onClick={onSolidClick}
      className="flex-1 inline-flex h-12 items-center justify-center rounded-xl bg-kgm-blue-600 text-[14px] font-medium text-white shadow-lg transition-opacity hover:opacity-90"
    >
      {solidLabel}
    </button>
  </div>
);
```

- 높이 48px, 모서리 xl (12px), 폰트 14px.
- Figma 실측: Actyon은 141×48, Torres는 161×48 → `flex-1`로 동일 분할 (합 = 컨테이너 너비).

### 3.3 `actyon/ActyonSpecList.tsx`

✓ 아이콘 + 스펙 4줄 리스트.

```tsx
interface ActyonSpecListProps {
  specs: readonly string[];
}

export const ActyonSpecList = ({ specs }: ActyonSpecListProps): JSX.Element => (
  <ul className="flex flex-col gap-2">
    {specs.map((spec) => (
      <li key={spec} className="flex items-start gap-2 text-[14px] leading-6 text-white/80">
        <span aria-hidden="true" className="mt-0.5 text-kgm-blue-600">✓</span>
        <span>{spec}</span>
      </li>
    ))}
  </ul>
);
```

- ✓ 기호는 유니코드 텍스트(장식 → aria-hidden).
- 각 줄 14px, 텍스트 색상 화이트 80% opacity.

### 3.4 `actyon/ActyonSpecCard.tsx`

차량 이미지 + 모델명 + 가격 + 스펙 + CTA 묶음.

```tsx
interface ActyonSpecCardProps {
  imageSrc: string;
  imageAlt: string;
  modelName: string;
  price: string;
  specs: readonly string[];
  outlineLabel: string;
  solidLabel: string;
  onOutlineClick: () => void;
  onSolidClick: () => void;
}

export const ActyonSpecCard = ({
  imageSrc, imageAlt, modelName, price, specs,
  outlineLabel, solidLabel, onOutlineClick, onSolidClick,
}: ActyonSpecCardProps): JSX.Element => (
  <div className="flex w-full max-w-[335px] mx-auto flex-col gap-4 rounded-2xl bg-white/5 p-5">
    <div className="flex items-center gap-4">
      <Image src={imageSrc} alt={imageAlt} width={64} height={64} className="rounded-lg" />
      <div className="flex flex-col gap-1">
        <p className="text-[14px] text-white/70">{modelName}</p>
        <p className="font-gmarket text-[24px] font-bold leading-none text-white">{price}</p>
      </div>
    </div>
    <div className="h-px w-full bg-white/10" aria-hidden="true" />
    <ActyonSpecList specs={specs} />
    <DualCta
      outlineLabel={outlineLabel}
      solidLabel={solidLabel}
      onOutlineClick={onOutlineClick}
      onSolidClick={onSolidClick}
    />
  </div>
);
```

- `next/image` 사용, 64×64, rounded-lg.
- Divider는 장식 → aria-hidden.
- 카드 배경은 white/5 (어두운 배경 위 살짝 밝은 카드).

### 3.5 `ActyonSection.tsx`

Chip + Title + Card 오케스트레이터. 콘텐츠는 `LANDING_CONTENT.actyon`.

```tsx
'use client';

import { LANDING_CONTENT } from '../../_content/landing';
import { SectionChip } from './shared/SectionChip';
import { ActyonSpecCard } from './actyon/ActyonSpecCard';

export const ActyonSection = (): JSX.Element => {
  const { actyon } = LANDING_CONTENT;

  const handleCalcClick = () => {
    if (typeof window !== 'undefined') window.console.debug('actyon-calc');
  };
  const handleConsultClick = () => {
    if (typeof window !== 'undefined') window.console.debug('actyon-consult');
  };

  return (
    <section
      data-node-id="20:908"
      className="flex w-full flex-col items-center gap-5 bg-kgm-purple-dark px-5 py-10 text-white"
    >
      <SectionChip label={actyon.chip} />
      <h2 className="text-center font-gmarket text-[28px] font-bold leading-[40px] text-white">
        {actyon.titleLines.map((line) => (
          <span key={line} className="block">{line}</span>
        ))}
      </h2>
      <ActyonSpecCard
        imageSrc={actyon.imageSrc}
        imageAlt={actyon.imageAlt}
        modelName={actyon.modelName}
        price={actyon.price}
        specs={actyon.specs}
        outlineLabel={actyon.ctaOutline}
        solidLabel={actyon.ctaSolid}
        onOutlineClick={handleCalcClick}
        onSolidClick={handleConsultClick}
      />
    </section>
  );
};
```

### 3.6 `torres/TorresComparisonTable.tsx`

3열 시맨틱 테이블. `<th scope="col">` 사용.

```tsx
interface TorresComparisonRow {
  label: string;
  tivoli: string;
  torres: string;
}

interface TorresComparisonTableProps {
  headers: readonly [string, string, string];
  rows: readonly TorresComparisonRow[];
}

export const TorresComparisonTable = ({
  headers, rows,
}: TorresComparisonTableProps): JSX.Element => (
  <table className="w-full max-w-[335px] mx-auto border-separate border-spacing-0 text-[13px]">
    <thead>
      <tr>
        <th scope="col" className="h-16 w-[101px] rounded-tl-xl bg-white/5 text-white/70">{headers[0]}</th>
        <th scope="col" className="h-16 w-[117px] bg-white/5 text-white/70">{headers[1]}</th>
        <th scope="col" className="h-16 w-[117px] rounded-tr-xl bg-white/5 text-kgm-blue-600">{headers[2]}</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((row, idx) => (
        <tr key={row.label}>
          <th scope="row" className="h-[42px] text-white/70 font-normal">{row.label}</th>
          <td className="h-[42px] text-center text-white/70">{row.tivoli}</td>
          <td className={`h-[42px] text-center font-medium text-kgm-blue-600 ${idx === rows.length - 1 ? 'rounded-br-xl' : ''}`}>{row.torres}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
```

- 너비 335px (피그마 101+117+117 = 335).
- 헤더 행 높이 64px, 데이터 행 42px.
- 토레스 컬럼 값은 `kgm-blue-600` 하이라이트.

### 3.7 `TorresSection.tsx`

Chip + Title + Table + DualCta 오케스트레이터.

```tsx
'use client';

import { LANDING_CONTENT } from '../../_content/landing';
import { SectionChip } from './shared/SectionChip';
import { TorresComparisonTable } from './torres/TorresComparisonTable';
import { DualCta } from './shared/DualCta';

export const TorresSection = (): JSX.Element => {
  const { torres } = LANDING_CONTENT;

  const handleCalcClick = () => {
    if (typeof window !== 'undefined') window.console.debug('torres-calc');
  };
  const handleConsultClick = () => {
    if (typeof window !== 'undefined') window.console.debug('torres-consult');
  };

  return (
    <section
      data-node-id="23:1089"
      className="flex w-full flex-col items-center gap-5 bg-kgm-purple-dark px-5 py-10 text-white"
    >
      <SectionChip label={torres.chip} />
      <h2 className="text-center font-gmarket text-[28px] font-bold leading-[40px] text-white">
        {torres.titleLines.map((line) => (
          <span key={line} className="block">{line}</span>
        ))}
      </h2>
      <TorresComparisonTable headers={torres.tableHeaders} rows={torres.tableRows} />
      <DualCta
        outlineLabel={torres.ctaOutline}
        solidLabel={torres.ctaSolid}
        onOutlineClick={handleCalcClick}
        onSolidClick={handleConsultClick}
        className="max-w-[335px] mx-auto"
      />
    </section>
  );
};
```

### 3.8 `hero/HeroHeadline.tsx` (수정)

**변경 지점**: CTA 버튼의 `bg-kgm-purple-600` → `bg-kgm-blue-600`.

```diff
  <button
    type="button"
    onClick={onCtaClick}
-   className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-kgm-purple-600 px-6 text-[15px] font-medium text-white shadow-lg transition-opacity hover:opacity-90"
+   className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-kgm-blue-600 px-6 text-[15px] font-medium text-white shadow-lg transition-opacity hover:opacity-90"
  >
    {cta}
  </button>
```

다른 속성은 동일. 기존 `hero-cta` 로그도 유지.

### 3.9 `_content/landing.ts` (수정)

`LANDING_CONTENT` 객체에 `actyon`, `torres` 키 추가.

```ts
export const LANDING_CONTENT = {
  hero: { /* 기존 */ },

  actyon: {
    chip: '하루 6,000원에 프리미엄 하이브리드 SUV',
    titleLines: ['월 180,550원', '고유가 시대의 정답.'] as const,
    imageSrc: '/images/landing/actyon.png',
    imageAlt: '액티언 하이브리드 S8',
    modelName: '액티언 하이브리드 S8',
    price: '월 180,550원',
    specs: [
      '36개월 · 선수금 30% · 1만 km',
      '취등록세 · 자동차세 · 보험료 모두 포함',
      '충전 걱정, 화재 우려 없는 하이브리드',
      'ADAS 편의사양 기본, 쿠페형 SUV 디자인',
    ] as const,
    ctaOutline: '월 납입금 계산하기',
    ctaSolid: '액티언HEV 상담 신청',
  },

  torres: {
    chip: '티볼리 보다 싼 토레스',
    titleLines: ['준중현 SUV를', '소형 SUV 가격으로.'] as const,
    tableHeaders: ['항목', '티볼리 (할부 60개월)', '토레스 (할부 60개월)'] as const,
    tableRows: [
      { label: '월 납입금', tivoli: '42만원', torres: '39만원' },
      { label: '취등록세 (7%)', tivoli: '별도', torres: '포함' },
      { label: '5년 자동차세', tivoli: '별도', torres: '포함' },
      { label: '5년 보험료', tivoli: '별도', torres: '포함' },
      { label: '5년 추가 부담', tivoli: '780만원', torres: '0원' },
    ] as const,
    ctaOutline: '월 납입금 계산하기',
    ctaSolid: '토레스 상담 신청',
  },

  productsHeader: { /* 기존 */ },
  filterTabs: { /* 기존 */ },
  carItem: { /* 기존 */ },
  calculator: { /* 기존 */ },
} as const;
```

### 3.10 `page.tsx` (수정)

기존 `<HeroSection />` 바로 뒤에 `<ActyonSection />`, `<TorresSection />` 삽입. 나머지 섹션 순서는 유지.

### 3.11 `tailwind.config.ts` (수정)

```ts
colors: {
  kgm: {
    'purple-dark': '#100f21',
    'purple-600': '#2e2c4b',
    blue: {
      600: '#0A93FF',  // 신규
    },
  },
},
```

---

## 4. 데이터 흐름 & CTA 이벤트

```
_content/landing.ts
     │
     ▼ (static import, 'use client')
ActyonSection.tsx ────────┐
                          ├──▶ SectionChip (label)
                          ├──▶ ActyonSpecCard ──▶ ActyonSpecList
                          │                    └▶ DualCta (actyon-calc / actyon-consult)
                          
TorresSection.tsx ────────┐
                          ├──▶ SectionChip (label)
                          ├──▶ TorresComparisonTable
                          └──▶ DualCta (torres-calc / torres-consult)

HeroHeadline.tsx ─────────▶ CTA 클릭 → hero-cta (기존)
```

### CTA 이벤트명

| 섹션 | 버튼 | 이벤트명 |
|------|------|---------|
| Hero | "상담 신청하기" | `hero-cta` (기존 유지) |
| Actyon | "월 납입금 계산하기" | `actyon-calc` |
| Actyon | "액티언HEV 상담 신청" | `actyon-consult` |
| Torres | "월 납입금 계산하기" | `torres-calc` |
| Torres | "토레스 상담 신청" | `torres-consult` |

---

## 5. 구현 순서 (권장)

1. **Tailwind 토큰 추가** — `tailwind.config.ts`에 `kgm.blue.600`을 먼저 추가해야 후속 컴포넌트의 `bg-kgm-blue-600` 클래스가 유효.
2. **Figma 에셋 다운로드** — Actyon 차량 이미지를 `get_design_context(20:1021)` → URL → `public/images/landing/actyon.png` 저장.
3. **콘텐츠 상수 확장** — `_content/landing.ts`에 `actyon`, `torres` 키 추가 (타입 에러를 먼저 없앰).
4. **공통 컴포넌트 작성** — `shared/SectionChip.tsx`, `shared/DualCta.tsx`.
5. **Actyon 컴포넌트** — `actyon/ActyonSpecList.tsx` → `actyon/ActyonSpecCard.tsx` → `ActyonSection.tsx`.
6. **Torres 컴포넌트** — `torres/TorresComparisonTable.tsx` → `TorresSection.tsx`.
7. **Hero 버튼 색상 수정** — `hero/HeroHeadline.tsx`의 한 줄 교체.
8. **페이지 마운트** — `app/page.tsx`에 `<ActyonSection />`, `<TorresSection />` 삽입.
9. **Smoke Test** — build → typecheck → lint → dev.

---

## 6. 검증 기준 (Acceptance Criteria)

### 6.1 구조 검증

- [ ] `apps/frontend/b2c/app/_components/landing/` 하위에 7개 신규 TSX 존재
- [ ] 각 컴포넌트 파일은 `.tsx`, PascalCase
- [ ] 모든 컴포넌트가 arrow function + named export + `XxxProps` interface 사용
- [ ] `shared/SectionChip.tsx`, `shared/DualCta.tsx`가 Actyon/Torres 양쪽에서 import됨

### 6.2 기능 검증 (각 컴포넌트별 동작)

| 동작 | 기대 결과 |
|------|-----------|
| Actyon 좌 CTA 클릭 | `window.console.debug('actyon-calc')` 호출 |
| Actyon 우 CTA 클릭 | `window.console.debug('actyon-consult')` 호출 |
| Torres 좌 CTA 클릭 | `window.console.debug('torres-calc')` 호출 |
| Torres 우 CTA 클릭 | `window.console.debug('torres-consult')` 호출 |
| Hero CTA 클릭 | `window.console.debug('hero-cta')` 호출 (기존) |
| Actyon 이미지 | `<img alt="액티언 하이브리드 S8">` (next/image) |
| Torres 테이블 | `<table>` + `<th scope="col">` 3개 + `<th scope="row">` 5개 |
| ✓ 아이콘 | `aria-hidden="true"` 속성 보유 |
| SectionChip | 실제 텍스트 노드로 Screen Reader에 읽힘 (aria-hidden 아님) |
| Divider | `aria-hidden="true"` 보유 |

### 6.3 시각 검증 (Figma 대조)

| 영역 | 기준 | 기대 |
|------|------|------|
| Actyon/Torres 섹션 배경 | 색상 | `#100f21` (kgm-purple-dark) |
| Chip 배경 | 색상 | `#0A93FF` (kgm-blue-600) |
| Chip 폰트 | 패밀리/크기 | Pretendard Medium 12px |
| Title 폰트 | 패밀리/크기 | Gmarket Bold 28px, line-height 40px |
| Actyon Card 배경 | 색상/모서리 | 흰색 5% opacity, rounded-2xl (16px), padding 20px |
| Actyon 이미지 | 크기/모서리 | 64×64, rounded-lg |
| Actyon 가격 | 폰트 | Gmarket Bold 24px |
| Divider | 색/두께 | 흰색 10% opacity, 1px |
| Spec List 텍스트 | 크기/색 | 14px, 화이트 80% opacity |
| Torres 테이블 너비 | 총 너비 | 335px (101+117+117) |
| Torres 헤더 행 | 높이 | 64px |
| Torres 데이터 행 | 높이 | 42px |
| Torres 토레스 컬럼 값 | 색상 | `#0A93FF` (kgm-blue-600) |
| DualCta 버튼 | 높이/모서리 | 48px, rounded-xl (12px) |
| DualCta outline | 스타일 | 투명 배경 + 블루 보더 + 블루 텍스트 |
| DualCta solid | 스타일 | 블루 배경 + 흰색 텍스트 + shadow-lg |
| Hero CTA 버튼 | 배경색 | `bg-kgm-blue-600` (기존 purple-600 대체) |

### 6.4 엣지케이스

| 상황 | 기대 동작 |
|------|----------|
| 모바일 375px | 섹션이 가로 스크롤 없이 렌더. 카드/테이블은 `max-w-[335px] mx-auto`로 중앙 고정 |
| 데스크톱 540px+ | 섹션 배경은 full-width, 내부 컨텐츠는 335px 고정·중앙 정렬 (기존 Hero 패턴 동일) |
| Actyon 이미지 로드 실패 | next/image 기본 alt 표시 (대체 이미지 없음 — MVP 범위 외) |
| `window` 미정의 (SSR) | CTA 핸들러의 `typeof window !== 'undefined'` 가드로 런타임 에러 방지 |
| 기존 페이지 라우트 (`/`, `/products`, `/products/[modelSlug]`) | 영향 없음 |

### 6.5 품질 검증 (자동)

- [ ] `pnpm --filter @kgm-rental/frontend-b2c build` PASS
- [ ] `pnpm --filter @kgm-rental/frontend-b2c typecheck` 0 error
- [ ] `pnpm --filter @kgm-rental/frontend-b2c lint` 0 error / 0 warning
- [ ] `pnpm --filter @kgm-rental/frontend-b2c dev` 기동 후 `/` 200 OK, 신규 섹션 렌더 확인

---

## 7. 리스크 & 완화

| 리스크 | 영향 | 완화 |
|--------|------|------|
| Actyon 이미지 에셋 다운로드 실패 | 카드 렌더 불가 | Do 단계 초반에 `get_design_context(20:1021)` 호출 → URL 추출 → `public/images/landing/actyon.png` 저장. 실패 시 사용자에게 즉시 보고 |
| Chip 색상이 Figma와 미세 불일치 | 시각 편차 | Do 단계에서 `get_design_context(chip node)` 호출로 실측 확인 후 Tailwind 토큰 맞춤 |
| `clsx` 패키지 미설치 | 빌드 실패 | `SectionChip`에서 템플릿 리터럴로 대체 구현 (외부 의존 추가 회피) |
| `next/image` 도메인 설정 누락 | 이미지 안 뜸 | 로컬 `public/` 경로 사용이므로 무관 |
| 테이블 375px에서 좁아짐 | 가독성 | Figma 실측 335px `max-w` + `mx-auto` 적용 (계획과 일치) |
| Hero 버튼 색 변경이 기존 스토리에 영향 | 시각 회귀 | 기존 스냅샷/스토리 없음 확인 완료 (hero-hooking-v2 리포트) — lint만 재검증 |
| page.tsx 섹션 순서 오배치 | 스크롤 스토리 깨짐 | 명시: Hero → Actyon → Torres → Products → Calculator 순 |

---

## 8. 핸드오프 (Do 단계를 위한 체크리스트)

- [ ] Tailwind 토큰부터 추가 (후속 컴포넌트의 클래스가 유효하도록)
- [ ] Figma MCP `get_design_context` 또는 `get_screenshot`으로 Chip/Card/Table 실측값 재확인
- [ ] Actyon 차량 이미지는 Figma 에셋 URL 직접 다운로드 (SVG 폴백·placeholder 금지)
- [ ] 각 파일 상단에 `data-node-id` 속성 유지 (Figma 추적용)
- [ ] CTA 핸들러는 `typeof window !== 'undefined'` 가드 포함
- [ ] SectionChip/DualCta는 `shared/` 폴더에 배치, Actyon/Torres 양쪽에서 import

---

*이 문서는 `/harness:design` 단계의 산출물입니다.*
*다음 단계: `/harness:do`*
