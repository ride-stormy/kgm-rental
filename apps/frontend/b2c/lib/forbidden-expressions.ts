// 금지 표현 가드 — 렌더 경로에서 문제 소지가 있는 문구를 치환한다.
// 리스트는 마케팅/법무 가이드와 동기화해야 하며 신규 항목은 여기에 추가한다.

const BLACKLIST: RegExp[] = [
  /최저가\s*보장/g,
  /100%\s*환불/g,
  /파격\s*세일/g,
];

export interface SanitizeResult {
  sanitized: string;
  hit: number;
}

export const sanitize = (text: string): SanitizeResult => {
  if (!text) return { sanitized: '', hit: 0 };
  let hit = 0;
  let out = text;
  for (const re of BLACKLIST) {
    const matches = out.match(re);
    if (matches) {
      hit += matches.length;
      out = out.replace(re, '[표기 검토중]');
    }
  }
  return { sanitized: out, hit };
};
