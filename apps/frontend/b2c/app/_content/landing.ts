export const MODEL_ORDER = [
  'actyon-hev',
  '2025-torres',
  'musso',
  'musso-grand',
  'musso-ev',
  'tivoli',
] as const;

export type ModelSlug = (typeof MODEL_ORDER)[number];

export interface ModelDisplay {
  name: string;
  badge: string;
  thumbnail: string;
}

export const MODEL_DISPLAY: Record<ModelSlug, ModelDisplay> = {
  'actyon-hev': {
    name: '액티언 HEV',
    badge: '실용과 스타일',
    thumbnail: '/images/landing/actyon.png',
  },
  '2025-torres': {
    name: '토레스',
    badge: '베스트셀러 SUV',
    thumbnail: '/images/landing/torres.png',
  },
  musso: {
    name: '무쏘',
    badge: '정통 픽업',
    thumbnail: '/images/landing/musso.png',
  },
  'musso-grand': {
    name: '무쏘그랜드',
    badge: '프리미엄 픽업',
    thumbnail: '/images/landing/mussogrand.png',
  },
  'musso-ev': {
    name: '무쏘 EV',
    badge: '전기 픽업',
    thumbnail: '/images/landing/mussoev.png',
  },
  tivoli: {
    name: '티볼리',
    badge: '엔트리 SUV',
    thumbnail: '/images/landing/tivoli.png',
  },
};

export const LANDING_CONTENT = {
  hero: {
    bgImage: '/images/landing/heroimg.png',
    eyebrow: '400대 한정 이벤트',
    titleLines: [
      '티볼리 가격으로 토레스,',
      '하루 커피 한 잔 값으로',
      '액티언 하이브리드를',
    ],
    cta: '상담 신청하기',
  },
  productsHeader: {
    titleLines: [
      '티볼리보다 싼 토레스,',
      '월 18만 원대 액티언 하이브리드',
    ],
    subtitle: '한정 수량으로 소진 시 즉시 마감될 수 있습니다',
    totalCount: 400,
    asOfLabel: '2026. 04. 15 기준',
    totalLabelPrefix: '총 ',
    totalLabelSuffix: '대',
  },
  filterTabs: {
    allLabel: '전체',
  },
  carItem: {
    priceSuffix: '부터',
    conditionParts: ['계약기간 5년', '선납:10%', '주행거리:2만 km 기준'] as const,
    cta: '견적내보기',
  },
  calculator: {
    title: '예상 월 납입금',
    monthlyUnit: '원/월',
    subtitle: '차종과 조건을 선택하면 대략적인 월 납입금을 즉시 확인할 수 있습니다',
    modelLabel: '모델',
    trimLabel: '트림',
    contractLabel: '계약 기간',
    annualKmLabel: '연간 주행거리',
    prepaidLabel: '선수금 비율',
    subsidyLabel: '보조금 비율',
    vehiclePriceLabel: '차량 가격',
    cta: '이 조건으로 상담 신청',
    contractUnit: '개월',
    annualKmUnit: 'km',
    percentMax: 50,
  },
} as const;
