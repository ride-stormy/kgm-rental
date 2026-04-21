import { ResidualValueQuerySchema } from '@kgm-rental/api-contracts/rental-quote/residual-value.schema.js';
import { createZodValidationPipe } from '../../../../pipes/zod-validation.pipe.js';

export const ResidualValueQueryPipe = createZodValidationPipe(ResidualValueQuerySchema);
