// Exterior color code → display name + optional hex.
// Source: pre-docs/vehicle-groups-20260420.xlsx (unique color codes observed
// across 166 rows). Hex is best-effort and may be null until design provides.
// Seeder warns on missing codes; add entries here when a new code appears.

export interface ColorEntry {
  name: string;
  hex: string | null;
}

export const COLOR_CODE_MAP: Record<string, ColorEntry> = {
  // White / light
  WAA: { name: '그랜드 화이트', hex: '#F5F5F5' },
  WAP: { name: '펄 화이트', hex: '#FAFAFA' },
  WAK: { name: '아이보리 화이트', hex: '#EFE9D9' },

  // Silver / grey
  AAC: { name: '플래티넘 실버', hex: '#BFC1C2' },
  AAD: { name: '스페이스 블랙', hex: '#1B1B1B' },
  GAA: { name: '그레이 스톤', hex: '#6E7074' },
  GAB: { name: '녹턴 그레이 메탈릭', hex: '#43464B' },
  GAR: { name: '아틀라스 그레이', hex: '#9A9CA0' },

  // Black
  BAA: { name: '스페이스 블랙', hex: '#0F0F11' },
  BAB: { name: '미드나잇 블랙 펄', hex: '#050505' },

  // Blue
  UAD: { name: '인디고 블루', hex: '#1F3A6B' },
  UAF: { name: '디프 블루 펄', hex: '#13325E' },
  UAG: { name: '시그널 블루', hex: '#2F4F8E' },

  // Red / orange / brown
  RAB: { name: '체리 레드', hex: '#9B1B2D' },
  RAE: { name: '어반 레드', hex: '#B12B2F' },
  YAA: { name: '시에나 옐로우', hex: '#E4B63A' },
  EAA: { name: '캐롯 오렌지', hex: '#D9762E' },
  KAA: { name: '마호가니 브라운', hex: '#4A2D22' },

  // Green
  LAA: { name: '포레스트 그린', hex: '#2C4030' },

  // Two-tone (suffix 2T as convention)
  WAA2T: { name: '화이트 투톤', hex: null },
  GAB2T: { name: '녹턴 그레이 투톤', hex: null },
};

export function lookupColor(code: string): ColorEntry | null {
  const hit = COLOR_CODE_MAP[code];
  return hit ?? null;
}
