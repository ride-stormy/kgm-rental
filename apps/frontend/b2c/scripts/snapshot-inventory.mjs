import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { InventoryListEnvelopeSchema, SnapshotSchema } from './snapshot-schema.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = resolve(__dirname, '..', 'app', 'products', '_fixtures', 'inventory-snapshot.json');
const API_URL =
  process.env.INVENTORY_API_URL ?? 'https://server.sales.ride-office.kr/public/inventories';
const FETCH_TIMEOUT_MS = 10_000;

const TAG = '[snapshot-inventory]';

const TYPO_FIXES = [
  { pattern: /센서2열/g, replacement: '센서 2열' },
  { pattern: /본풀이\s*파워윈도우/g, replacement: '원터치 파워윈도우' },
  { pattern: /후사경/g, replacement: '룸미러' },
  { pattern: /파워시트-\s*운전석/g, replacement: '파워시트(운전석)' },
  { pattern: /센서카/g, replacement: '센서+카메라' },
];

const ALLOWED_VEHICLE_MODEL_NAMES = new Set(['액티언 하이브리드', '더 뉴 토레스']);

const cleanText = (value) => {
  let out = value;
  for (const { pattern, replacement } of TYPO_FIXES) {
    out = out.replace(pattern, replacement);
  }
  return out;
};

const ensureDir = (filePath) => {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
};

const readExistingSnapshot = () => {
  if (!existsSync(OUTPUT_PATH)) return null;
  try {
    const raw = readFileSync(OUTPUT_PATH, 'utf-8');
    const parsed = SnapshotSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

const writeEmptySnapshot = () => {
  const payload = {
    items: [],
    totalElements: 0,
    timestamp: new Date(0).toISOString(),
    snapshotGeneratedAt: new Date().toISOString(),
  };
  ensureDir(OUTPUT_PATH);
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');
  console.warn(`${TAG} initialized empty snapshot (first build, network unavailable)`);
};

const writeSnapshot = (envelope) => {
  const fetchedCount = envelope.data.content.length;
  const items = envelope.data.content
    .filter((it) => ALLOWED_VEHICLE_MODEL_NAMES.has(it.vehicleModelName))
    .map((it) => ({
      ...it,
      modelName: cleanText(it.modelName),
      colorName: cleanText(it.colorName),
      baseCustomizingDetail: it.baseCustomizingDetail.map((c) => ({
        ...c,
        name: cleanText(c.name),
      })),
      optionCustomizingDetail: it.optionCustomizingDetail.map((c) => ({
        ...c,
        name: cleanText(c.name),
      })),
    }));

  const payload = {
    items,
    totalElements: items.length,
    timestamp: envelope.timestamp,
    snapshotGeneratedAt: new Date().toISOString(),
  };

  ensureDir(OUTPUT_PATH);
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');
  console.log(
    `${TAG} fetched ${fetchedCount} items, kept ${items.length} after whitelist`
  );
};

const fallbackToExisting = (reason) => {
  const existing = readExistingSnapshot();
  if (existing) {
    console.warn(`${TAG} using existing snapshot (reason: ${reason})`);
    return;
  }
  console.warn(`${TAG} no existing snapshot found (reason: ${reason})`);
  writeEmptySnapshot();
};

const run = async () => {
  try {
    const res = await fetch(API_URL, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      fallbackToExisting(`http ${res.status}`);
      return;
    }

    const raw = await res.json();
    const parsed = InventoryListEnvelopeSchema.safeParse(raw);
    if (!parsed.success) {
      fallbackToExisting('schema mismatch');
      return;
    }

    writeSnapshot(parsed.data);
  } catch (error) {
    const reason = error instanceof Error && error.name === 'TimeoutError' ? 'timeout' : 'network error';
    fallbackToExisting(reason);
  }
};

run();
