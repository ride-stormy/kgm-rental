// VehicleSku — one row of vehicle-groups.xlsx. Identity key:
// `${specCode}-${colorExteriorCode}`. Belongs to exactly one ProductModel.

import type { VehicleTypeCode } from '@kgm-rental/backend-libs/modules/rental-quote/domain/value-objects/sku-preset.value-object.js';

export interface VehicleSkuCreateProps {
  id: string;
  productModelId: string;
  specCode: string;
  modelCode: string;
  trim: string;
  vehicleType: VehicleTypeCode;
  displacement: number;
  colorExteriorCode: string;
  colorExteriorName: string;
  colorInteriorCode: string | null;
  options: string[];
  price: number;
  stockBucket: number;
  productionPeriods: string[];
}

export class VehicleSku {
  private _id: string;
  private _productModelId: string;
  private _specCode: string;
  private _modelCode: string;
  private _trim: string;
  private _vehicleType: VehicleTypeCode;
  private _displacement: number;
  private _colorExteriorCode: string;
  private _colorExteriorName: string;
  private _colorInteriorCode: string | null;
  private _options: string[];
  private _price: number;
  private _stockBucket: number;
  private _productionPeriods: string[];

  private constructor(props: VehicleSkuCreateProps) {
    this._id = props.id;
    this._productModelId = props.productModelId;
    this._specCode = props.specCode;
    this._modelCode = props.modelCode;
    this._trim = props.trim;
    this._vehicleType = props.vehicleType;
    this._displacement = props.displacement;
    this._colorExteriorCode = props.colorExteriorCode;
    this._colorExteriorName = props.colorExteriorName;
    this._colorInteriorCode = props.colorInteriorCode;
    this._options = [...props.options];
    this._price = props.price;
    this._stockBucket = props.stockBucket;
    this._productionPeriods = [...props.productionPeriods];
  }

  static create(input: VehicleSkuCreateProps): VehicleSku {
    if (!input.specCode) throw new Error('VehicleSku.create: specCode required');
    if (!input.colorExteriorCode) {
      throw new Error('VehicleSku.create: colorExteriorCode required');
    }
    if (!Number.isInteger(input.price) || input.price < 0) {
      throw new Error(`VehicleSku.create: invalid price ${input.price}`);
    }
    if (!Number.isInteger(input.stockBucket) || input.stockBucket < 0) {
      throw new Error(`VehicleSku.create: invalid stockBucket ${input.stockBucket}`);
    }
    if (!Number.isInteger(input.displacement) || input.displacement < 0) {
      throw new Error(`VehicleSku.create: invalid displacement ${input.displacement}`);
    }
    // id must start with `${specCode}-${colorExteriorCode}` prefix. Callers
    // may append a row-number tiebreaker when the source data duplicates
    // the spec+color pair with different trims.
    const prefix = `${input.specCode}-${input.colorExteriorCode}`;
    if (!input.id.startsWith(prefix)) {
      throw new Error(
        `VehicleSku.create: id "${input.id}" must start with "${prefix}" (specCode-colorExteriorCode)`,
      );
    }
    return new VehicleSku(input);
  }

  static restore(input: VehicleSkuCreateProps): VehicleSku {
    return new VehicleSku(input);
  }

  static deriveId(input: {
    specCode: string;
    colorExteriorCode: string;
    rowNumber?: number;
  }): string {
    const base = `${input.specCode}-${input.colorExteriorCode}`;
    return input.rowNumber === undefined ? base : `${base}-r${input.rowNumber}`;
  }

  get id(): string {
    return this._id;
  }
  get productModelId(): string {
    return this._productModelId;
  }
  get specCode(): string {
    return this._specCode;
  }
  get modelCode(): string {
    return this._modelCode;
  }
  get trim(): string {
    return this._trim;
  }
  get vehicleType(): VehicleTypeCode {
    return this._vehicleType;
  }
  get displacement(): number {
    return this._displacement;
  }
  get colorExteriorCode(): string {
    return this._colorExteriorCode;
  }
  get colorExteriorName(): string {
    return this._colorExteriorName;
  }
  get colorInteriorCode(): string | null {
    return this._colorInteriorCode;
  }
  get options(): string[] {
    return [...this._options];
  }
  get price(): number {
    return this._price;
  }
  get stockBucket(): number {
    return this._stockBucket;
  }
  get productionPeriods(): string[] {
    return [...this._productionPeriods];
  }

  overrideStock(value: number): void {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error(`VehicleSku.overrideStock: invalid ${value}`);
    }
    this._stockBucket = value;
  }
}
