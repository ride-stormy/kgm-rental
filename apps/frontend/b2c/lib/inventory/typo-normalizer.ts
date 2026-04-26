const TEXT_FIXES: Array<[RegExp, string]> = [
  [/블랙엔지/g, '블랙엣지'],
  [/볼랙엣지/g, '블랙엣지'],
  [/액티온(?=\s+하이브리드)/g, '액티언'],
  [/(하이브리드\s+)58\b/g, '$1S8'],
  [/^무소(?=\s)/g, '무쏘'],
];

export interface NormalizeResult {
  text: string;
  hit: number;
}

export const normalizeTypo = (input: string): NormalizeResult => {
  if (!input) return { text: '', hit: 0 };
  let text = input;
  let hit = 0;
  for (const [re, replacement] of TEXT_FIXES) {
    const matches = text.match(re);
    if (matches) {
      hit += matches.length;
      text = text.replace(re, replacement);
    }
  }
  return { text, hit };
};
