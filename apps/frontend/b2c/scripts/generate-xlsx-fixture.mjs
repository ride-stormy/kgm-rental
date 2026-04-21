// One-shot: read pre-docs/vehicle-groups-20260420.xlsx and produce
// apps/frontend/b2c/app/products/xlsx/_fixtures/vehicles.json
// Only used for the local preview route /products/xlsx — not for production data.
//
// Run: node apps/frontend/b2c/scripts/generate-xlsx-fixture.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const XLSX_PATH = path.join(REPO_ROOT, 'pre-docs/vehicle-groups-20260420.xlsx');
const FIXTURE_PATH = path.join(
  __dirname,
  '..',
  'app/products/xlsx/_fixtures/vehicles.json',
);

const DIST = path.join(
  REPO_ROOT,
  'apps/backend/libs/dist/modules/product-catalog/infrastructure',
);

const MIN_MONTHLY_RENT_FACTOR = 0.018; // matches backend seeder

const parserMod = await import(`${DIST}/xlsx/vehicle-groups.parser.js`);
const cfgMod = await import(`${DIST}/product-config.js`);
const colorMod = await import(`${DIST}/color-codes.map.js`);

const parseResult = parserMod.parseVehicleGroups({ path: XLSX_PATH });
if (parseResult.errors.length > 0) {
  console.warn(
    `[xlsx-fixture] parser reported ${parseResult.errors.length} row errors (skipping)`,
  );
}

const displacementByVehicleType = (vt) => {
  if (vt === 'EV') return 0;
  if (vt === 'HEV') return 1497;
  return 1998;
};

const byModel = new Map();
for (const row of parseResult.rows) {
  const cfg = cfgMod.lookupProductConfig(row.modelName);
  if (!cfg) continue;
  const color = colorMod.lookupColor(row.colorCode);
  const vehicleType = cfg.vehicleTypeDefault ?? 'ICE';
  const productModelId = `pm_${cfg.slug}`;
  const skuId = `${row.specCode}-${row.colorCode}`;

  if (!byModel.has(cfg.slug)) {
    byModel.set(cfg.slug, {
      config: cfg,
      modelName: row.modelName,
      rows: [],
    });
  }

  byModel.get(cfg.slug).rows.push({
    sku: {
      id: skuId,
      productModelId,
      specCode: row.specCode,
      modelCode: row.modelCode,
      trim: row.trim,
      vehicleType,
      displacement: displacementByVehicleType(vehicleType),
      colorExteriorCode: row.colorCode,
      colorExteriorName: color ? color.name : row.colorCode,
      colorInteriorCode: null,
      options: row.options,
      price: row.price,
      stockBucket: row.stockBucket,
      productionPeriods: row.productionPeriods,
    },
    color: color ? { code: row.colorCode, name: color.name, hex: color.hex } : null,
  });
}

const products = [];
for (const [slug, bucket] of byModel) {
  const skus = bucket.rows.map((r) => r.sku);
  const colorMap = new Map();
  for (const r of bucket.rows) {
    if (r.color && !colorMap.has(r.color.code)) colorMap.set(r.color.code, r.color);
  }
  const colorSwatch = [...colorMap.values()];
  const minSkuPrice = skus.reduce((m, s) => Math.min(m, s.price), Number.MAX_SAFE_INTEGER);
  const minMonthlyRent = Math.round(minSkuPrice * MIN_MONTHLY_RENT_FACTOR);

  products.push({
    id: `pm_${slug}`,
    slug,
    name: bucket.modelName,
    brandName: bucket.config.brandName,
    heroImage: bucket.config.heroImage,
    vehicleTypeDefault: bucket.config.vehicleTypeDefault ?? 'ICE',
    minMonthlyRent,
    colorSwatch,
    promotionTags: bucket.config.promotionTags,
    description: bucket.config.description,
    fixedPreset: bucket.config.fixedPreset,
    skus,
  });
}

fs.mkdirSync(path.dirname(FIXTURE_PATH), { recursive: true });
fs.writeFileSync(FIXTURE_PATH, JSON.stringify({ products }, null, 2));

console.log(
  `[xlsx-fixture] wrote ${products.length} models / ${products.reduce((n, p) => n + p.skus.length, 0)} SKUs → ${path.relative(REPO_ROOT, FIXTURE_PATH)}`,
);
