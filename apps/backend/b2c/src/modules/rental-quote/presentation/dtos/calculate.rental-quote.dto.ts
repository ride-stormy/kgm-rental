import { CalculateQuoteRequestSchema } from '@kgm-rental/api-contracts/rental-quote/calculate-quote.schema.js';
import { createZodValidationPipe } from '../../../../pipes/zod-validation.pipe.js';

export const CalculateQuoteBodyPipe = createZodValidationPipe(CalculateQuoteRequestSchema);
