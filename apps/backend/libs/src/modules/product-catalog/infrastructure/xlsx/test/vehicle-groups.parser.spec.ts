import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { parseVehicleGroups } from '../vehicle-groups.parser.js';

const here = dirname(fileURLToPath(import.meta.url));
const xlsxPath = resolve(here, '../../../../../../../../../pre-docs/vehicle-groups-20260420.xlsx');

describe('parseVehicleGroups (vehicle-groups-20260420.xlsx)', () => {
  it('parses 166 rows with no errors', () => {
    const { rows, errors } = parseVehicleGroups({ path: xlsxPath });
    expect(errors).toHaveLength(0);
    expect(rows).toHaveLength(166);
  });

  it('first row matches the expected torres blackedge entry', () => {
    const { rows } = parseVehicleGroups({ path: xlsxPath });
    const row = rows[0]!;
    expect(row.modelName).toBe('2025 토레스');
    expect(row.modelCode).toBe('MW5');
    expect(row.specCode).toBe('ND0J5C');
    expect(row.colorCode).toBe('WAA');
    expect(row.trim).toBe('블랙엣지');
    expect(row.price).toBe(35690000);
    expect(row.stockBucket).toBe(26);
    expect(row.options).toContain('천연 가죽 시트(브라운)');
    expect(row.productionPeriods).toEqual(['25.10', '25.11', '25.12', '26.03']);
  });

  it('splits pipe-delimited options', () => {
    const { rows } = parseVehicleGroups({ path: xlsxPath });
    const row = rows[1]!;
    expect(row.options.length).toBeGreaterThan(1);
  });

  it('covers all 6 expected model families', () => {
    const { rows } = parseVehicleGroups({ path: xlsxPath });
    const unique = new Set(rows.map((r) => r.modelName.replace(/\s+/g, '')));
    const expected = ['2025토레스', '2026무쏘', '무쏘EV', '무쏘그랜드', '2025액티언HEV', '티볼리'];
    expected.forEach((m) => {
      const hit = [...unique].some((x) => x.includes(m.replace(/^\d{4}/, '')));
      expect(hit, `missing family ${m}: found ${[...unique].join(',')}`).toBe(true);
    });
  });
});
