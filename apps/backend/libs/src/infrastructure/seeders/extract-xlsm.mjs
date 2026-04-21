#!/usr/bin/env node
// xlsm reference data extractor.
// Unzips the Meritz quote xlsm, parses cached cell values, and writes raw 2D sheet
// dumps + curated reference JSON to apps/backend/libs/src/infrastructure/seeders/data/.

import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '../../../../../..');
const XLSM_PATH = path.join(
  PROJECT_ROOT,
  'pre-docs',
  '메리츠캐피탈 렌터카 견적시트_2604.v3_배포용.xlsm',
);
const OUT_DIR = path.join(__dirname, 'data');

if (!existsSync(XLSM_PATH)) {
  console.error(`[FATAL] xlsm not found: ${XLSM_PATH}`);
  process.exit(1);
}
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// --- 1. Unzip xlsm to a temp dir ---
const work = mkdtempSync(path.join(tmpdir(), 'xlsm-extract-'));
try {
  execSync(`unzip -q -o "${XLSM_PATH}" -d "${work}"`);

  // --- 2. Load shared strings ---
  const sharedStringsPath = path.join(work, 'xl/sharedStrings.xml');
  const sharedStrings = parseSharedStrings(
    existsSync(sharedStringsPath) ? readFileSync(sharedStringsPath, 'utf8') : null,
  );

  // --- 3. Map sheet rels -> sheet files ---
  const workbookXml = readFileSync(path.join(work, 'xl/workbook.xml'), 'utf8');
  const relsXml = readFileSync(path.join(work, 'xl/_rels/workbook.xml.rels'), 'utf8');
  const sheetMap = mapSheets(workbookXml, relsXml);

  // --- 4. Dump interesting sheets as 2D arrays ---
  // 1 견적조건, 2 차량정보, 3 탁송, 4 정비, 렌트_입력시트, 렌트_출력시트
  const targets = [
    '1 견적조건',
    '2 차량정보',
    '3 탁송',
    '4 정비',
    '렌트_입력시트',
    '렌트_출력시트',
  ];

  const rawDumps = {};
  for (const name of targets) {
    const file = sheetMap[name];
    if (!file) {
      console.warn(`[WARN] sheet not found in workbook: ${name}`);
      continue;
    }
    const xml = readFileSync(path.join(work, 'xl', file), 'utf8');
    const grid = parseSheet(xml, sharedStrings);
    rawDumps[name] = grid;
    const safe = safeName(name);
    writeFileSync(
      path.join(OUT_DIR, `raw-${safe}.json`),
      JSON.stringify({ sheetName: name, sourceFile: file, grid }, null, 2),
    );
    const rowCount = grid.length;
    const maxCol = grid.reduce((m, r) => Math.max(m, r.length), 0);
    console.log(`[OK] raw dump '${name}' -> raw-${safe}.json  (${rowCount} rows × ${maxCol} cols)`);
  }

  // --- 5. Probe target cells for the golden-csv seed case ---
  const inp = rawDumps['렌트_입력시트'];
  const out = rawDumps['렌트_출력시트'];
  const probe = {
    note: '현재 xlsm에 마지막으로 저장된 계산 상태. golden CSV seed 1건의 expected_* 값.',
    inputSheetCells: inp
      ? {
          BR23: readCell(inp, 'BR', 23),
          BR26: readCell(inp, 'BR', 26),
          BR27: readCell(inp, 'BR', 27),
          BR28: readCell(inp, 'BR', 28),
          BR32: readCell(inp, 'BR', 32),
          CC8: readCell(inp, 'CC', 8),
          CC9: readCell(inp, 'CC', 9),
          CC21: readCell(inp, 'CC', 21),
          EG7: readCell(inp, 'EG', 7),
          EG8: readCell(inp, 'EG', 8),
          EG9: readCell(inp, 'EG', 9),
          EG10: readCell(inp, 'EG', 10),
          EG11: readCell(inp, 'EG', 11),
          EG12: readCell(inp, 'EG', 12),
          EG13: readCell(inp, 'EG', 13),
          X8: readCell(inp, 'X', 8),
          H21: readCell(inp, 'H', 21),
        }
      : null,
    outputSheetCells: out
      ? {
          Y30: readCell(out, 'Y', 30),
          Y33: readCell(out, 'Y', 33),
        }
      : null,
  };
  writeFileSync(path.join(OUT_DIR, 'probe-golden-seed.json'), JSON.stringify(probe, null, 2));
  console.log('[OK] probe-golden-seed.json written');

  // --- 6. Generate EXTRACTION_NOTES.md ---
  const notes = buildNotes(sheetMap, probe, rawDumps);
  writeFileSync(path.join(OUT_DIR, 'EXTRACTION_NOTES.md'), notes);
  console.log('[OK] EXTRACTION_NOTES.md written');

  console.log('\n[DONE] Output directory:', OUT_DIR);
} finally {
  rmSync(work, { recursive: true, force: true });
}

