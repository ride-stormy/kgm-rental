// Parses trim+modelName strings (from vehicle-groups.xlsx) into vehicle type
// and displacement. Rules are priority-ordered; first match wins.
// On low confidence the caller (seeder) is expected to emit a warning.

import type { VehicleTypeCode } from '@kgm-rental/backend-libs/modules/rental-quote/domain/value-objects/sku-preset.value-object.js';

export interface TrimParseInput {
  trim: string;
  modelName: string;
}

export interface TrimParseResult {
  vehicleType: VehicleTypeCode;
  displacement: number;
  confidence: 'high' | 'low';
  reason: string;
}

// Approximate displacements per model when trim has no cc hint.
// Last-resort fallback; tuned against vehicle-groups.xlsx content.
const MODEL_DISPLACEMENT_FALLBACK: Record<string, number> = {
  토레스: 1497,
  무쏘: 2157,
  무쏘그랜드: 2157,
  무쏘EV: 0,
  액티언: 1497,
  액티언HEV: 1497,
  티볼리: 1497,
};

export class TrimParserDomainService {
  parse(input: TrimParseInput): TrimParseResult {
    const trimRaw = (input.trim || '').trim();
    const modelRaw = (input.modelName || '').trim();
    if (!trimRaw && !modelRaw) {
      throw new Error('TrimParser.parse: both trim and modelName empty');
    }
    const haystack = `${modelRaw} ${trimRaw}`;
    const normalized = haystack.replace(/\s+/g, '');

    // Priority 1: EV
    if (/EV/i.test(normalized) && !/HEV/i.test(normalized)) {
      return this.result('EV', 0, 'high', 'matched EV token');
    }

    // Priority 2: Hybrid
    if (/HEV|하이브리드/i.test(normalized)) {
      const cc = this.extractDisplacement(haystack) ?? this.fallbackDisplacement(modelRaw);
      return this.result('HEV', cc, 'high', 'matched HEV/하이브리드');
    }

    // Priority 3: Diesel (explicit)
    if (/L\s*디젤|디젤/i.test(haystack)) {
      const cc = this.extractDisplacement(haystack) ?? this.fallbackDisplacement(modelRaw);
      return this.result('Diesel', cc, 'high', 'matched 디젤 token');
    }

    // Fallback: ICE with low confidence.
    const cc = this.extractDisplacement(haystack) ?? this.fallbackDisplacement(modelRaw);
    return this.result('ICE', cc, 'low', 'no type token matched; defaulted to ICE');
  }

  private extractDisplacement(text: string): number | null {
    // Accept patterns like "1497", "2.2L" (→ 2200), "1.5T" (→ 1500 with turbo tag).
    const cc = text.match(/(\d{3,4})\s*cc/i);
    if (cc) return Number.parseInt(cc[1]!, 10);

    const litre = text.match(/(\d+(?:\.\d+)?)\s*L(?![a-zA-Z])/);
    if (litre) return Math.round(Number.parseFloat(litre[1]!) * 1000);

    const fourDigit = text.match(/\b(\d{4})\b/);
    if (fourDigit) {
      const n = Number.parseInt(fourDigit[1]!, 10);
      if (n >= 800 && n <= 5000) return n;
    }
    return null;
  }

  private fallbackDisplacement(modelName: string): number {
    const key = modelName.replace(/\s+/g, '');
    for (const [model, cc] of Object.entries(MODEL_DISPLACEMENT_FALLBACK)) {
      if (key.includes(model)) return cc;
    }
    return 0;
  }

  private result(
    vehicleType: VehicleTypeCode,
    displacement: number,
    confidence: 'high' | 'low',
    reason: string,
  ): TrimParseResult {
    return { vehicleType, displacement, confidence, reason };
  }
}
