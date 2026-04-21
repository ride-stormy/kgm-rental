import { Controller, Get, Param } from '@nestjs/common';
import type {
  ListProductsResponse,
} from '@kgm-rental/api-contracts/product/product-card.schema.js';
import type {
  ProductDetailResponse,
} from '@kgm-rental/api-contracts/product/product-detail.schema.js';
import type {
  SkuDetailResponse,
} from '@kgm-rental/api-contracts/product/vehicle-sku.schema.js';
import { ListProductsService } from '../application/services/list-products.service.js';
import { GetProductDetailService } from '../application/services/get-product-detail.service.js';
import { GetSkuDetailService } from '../application/services/get-sku-detail.service.js';

@Controller('products')
export class ProductController {
  constructor(
    private readonly listProductsService: ListProductsService,
    private readonly getProductDetailService: GetProductDetailService,
    private readonly getSkuDetailService: GetSkuDetailService,
  ) {}

  @Get()
  async list(): Promise<ListProductsResponse> {
    const { items } = await this.listProductsService.execute({});
    return { success: true, data: { items }, error: null };
  }

  @Get(':modelSlug')
  async detail(@Param('modelSlug') modelSlug: string): Promise<ProductDetailResponse> {
    const { detail } = await this.getProductDetailService.execute({ modelSlug });
    return { success: true, data: detail, error: null };
  }

  @Get(':modelSlug/skus/:skuId')
  async skuDetail(
    @Param('modelSlug') modelSlug: string,
    @Param('skuId') skuId: string,
  ): Promise<SkuDetailResponse> {
    const { sku } = await this.getSkuDetailService.execute({ modelSlug, skuId });
    return { success: true, data: sku, error: null };
  }
}
