import { z } from 'zod';

export const VehicleTypeSchema = z.enum(['ICE', 'HEV', 'EV', 'Diesel']);
export type VehicleType = z.infer<typeof VehicleTypeSchema>;

// Aligned with libs/rental-quote/value-objects/sku-preset.value-object.ts
export const MaintenancePackageSchema = z.enum(['Basic', 'Standard', 'Select', 'Platinum', 'NONE']);
export type MaintenancePackage = z.infer<typeof MaintenancePackageSchema>;

export const MaturityOptionSchema = z.enum(['만기선택형', '만기인수형']);
export type MaturityOption = z.infer<typeof MaturityOptionSchema>;

export const WinterOptionSchema = z.enum(['chain-yes', 'chain-no', 'tire-yes', 'tire-no']);
export type WinterOption = z.infer<typeof WinterOptionSchema>;

export const RegionSchema = z.enum([
  '서울/경기/인천',
  '충남',
  '충북',
  '경북',
  '경남',
  '전북',
  '전남',
  '강원(영서)',
  '강원(영동)',
  '제주',
  'NONE',
]);
export type Region = z.infer<typeof RegionSchema>;

export const ProductPresetSchema = z.object({
  maintenancePackage: MaintenancePackageSchema,
  maturityOption: MaturityOptionSchema,
  winterOption: WinterOptionSchema,
  region: RegionSchema,
});
export type ProductPreset = z.infer<typeof ProductPresetSchema>;

export const ColorSwatchItemSchema = z.object({
  code: z.string(),
  name: z.string(),
  hex: z.string().nullable(),
});
export type ColorSwatchItem = z.infer<typeof ColorSwatchItemSchema>;
