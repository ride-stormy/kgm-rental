// One-time fill script. Loads golden CSV with empty expected_* columns, runs
// the calculator for each case, and writes expected values back. Run with:
//
//   npx tsx scripts/fill-golden-csv.ts
//
// After running, commit the updated CSV — the regression test will lock those
// values in so future code changes must match.

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RentalQuoteCalculatorDomainService } from '../src/modules/rental-quote/domain/domain-services/rental-quote-calculator.domain-service.js';
import { actyonHevSeed } from '../src/modules/reference-data/infrastructure/seeds/actyon-hev-seed.js';
import { InvalidDepositPrepayCombinationException } from '../src/modules/rental-quote/domain/exceptions/rental-quote.exception.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CSV_PATH = path.resolve(
  __dirname,
  '../src/modules/rental-quote/domain/domain-services/test/__fixtures__/golden-quotes.csv',
);

const calculator = new RentalQuoteCalculatorDomainService(actyonHevSeed);

type Row = Record<string, string>;

function parseCsv(text: string): { header: string[]; rows: Row[] } {
  const lines = text.replace(/\r\n/g, '\n').trim().split('\n');
  const header = parseLine(lines[0]!);
  const rows = lines.slice(1).map((l) => {
    const cells = parseLine(l);
    const row: Row = {};
    header.forEach((h, i) => (row[h] = cells[i] ?? ''));
    return row;
  });
  return { header, rows };
}

function parseLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') inQuotes = false;
      else cur += c;
    } else {
      if (c === ',') {
        out.push(cur);
        cur = '';
      } else if (c === '"') inQuotes = true;
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

function escapeCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function serializeCsv(header: string[], rows: Row[]): string {
  const lines = [header.join(',')];
  for (const r of rows) lines.push(header.map((h) => escapeCell(r[h] ?? '')).join(','));
  return lines.join('\n') + '\n';
}

const raw = readFileSync(CSV_PATH, 'utf8');
const { header, rows } = parseCsv(raw);

let filled = 0;
let exceptions = 0;
for (const row of rows) {
  // Respect rows that already have expected_finalMonthlyRent set
  if (row.expected_finalMonthlyRent && row.expected_finalMonthlyRent.trim() !== '') continue;

  try {
    const quote = calculator.calculate({
      skuId: row.skuId!,
      vehicleSlug: row.vehicleSlug!,
      contractPeriodMonths: Number(row.contractPeriod),
      annualMileageKm: Number(row.annualMileage),
      prepaidRatePercent: Number(row.prepaidRate),
      depositRatePercent: Number(row.depositRate),
      preset: {
        maintenancePackage: row.maintenancePackage!,
        maturityOption: '만기선택형',
        winterOption: 'chain-no',
        region: '서울/경기/인천',
      },
    });
    const b = quote.snapshot.breakdown;
    row.expected_standardRent = String(b.standardRent);
    row.expected_prepaidDeduction = String(b.prepaidDeduction);
    row.expected_finalMonthlyRent = String(b.finalMonthlyRent);
    row.expected_residualValue = String(b.residualValue);
    row.expected_prepaidAmount = String(b.prepaidAmount);
    row.expected_depositAmount = String(b.depositAmount);
    row.expected_initialBurden = String(b.initialBurden);
    row.expected_supplyPrice = String(b.supplyPrice);
    row.expected_vat = String(b.vat);
    filled++;
  } catch (e) {
    if (e instanceof InvalidDepositPrepayCombinationException) {
      row.source = `${row.source || 'regression'} (EXCEPTION:${e.reason})`;
      exceptions++;
    } else {
      throw e;
    }
  }
}

writeFileSync(CSV_PATH, serializeCsv(header, rows));
console.log(`[DONE] filled=${filled} exceptions=${exceptions} file=${CSV_PATH}`);
