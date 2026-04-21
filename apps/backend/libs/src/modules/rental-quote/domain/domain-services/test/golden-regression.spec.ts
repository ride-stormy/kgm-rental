// Golden CSV regression test.
// Reads all rows from golden-quotes.csv and asserts the calculator still
// produces the same break-down for every case. Any future change to the
// calculator or reference seed that alters a number surfaces here.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { RentalQuoteCalculatorDomainService } from '../rental-quote-calculator.domain-service.js';
import { actyonHevSeed } from '../../../../reference-data/infrastructure/seeds/actyon-hev-seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CSV_PATH = path.join(__dirname, '__fixtures__/golden-quotes.csv');

type Row = Record<string, string>;

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

function parseCsv(text: string): Row[] {
  const lines = text.replace(/\r\n/g, '\n').trim().split('\n');
  const header = parseLine(lines[0]!);
  return lines.slice(1).map((l) => {
    const cells = parseLine(l);
    const row: Row = {};
    header.forEach((h, i) => (row[h] = cells[i] ?? ''));
    return row;
  });
}

const calculator = new RentalQuoteCalculatorDomainService(actyonHevSeed);
const rows = parseCsv(readFileSync(CSV_PATH, 'utf8'));

describe('Golden CSV regression — 25 cases', () => {
  // Filter rows that have expected values (skip header-only edits)
  const filled = rows.filter((r) => r.expected_finalMonthlyRent?.trim());

  it(`CSV contains 25 filled cases`, () => {
    expect(filled.length).toBe(25);
  });

  for (const row of filled) {
    it(`case #${row.case_id} ${row.category} — matches stored expected values`, () => {
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

      expect(b.standardRent, 'standardRent').toBe(Number(row.expected_standardRent));
      expect(b.prepaidDeduction, 'prepaidDeduction').toBe(Number(row.expected_prepaidDeduction));
      expect(b.finalMonthlyRent, 'finalMonthlyRent').toBe(Number(row.expected_finalMonthlyRent));
      expect(b.residualValue, 'residualValue').toBe(Number(row.expected_residualValue));
      expect(b.prepaidAmount, 'prepaidAmount').toBe(Number(row.expected_prepaidAmount));
      expect(b.depositAmount, 'depositAmount').toBe(Number(row.expected_depositAmount));
      expect(b.initialBurden, 'initialBurden').toBe(Number(row.expected_initialBurden));
      expect(b.supplyPrice, 'supplyPrice').toBe(Number(row.expected_supplyPrice));
      expect(b.vat, 'vat').toBe(Number(row.expected_vat));
    });
  }
});
