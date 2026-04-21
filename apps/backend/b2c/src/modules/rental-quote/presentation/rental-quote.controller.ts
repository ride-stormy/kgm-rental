import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import type {
  CalculateQuoteRequest,
  CalculateQuoteResponse,
} from '@kgm-rental/api-contracts/rental-quote/calculate-quote.schema.js';
import type {
  ResidualValueQuery,
  ResidualValueResponse,
} from '@kgm-rental/api-contracts/rental-quote/residual-value.schema.js';
import type {
  ListVehiclesQuery,
  ListVehiclesResponse,
} from '@kgm-rental/api-contracts/rental-quote/list-vehicles.schema.js';
import { CalculateQuoteBodyPipe } from './dtos/calculate.rental-quote.dto.js';
import { ResidualValueQueryPipe } from './dtos/residual-value.rental-quote.dto.js';
import { ListVehiclesQueryPipe } from './dtos/list-vehicles.rental-quote.dto.js';
import { CalculateQuoteService } from '../application/services/calculate-quote.service.js';
import { GetResidualValueService } from '../application/services/get-residual-value.service.js';
import { ListVehiclesService } from '../application/services/list-vehicles.service.js';

@Controller()
export class RentalQuoteController {
  constructor(
    private readonly calculateQuoteService: CalculateQuoteService,
    private readonly getResidualValueService: GetResidualValueService,
    private readonly listVehiclesService: ListVehiclesService,
  ) {}

  @Post('quotes/calculate')
  @HttpCode(200)
  async calculate(
    @Body(CalculateQuoteBodyPipe) body: CalculateQuoteRequest,
  ): Promise<CalculateQuoteResponse> {
    const { breakdown } = await this.calculateQuoteService.execute(body);
    return { success: true, data: breakdown, error: null };
  }

  @Get('quotes/residual-value')
  async residualValue(
    @Query(ResidualValueQueryPipe) query: ResidualValueQuery,
  ): Promise<ResidualValueResponse> {
    const { residualValue } = await this.getResidualValueService.execute(query);
    return { success: true, data: { residualValue }, error: null };
  }

  @Get('vehicles')
  async listVehicles(
    @Query(ListVehiclesQueryPipe) query: ListVehiclesQuery,
  ): Promise<ListVehiclesResponse> {
    const result = await this.listVehiclesService.execute(query);
    return { success: true, data: result, error: null };
  }
}
