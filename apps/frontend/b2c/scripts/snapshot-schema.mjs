import { z } from 'zod';

const CustomizingDetailSchema = z.object({
  name: z.string(),
  amount: z.number().int().nonnegative(),
});

const InventoryItemSchema = z.object({
  modelName: z.string(),
  modelCode: z.string(),
  specCode: z.string(),
  colorName: z.string(),
  colorCode: z.string(),
  baseTotalAmount: z.number().int().nonnegative(),
  optionTotalAmount: z.number().int().nonnegative(),
  baseCustomizingDetail: z.array(CustomizingDetailSchema),
  optionCustomizingDetail: z.array(CustomizingDetailSchema),
  vehicleModelName: z.string().nullable().optional(),
  duplicateCount: z.number().int().positive().nullable().optional(),
  makeDates: z.array(z.string()),
});

export const InventoryListEnvelopeSchema = z.object({
  code: z.string(),
  message: z.string(),
  timestamp: z.string(),
  data: z.object({
    totalElements: z.number().int().nonnegative(),
    currentPage: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
    pageSize: z.number().int().positive(),
    content: z.array(InventoryItemSchema),
  }),
});

export const SnapshotSchema = z.object({
  items: z.array(InventoryItemSchema),
  totalElements: z.number().int().nonnegative(),
  timestamp: z.string(),
  snapshotGeneratedAt: z.string(),
});
