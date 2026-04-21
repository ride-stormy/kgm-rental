// Parses pre-docs/vehicle-groups-20260420.xlsx into a flat array of raw rows
// that the seeder will map to domain entities. Fail-fast on structural errors;
// row-level issues are collected and returned alongside successes.

import { z } from 'zod';
import XLSX from 'xlsx';

const EXPECTED_HEADER = [
  '번호',
  '모델명',
  '모델코드',
  '스펙코드',
  '색상코드',
  '트림',
  '옵션',
  '가격(원)',
  '생산시기',
  '재고수',
  '위치',
] as const;

const RawRowSchema = z.object({
  rowNumber: z.number().int().positive(),
  modelName: z.string().min(1),
  modelCode: z.string().min(1),
  specCode: z.string().min(1),
  colorCode: z.string().min(1),
  trim: z.string().min(1),
  options: z.array(z.string()),
  price: z.number().int().positive(),
  productionPeriods: z.array(z.string()),
  stockBucket: z.number().int().nonnegative(),
  location: z.string(),
});
export type VehicleGroupRow = z.infer<typeof RawRowSchema>;

export interface RowError {
  rowNumber: number | null;
  message: string;
  raw: unknown;
}

export interface ParseResult {
  rows: VehicleGroupRow[];
  errors: RowError[];
}

const splitPipe = (value: string): string[] =>
  value
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

const parseIntStrict = (value: string): number => {
  const n = Number.parseInt(value.replace(/[,\s]/g, ''), 10);
  if (!Number.isFinite(n)) throw new Error(`not a number: "${value}"`);
  return n;
};

export function parseVehicleGroups(input: { buffer: Buffer } | { path: string }): ParseResult {
  const wb =
    'buffer' in input ? XLSX.read(input.buffer, { type: 'buffer' }) : XLSX.readFile(input.path);
  if (wb.SheetNames.length === 0) {
    throw new Error('vehicle-groups.xlsx: no sheets');
  }
  const sheetName = wb.SheetNames[0]!;
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error(`sheet "${sheetName}" missing`);

  const matrix = XLSX.utils.sheet_to_json<string[]>(ws, {
    header: 1,
    raw: false,
    defval: '',
  });
  if (matrix.length === 0) throw new Error('vehicle-groups.xlsx: empty');

  const header = matrix[0];
  if (!header) throw new Error('vehicle-groups.xlsx: header row missing');
  EXPECTED_HEADER.forEach((expected, idx) => {
    const actual = (header[idx] ?? '').toString().trim();
    if (actual !== expected) {
      throw new Error(
        `vehicle-groups.xlsx: header mismatch at col ${idx}. expected "${expected}", got "${actual}"`,
      );
    }
  });

  const rows: VehicleGroupRow[] = [];
  const errors: RowError[] = [];

  for (let i = 1; i < matrix.length; i += 1) {
    const raw = matrix[i];
    if (!raw || raw.every((cell) => (cell ?? '').toString().trim() === '')) continue;
    try {
      const [numStr, modelName, modelCode, specCode, colorCode, trim, options, priceStr,
        productionPeriods, stockStr, location] = raw.map((c) => (c ?? '').toString().trim());

      const parsed = RawRowSchema.parse({
        rowNumber: parseIntStrict(numStr ?? ''),
        modelName,
        modelCode,
        specCode,
        colorCode,
        trim,
        options: splitPipe(options ?? ''),
        price: parseIntStrict(priceStr ?? ''),
        productionPeriods: splitPipe(productionPeriods ?? ''),
        stockBucket: parseIntStrict(stockStr ?? ''),
        location: location ?? '',
      });
      rows.push(parsed);
    } catch (e) {
      const rowNumber = (() => {
        const v = raw[0];
        const n = v ? Number.parseInt(v.toString(), 10) : NaN;
        return Number.isFinite(n) ? n : null;
      })();
      errors.push({
        rowNumber,
        message: e instanceof Error ? e.message : String(e),
        raw,
      });
    }
  }

  return { rows, errors };
}
