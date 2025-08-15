import { BaseEntity } from './base.entity';

export class Product extends BaseEntity {
  private _name: string;
  private _description: string;
  private _code: string;
  private _ncm: string;
  private _cfop: string;
  private _unitOfMeasure: string;
  private _unitPrice: number;
  private _productType: ProductType;
  private _taxInfo: ProductTaxInfo;
  private _isActive: boolean;

  constructor(
    name: string,
    description: string,
    code: string,
    ncm: string,
    cfop: string,
    unitOfMeasure: string,
    unitPrice: number,
    productType: ProductType,
    taxInfo: ProductTaxInfo,
    id?: string,
  ) {
    super(id);
    this._name = name;
    this._description = description;
    this._code = code;
    this._ncm = ncm;
    this._cfop = cfop;
    this._unitOfMeasure = unitOfMeasure;
    this._unitPrice = unitPrice;
    this._productType = productType;
    this._taxInfo = taxInfo;
    this._isActive = true;
  }

  // Getters
  get name(): string { return this._name; }
  get description(): string { return this._description; }
  get code(): string { return this._code; }
  get ncm(): string { return this._ncm; }
  get cfop(): string { return this._cfop; }
  get unitOfMeasure(): string { return this._unitOfMeasure; }
  get unitPrice(): number { return this._unitPrice; }
  get productType(): ProductType { return this._productType; }
  get taxInfo(): ProductTaxInfo { return this._taxInfo; }
  get isActive(): boolean { return this._isActive; }

  // Business methods
  updateInfo(name: string, description: string, unitPrice: number): void {
    this._name = name;
    this._description = description;
    this._unitPrice = unitPrice;
    this.touch();
  }

  updateTaxInfo(taxInfo: ProductTaxInfo): void {
    this._taxInfo = taxInfo;
    this.touch();
  }

  updatePrice(unitPrice: number): void {
    if (unitPrice <= 0) {
      throw new Error('Preço deve ser maior que zero');
    }
    this._unitPrice = unitPrice;
    this.touch();
  }

  activate(): void {
    this._isActive = true;
    this.touch();
  }

  deactivate(): void {
    this._isActive = false;
    this.touch();
  }

  calculateTotalPrice(quantity: number): number {
    return this._unitPrice * quantity;
  }
}

export enum ProductType {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
}

export interface ProductTaxInfo {
  icmsRate: number;
  ipiRate: number;
  pisRate: number;
  cofinsRate: number;
  issRate?: number; // Para serviços
  cstIcms: string;
  cstIpi: string;
  cstPis: string;
  cstCofins: string;
}
