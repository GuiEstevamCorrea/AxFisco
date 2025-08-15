import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { Customer } from './customer.entity';

export class NFeDocument extends BaseEntity {
  private _number: number;
  private _series: number;
  private _accessKey: string;
  private _company: Company;
  private _customer: Customer;
  private _items: NFeItem[];
  private _totalValue: number;
  private _totalTaxes: number;
  private _issueDate: Date;
  private _status: NFeStatus;
  private _xmlContent?: string;
  private _protocolNumber?: string;
  private _statusReason?: string;
  private _operation: NFeOperation;

  constructor(
    number: number,
    series: number,
    company: Company,
    customer: Customer,
    operation: NFeOperation,
    id?: string,
  ) {
    super(id);
    this._number = number;
    this._series = series;
    this._company = company;
    this._customer = customer;
    this._operation = operation;
    this._items = [];
    this._totalValue = 0;
    this._totalTaxes = 0;
    this._issueDate = new Date();
    this._status = NFeStatus.DRAFT;
    this._accessKey = this.generateAccessKey();
  }

  // Getters
  get number(): number { return this._number; }
  get series(): number { return this._series; }
  get accessKey(): string { return this._accessKey; }
  get company(): Company { return this._company; }
  get customer(): Customer { return this._customer; }
  get items(): NFeItem[] { return [...this._items]; }
  get totalValue(): number { return this._totalValue; }
  get totalTaxes(): number { return this._totalTaxes; }
  get issueDate(): Date { return this._issueDate; }
  get status(): NFeStatus { return this._status; }
  get xmlContent(): string | undefined { return this._xmlContent; }
  get protocolNumber(): string | undefined { return this._protocolNumber; }
  get statusReason(): string | undefined { return this._statusReason; }
  get operation(): NFeOperation { return this._operation; }

  // Business methods
  addItem(item: NFeItem): void {
    if (this._status !== NFeStatus.DRAFT) {
      throw new Error('Não é possível adicionar itens a uma NFe que não está em rascunho');
    }
    
    this._items.push(item);
    this.recalculateTotals();
    this.touch();
  }

  removeItem(itemIndex: number): void {
    if (this._status !== NFeStatus.DRAFT) {
      throw new Error('Não é possível remover itens de uma NFe que não está em rascunho');
    }
    
    if (itemIndex < 0 || itemIndex >= this._items.length) {
      throw new Error('Índice do item inválido');
    }
    
    this._items.splice(itemIndex, 1);
    this.recalculateTotals();
    this.touch();
  }

  authorize(): void {
    if (this._status !== NFeStatus.DRAFT) {
      throw new Error('Apenas NFe em rascunho podem ser autorizadas');
    }
    
    if (this._items.length === 0) {
      throw new Error('NFe deve ter pelo menos um item');
    }
    
    this._status = NFeStatus.PENDING_AUTHORIZATION;
    this.touch();
  }

  setAuthorized(protocolNumber: string, xmlContent: string): void {
    if (this._status !== NFeStatus.PENDING_AUTHORIZATION) {
      throw new Error('NFe deve estar pendente de autorização');
    }
    
    this._status = NFeStatus.AUTHORIZED;
    this._protocolNumber = protocolNumber;
    this._xmlContent = xmlContent;
    this.touch();
  }

  setRejected(reason: string): void {
    if (this._status !== NFeStatus.PENDING_AUTHORIZATION) {
      throw new Error('NFe deve estar pendente de autorização');
    }
    
    this._status = NFeStatus.REJECTED;
    this._statusReason = reason;
    this.touch();
  }

  cancel(reason: string): void {
    if (this._status !== NFeStatus.AUTHORIZED) {
      throw new Error('Apenas NFe autorizadas podem ser canceladas');
    }
    
    this._status = NFeStatus.CANCELLED;
    this._statusReason = reason;
    this.touch();
  }

  private recalculateTotals(): void {
    this._totalValue = this._items.reduce((sum, item) => sum + item.totalValue, 0);
    this._totalTaxes = this._items.reduce((sum, item) => sum + item.totalTaxes, 0);
  }

  private generateAccessKey(): string {
    // Simplificado - em produção seria mais complexo
    const state = '35'; // SP
    const year = new Date().getFullYear().toString().substr(-2);
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const cnpj = this._company.cnpj.value;
    const model = '55'; // NFe
    const series = String(this._series).padStart(3, '0');
    const number = String(this._number).padStart(9, '0');
    
    return `${state}${year}${month}${cnpj}${model}${series}${number}000000001`;
  }
}

export interface NFeItem {
  productCode: string;
  description: string;
  ncm: string;
  cfop: string;
  unitOfMeasure: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  totalTaxes: number;
  taxes: ItemTaxes;
}

export interface ItemTaxes {
  icms: number;
  ipi: number;
  pis: number;
  cofins: number;
}

export enum NFeStatus {
  DRAFT = 'DRAFT',
  PENDING_AUTHORIZATION = 'PENDING_AUTHORIZATION',
  AUTHORIZED = 'AUTHORIZED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum NFeOperation {
  SALE = 'SALE',
  RETURN = 'RETURN',
  TRANSFER = 'TRANSFER',
}
