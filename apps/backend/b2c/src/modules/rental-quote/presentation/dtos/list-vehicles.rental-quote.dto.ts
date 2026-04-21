import { ListVehiclesQuerySchema } from '@kgm-rental/api-contracts/rental-quote/list-vehicles.schema.js';
import { createZodValidationPipe } from '../../../../pipes/zod-validation.pipe.js';

export const ListVehiclesQueryPipe = createZodValidationPipe(ListVehiclesQuerySchema);
