import { Module } from '@nestjs/common';
import { ReferenceDataModule } from '../reference-data/reference-data.module.js';
import { ProductModule } from '../product/product.module.js';
import { RentalQuoteController } from './presentation/rental-quote.controller.js';
import { CalculateQuoteService } from './application/services/calculate-quote.service.js';
import { GetResidualValueService } from './application/services/get-residual-value.service.js';
import { ListVehiclesService } from './application/services/list-vehicles.service.js';

@Module({
  imports: [ReferenceDataModule, ProductModule],
  controllers: [RentalQuoteController],
  providers: [CalculateQuoteService, GetResidualValueService, ListVehiclesService],
})
export class RentalQuoteModule {}