// ---------- helpers ----------

function parseSharedStrings(xml) {
  if (!xml) return [];
  const out = [];
  const siRe = /<si>([\s\S]*?)<\/si>/g;
  let m;
  while ((m = siRe.exec(xml)) !== null) {
    const inner = m[1];
    const texts = [];
    const tRe = /<t[^>]*>([\s\S]*?)<\/t>/g;
    let tm;
    while ((tm = tRe.exec(inner)) !== null) texts.push(decodeXml(tm[1]));
    out.push(texts.join(''));
  }
  return out;
}

function mapSheets(workbookXml, relsXml) {
  const rels = {};
  const relRe = /<Relationship\s+([^>]*?)\/>/g;
  let m;
  while ((m = relRe.exec(relsXml)) !== null) {
    const attrs = parseAttrs(m[1]);
    if (
      attrs.Type ===
      'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet'
    ) {
      rels[attrs.Id] = attrs.Target;
    }
  }
  const sheets = {};
  const sheetRe = /<sheet\s+([^>]*?)\/>/g;
  while ((m = sheetRe.exec(workbookXml)) !== null) {
    const attrs = parseAttrs(m[1]);
    const rid = attrs['r:id'] || attrs['rId'];
    if (attrs.name && rid && rels[rid]) sheets[attrs.name] = rels[rid];
  }
  return sheets;
}

function parseAttrs(s) {
  const out = {};
  const re = /([\w:]+)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(s)) !== null) out[m[1]] = m[2];
  return out;
}

