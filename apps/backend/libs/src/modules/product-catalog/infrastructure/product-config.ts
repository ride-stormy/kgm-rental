// Catalog-level metadata that is NOT in vehicle-groups.xlsx. Seeder merges
// this with row-derived VehicleSku data to produce the 6 ProductModel cards.
// Slug is the URL key; keys of PRODUCT_CONFIGS match the xlsx `모델명` column
// after whitespace normalization.

import type { ProductPresetProps } from '../domain/value-objects/product-preset.value-object.js';

export interface ProductConfigEntry {
  slug: string;
  brandName: string;
  heroImage: string;
  description: string;
  fixedPreset: ProductPresetProps;
  promotionTags: string[];
  // Optional override — if trim-parser disagrees with catalog intent
  // (e.g., a model has a hybrid variant but the card advertises as ICE).
  vehicleTypeDefault?: 'ICE' | 'HEV' | 'EV' | 'Diesel';
}

const KGM = 'KGM';

export const PRODUCT_CONFIGS: Record<string, ProductConfigEntry> = {
  토레스: {
    slug: '2025-torres',
    brandName: KGM,
    heroImage: '/images/products/torres-hero.jpg',
    description: '정통 SUV의 당당함과 실용성을 겸비한 2025 토레스.',
    fixedPreset: {
      maintenancePackage: 'Select',
      maturityOption: '만기선택형',
      winterOption: 'chain-no',
      region: '서울/경기/인천',
    },
    promotionTags: ['첫 달 0원'],
    vehicleTypeDefault: 'ICE',
  },
  무쏘: {
    slug: 'musso',
    brandName: KGM,
    heroImage: '/images/products/musso-hero.jpg',
    description: '프리미엄 픽업의 기준, 무쏘.',
    fixedPreset: {
      maintenancePackage: 'Select',
      maturityOption: '만기선택형',
      winterOption: 'chain-no',
      region: '서울/경기/인천',
    },
    promotionTags: ['즉시 배송'],
    vehicleTypeDefault: 'Diesel',
  },
  무쏘그랜드: {
    slug: 'musso-grand',
    brandName: KGM,
    heroImage: '/images/products/musso-grand-hero.jpg',
    description: '프리미엄 라지 픽업, 무쏘그랜드.',
    fixedPreset: {
      maintenancePackage: 'Select',
      maturityOption: '만기선택형',
      winterOption: 'chain-no',
      region: '서울/경기/인천',
    },
    promotionTags: [],
    vehicleTypeDefault: 'Diesel',
  },
  무쏘EV: {
    slug: 'musso-ev',
    brandName: KGM,
    heroImage: '/images/products/musso-ev-hero.jpg',
    description: '진화한 전기 픽업, 무쏘 EV.',
    fixedPreset: {
      maintenancePackage: 'Select',
      maturityOption: '만기선택형',
      winterOption: 'chain-no',
      region: '서울/경기/인천',
    },
    promotionTags: ['EV 특판'],
    vehicleTypeDefault: 'EV',
  },
  액티언HEV: {
    slug: 'actyon-hev',
    brandName: KGM,
    heroImage: '/images/products/actyon-hev-hero.jpg',
    description: '하이브리드로 진화한 액티언 HEV.',
    fixedPreset: {
      maintenancePackage: 'Select',
      maturityOption: '만기선택형',
      winterOption: 'chain-no',
      region: '서울/경기/인천',
    },
    promotionTags: ['연비 특화'],
    vehicleTypeDefault: 'HEV',
  },
  티볼리: {
    slug: 'tivoli',
    brandName: KGM,
    heroImage: '/images/products/tivoli-hero.jpg',
    description: '도심형 컴팩트 SUV, 티볼리.',
    fixedPreset: {
      maintenancePackage: 'Select',
      maturityOption: '만기선택형',
      winterOption: 'chain-no',
      region: '서울/경기/인천',
    },
    promotionTags: [],
    vehicleTypeDefault: 'ICE',
  },
};

export function normalizeModelName(raw: string): string {
  // Strip whitespace and leading year tokens like "2025 " / "2026" so that
  // xlsx names ("2025 토레스", "2026 무쏘") collapse to PRODUCT_CONFIGS keys.
  return (raw ?? '')
    .replace(/\s+/g, '')
    .replace(/^20\d{2}/, '')
    .trim();
}

export function lookupProductConfig(modelName: string): ProductConfigEntry | null {
  const key = normalizeModelName(modelName);
  return PRODUCT_CONFIGS[key] ?? null;
}
