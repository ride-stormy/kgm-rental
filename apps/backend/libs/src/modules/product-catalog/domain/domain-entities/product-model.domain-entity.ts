// ProductModel — catalog card unit. Groups 1-N VehicleSku.
// Pure domain entity: no ORM/framework deps.

import type { VehicleTypeCode } from '@kgm-rental/backend-libs/modules/rental-quote/domain/value-objects/sku-preset.value-object.js';
import { ProductPreset } from '../value-objects/product-preset.value-object.js';
import { Slug } from '../value-objects/slug.value-object.js';

export interface ProductModelCreateProps {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  heroImage: string;
  description: string;
  vehicleTypeDefault: VehicleTypeCode;
  fixedPreset: ProductPreset;
  minMonthlyRent: number;
  promotionTags: string[];
}

export class ProductModel {
  private _id: string;
  private _slug: Slug;
  private _name: string;
  private _brandName: string;
  private _heroImage: string;
  private _description: string;
  private _vehicleTypeDefault: VehicleTypeCode;
  private _fixedPreset: ProductPreset;
  private _minMonthlyRent: number;
  private _promotionTags: string[];

  private constructor(props: {
    id: string;
    slug: Slug;
    name: string;
    brandName: string;
    heroImage: string;
    description: string;
    vehicleTypeDefault: VehicleTypeCode;
    fixedPreset: ProductPreset;
    minMonthlyRent: number;
    promotionTags: string[];
  }) {
    this._id = props.id;
    this._slug = props.slug;
    this._name = props.name;
    this._brandName = props.brandName;
    this._heroImage = props.heroImage;
    this._description = props.description;
    this._vehicleTypeDefault = props.vehicleTypeDefault;
    this._fixedPreset = props.fixedPreset;
    this._minMonthlyRent = props.minMonthlyRent;
    this._promotionTags = [...props.promotionTags];
  }

  static create(input: ProductModelCreateProps): ProductModel {
    if (!input.id) throw new Error('ProductModel.create: id required');
    if (!input.name) throw new Error('ProductModel.create: name required');
    if (!Number.isInteger(input.minMonthlyRent) || input.minMonthlyRent < 0) {
      throw new Error(`ProductModel.create: invalid minMonthlyRent ${input.minMonthlyRent}`);
    }
    return new ProductModel({
      id: input.id,
      slug: Slug.of(input.slug),
      name: input.name,
      brandName: input.brandName,
      heroImage: input.heroImage,
      description: input.description,
      vehicleTypeDefault: input.vehicleTypeDefault,
      fixedPreset: input.fixedPreset,
      minMonthlyRent: input.minMonthlyRent,
      promotionTags: input.promotionTags,
    });
  }

  static restore(input: ProductModelCreateProps): ProductModel {
    return new ProductModel({
      id: input.id,
      slug: Slug.of(input.slug),
      name: input.name,
      brandName: input.brandName,
      heroImage: input.heroImage,
      description: input.description,
      vehicleTypeDefault: input.vehicleTypeDefault,
      fixedPreset: input.fixedPreset,
      minMonthlyRent: input.minMonthlyRent,
      promotionTags: input.promotionTags,
    });
  }

  get id(): string {
    return this._id;
  }
  get slug(): string {
    return this._slug.value;
  }
  get name(): string {
    return this._name;
  }
  get brandName(): string {
    return this._brandName;
  }
  get heroImage(): string {
    return this._heroImage;
  }
  get description(): string {
    return this._description;
  }
  get vehicleTypeDefault(): VehicleTypeCode {
    return this._vehicleTypeDefault;
  }
  get fixedPreset(): ProductPreset {
    return this._fixedPreset;
  }
  get minMonthlyRent(): number {
    return this._minMonthlyRent;
  }
  get promotionTags(): string[] {
    return [...this._promotionTags];
  }

  updateMinMonthlyRent(value: number): void {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error(`ProductModel.updateMinMonthlyRent: invalid ${value}`);
    }
    this._minMonthlyRent = value;
  }
}
