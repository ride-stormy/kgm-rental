import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildAppDataSourceOptions } from './config/typeorm.config.js';
import { RentalQuoteModule } from './modules/rental-quote/rental-quote.module.js';
import { ReferenceDataModule } from './modules/reference-data/reference-data.module.js';
import { ProductModule } from './modules/product/product.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(buildAppDataSourceOptions()),
    ReferenceDataModule,
    ProductModule,
    RentalQuoteModule,
  ],
})
export class AppModule {}
