import { Inject, Injectable } from '@nestjs/common';
import type { ProductSkuProviderPort } from '../../../rental-quote/application/ports/product-sku-provider.port.js';
import {
  PRODUCT_MODEL_REPOSITORY,
  type ProductModelRepositoryPort,
} from '../../domain/repositories/product-model.repository.js';

// Implements F2's ProductSkuProviderPort backed by the real product catalog.
// Replaces F2's temporary ReferenceVehicleSkuProviderAdapter (see
// docs/archive/2026-04/quote-api/quote-api.report.md §5.3).
@Injectable()
export class ProductSkuProviderAdapter implements ProductSkuProviderPort {
  constructor(
    @Inject(PRODUCT_MODEL_REPOSITORY)
    private readonly repo: ProductModelRepositoryPort,
  ) {}

  async findSku(input: { skuId: string }): Promise<{
    skuId: string;
    vehicleSlug: string;
    price: number;
    vehicleType: string;
    preset: {
      maintenancePackage: string;
      maturityOption: string;
      winterOption: string;
      region: string;
    };
  } | null> {
    const { sku } = await this.repo.findSkuById({ skuId: input.skuId });
    if (!sku) return null;
    // Resolve the owning product model to expose its slug as the vehicleSlug
    // F2's reference-data reader uses to load the ReferenceDataset, and its
    // fixedPreset as the calculator's preset (replacing F2's DEFAULT_PRESET).
    const { product } = await this.findProductForSku(sku.productModelId);
    if (!product) return null;
    return {
      skuId: sku.id,
      vehicleSlug: product.model.slug,
      price: sku.price,
      vehicleType: sku.vehicleType,
      preset: product.model.fixedPreset.toPlain(),
    };
  }

  async listVehicles(input: { take: number; skip: number }): Promise<{
    items: Array<{ slug: string; name: string; price: number; isEv: boolean; isHev: boolean }>;
    total: number;
  }> {
    const { items } = await this.repo.findAll({});
    const flat = items.flatMap((p) =>
      p.skus.map((s) => ({
        slug: s.id, // customer-facing SKU slug == id
        name: `${p.model.name} · ${s.trim} · ${s.colorExteriorName}`,
        price: s.price,
        isEv: s.vehicleType === 'EV',
        isHev: s.vehicleType === 'HEV',
      })),
    );
    const total = flat.length;
    const start = input.skip ?? 0;
    const end = start + (input.take ?? flat.length);
    return { items: flat.slice(start, end), total };
  }

  private async findProductForSku(productModelId: string) {
    const { items } = await this.repo.findAll({});
    const product = items.find((p) => p.model.id === productModelId) ?? null;
    return { product };
  }
}
