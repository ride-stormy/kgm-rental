import { z } from 'zod';

export const CustomizingDetailSchema = z.object({
  name: z.string(),
  amount: z.number().int().nonnegative(),
});

export const InventoryItemSchema = z.object({
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

export const InventoryListResponseSchema = z.object({
  items: z.array(InventoryItemSchema),
  totalElements: z.number().int().nonnegative(),
  timestamp: z.string(),
  error: z.string().optional(),
});

export type CustomizingDetail = z.infer<typeof CustomizingDetailSchema>;
export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type InventoryListEnvelope = z.infer<typeof InventoryListEnvelopeSchema>;
export type InventoryListResponse = z.infer<typeof InventoryListResponseSchema>;