function decodeXml(s) {
  return s
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

// Parse a sheet XML into a 2D array of raw cached values.
// Each cell: either a string (from shared strings / inline / formatted number-as-string) or a number, or null.
function parseSheet(xml, sharedStrings) {
  const grid = [];
  const rowRe = /<row\s+([^>]*?)>([\s\S]*?)<\/row>/g;
  let rm;
  while ((rm = rowRe.exec(xml)) !== null) {
    const rowAttrs = parseAttrs(rm[1]);
    const rIdx = parseInt(rowAttrs.r, 10) - 1;
    const body = rm[2];
    const row = [];
    const cellRe = /<c\s+([^/>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
    let cm;
    while ((cm = cellRe.exec(body)) !== null) {
      const cAttrs = parseAttrs(cm[1]);
      const inner = cm[2] || '';
      const ref = cAttrs.r;
      const type = cAttrs.t || 'n';
      const { col } = splitRef(ref);
      let val;
      if (type === 's') {
        const vm = /<v>([\s\S]*?)<\/v>/.exec(inner);
        val = vm ? sharedStrings[parseInt(vm[1], 10)] : null;
      } else if (type === 'inlineStr') {
        const texts = [];
        const tRe = /<t[^>]*>([\s\S]*?)<\/t>/g;
        let tm;
        while ((tm = tRe.exec(inner)) !== null) texts.push(decodeXml(tm[1]));
        val = texts.join('');
      } else if (type === 'b') {
        const vm = /<v>([\s\S]*?)<\/v>/.exec(inner);
        val = vm ? vm[1] === '1' : null;
      } else if (type === 'str' || type === 'e') {
        const vm = /<v>([\s\S]*?)<\/v>/.exec(inner);
        val = vm ? decodeXml(vm[1]) : null;
      } else {
        // number
        const vm = /<v>([\s\S]*?)<\/v>/.exec(inner);
        val = vm ? Number(vm[1]) : null;
        if (vm && Number.isNaN(val)) val = vm[1];
      }
      row[col] = val;
    }
    grid[rIdx] = row;
  }
  // normalize: every row is at least an array (may have holes)
  for (let i = 0; i < grid.length; i++) if (!grid[i]) grid[i] = [];
  return grid;
}

function splitRef(ref) {
  const m = /^([A-Z]+)(\d+)$/.exec(ref);
  if (!m) return { col: 0, row: 0 };
  let col = 0;
  for (const ch of m[1]) col = col * 26 + (ch.charCodeAt(0) - 64);
  return { col: col - 1, row: parseInt(m[2], 10) - 1 };
}

function colToIndex(letters) {
  let col = 0;
  for (const ch of letters) col = col * 26 + (ch.charCodeAt(0) - 64);
  return col - 1;
}

function readCell(grid, colLetters, rowNum1Based) {
  const row = grid[rowNum1Based - 1];
  if (!row) return null;
  const c = colToIndex(colLetters);
  return row[c] === undefined ? null : row[c];
}

function safeName(name) {
  return name.replace(/\s+/g, '-');
}

function buildNotes(sheetMap, probe, rawDumps) {
  const lines = [];
  lines.push('# xlsm 참조 데이터 추출 노트');
  lines.push('');
  lines.push(
    '본 파일은 `extract-xlsm.mjs` 실행 결과의 요약이다. 추출이 성공한 항목, 사용자의 확인이 필요한 항목, Stage 2에서 해결할 항목을 정리한다.',
  );
  lines.push('');
  lines.push('## 시트 매핑');
  lines.push('');
  lines.push('| 시트명 | xlsm 내부 파일 |');
  lines.push('|--------|----------------|');
  for (const [n, f] of Object.entries(sheetMap)) lines.push(`| ${n} | ${f} |`);
  lines.push('');
  lines.push('## Golden CSV seed (현재 xlsm 캐시 상태 1건)');
  lines.push('');
  lines.push(
    '아래는 xlsm이 마지막 저장된 시점의 입력 조건으로 계산된 캐시 값이다. case_id=1로 golden CSV에 초기값 주입됨. (나머지 20건의 expected_* 는 사용자가 xlsm을 열어 조건별로 채워야 함)',
  );
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(probe, null, 2));
  lines.push('```');
  lines.push('');
  lines.push('## 사용자 확인 요청 항목 (Stage 2 진입 전)');
  lines.push('');
  lines.push(
    '1. **현재 xlsm에 저장된 입력 조건을 알려주세요** — 위 probe 값은 "어떤 차량·계약기간·주행거리·선납률·보증률" 상태의 결과인지 모릅니다. 사용자가 Excel에서 xlsm을 열어 입력란 값을 알려주시면 case_id=1 row를 완성합니다.',
  );
  lines.push('');
  lines.push(
    '2. **raw-*.json 덤프 샘플링** — 각 시트의 2D 덤프를 열어 다음 범위가 올바른지 확인 필요:',
  );
  lines.push('   - `raw-1-견적조건.json`: D127·N19·N29·N33·N37·N39 (정비 구성 요소), D85(멤버쉽), N41(잔가율 룩업 수식)');
  lines.push('   - `raw-2-차량정보.json`: H열(차량가), O~AP열(잔가율 매트릭스)');
  lines.push('   - `raw-3-탁송.json`: 지역별 1차·2차 탁송료 표 범위');
  lines.push('   - `raw-4-정비.json`: 패키지×차종×기간×주행거리 매트릭스 범위');
  lines.push('');
  lines.push(
    '3. **BR32 이율 매트릭스** — `렌트_입력시트!BR32`는 캐시된 단일 값일 가능성이 높음. 차종×계약기간 매트릭스를 어디서 조회하는지 xlsm 수식을 수동 확인 필요.',
  );
  lines.push('');
  lines.push(
    '4. **EG30 보험료 매트릭스** — 동일하게 `렌트_입력시트!EG30`은 캐시된 단일 보험료이고, 연령×주행거리×차종 매트릭스는 별도 시트에 존재할 가능성. Stage 2에서 확인.',
  );
  lines.push('');
  lines.push('## 다음 단계');
  lines.push('');
  lines.push(
    '사용자가 probe seed의 입력 조건과 raw 덤프 범위를 확인하고 나면, Stage 2에서 raw 덤프를 7개 정형 reference JSON(`vehicle.json`, `interest-rate.json`, `residual-rate.json`, `delivery-rate.json`, `maintenance-package-rate.json`, `insurance-rate.json`, `promotion.json`)으로 파생한다.',
  );
  return lines.join('\n') + '\n';
}
