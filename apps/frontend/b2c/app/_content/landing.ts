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
  actyon: {
    chip: '하루 6,000원에 프리미엄 하이브리드 SUV',
    titleLines: ['월 180,550원', '고유가 시대의 정답.'] as const,
    imageSrc: '/images/landing/actyon.png',
    imageAlt: '액티언 하이브리드 S8',
    modelName: '액티언 하이브리드 S8',
    price: '월 180,550원',
    specs: [
      '36개월 · 선수금 30% · 1만 km',
      '취등록세, 자동차세, 보험료 모두 포함',
      '충전 걱정, 화재 우려 없는 하이브리드',
      'ADAS 편의사양 기본, 쿠페형 SUV 디자인',
    ] as const,
    ctaOutline: '월 납입금 계산하기',
    ctaSolid: '액티언HEV 상담 신청',
  },
  torres: {
    chip: '티볼리 보다 싼 토레스',
    titleLines: ['준중형 SUV를', '소형 SUV 가격으로.'] as const,
    tableHeaders: ['항목', '티볼리 (할부 60개월)', '토레스 (할부 60개월)'] as const,
    tableRows: [
      { label: '월 납입금', tivoli: '월 42만원', torres: '월 39만원' },
      { label: '취등록세 (7%)', tivoli: '별도 부담', torres: '포함' },
      { label: '5년 자동차세', tivoli: '별도 부담', torres: '포함' },
      { label: '5년 보험료', tivoli: '별도 부담', torres: '포함' },
      { label: '5년 추가 부담', tivoli: '780만원', torres: '0원' },
    ] as const,
    ctaOutline: '월 납입금 계산하기',
    ctaSolid: '토레스 상담 신청',
  },
  productsHeader: {
    titleLines: [
      '한정 판매하는 차량을 확인해보세요',
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
