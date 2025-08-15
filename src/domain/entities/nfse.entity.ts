import { BaseEntity } from './base.entity';
import { Company } from './company.entity';
import { Customer } from './customer.entity';

export class NFSeDocument extends BaseEntity {
  private _number?: number;
  private _rpsNumber: number;
  private _rpsSeries: string;
  private _company: Company;
  private _customer: Customer;
  private _services: NFSeService[];
  private _totalValue: number;
  private _totalTaxes: number;
  private _issueDate: Date;
  private _competenceDate: Date;
  private _status: NFSeStatus;
  private _xmlContent?: string;
  private _verificationCode?: string;
  private _statusReason?: string;
  private _cityServiceCode: string;

  constructor(
    rpsNumber: number,
    rpsSeries: string,
    company: Company,
    customer: Customer,
    cityServiceCode: string,
    competenceDate: Date,
    id?: string,
  ) {
    super(id);
    this._rpsNumber = rpsNumber;
    this._rpsSeries = rpsSeries;
    this._company = company;
    this._customer = customer;
    this._cityServiceCode = cityServiceCode;
    this._competenceDate = competenceDate;
    this._services = [];
    this._totalValue = 0;
    this._totalTaxes = 0;
    this._issueDate = new Date();
    this._status = NFSeStatus.DRAFT;
  }

  // Getters
  get number(): number | undefined { return this._number; }
  get rpsNumber(): number { return this._rpsNumber; }
  get rpsSeries(): string { return this._rpsSeries; }
  get company(): Company { return this._company; }
  get customer(): Customer { return this._customer; }
  get services(): NFSeService[] { return [...this._services]; }
  get totalValue(): number { return this._totalValue; }
  get totalTaxes(): number { return this._totalTaxes; }
  get issueDate(): Date { return this._issueDate; }
  get competenceDate(): Date { return this._competenceDate; }
  get status(): NFSeStatus { return this._status; }
  get xmlContent(): string | undefined { return this._xmlContent; }
  get verificationCode(): string | undefined { return this._verificationCode; }
  get statusReason(): string | undefined { return this._statusReason; }
  get cityServiceCode(): string { return this._cityServiceCode; }

  // Business methods
  addService(service: NFSeService): void {
    if (this._status !== NFSeStatus.DRAFT) {
      throw new Error('Não é possível adicionar serviços a uma NFSe que não está em rascunho');
    }
    
    this._services.push(service);
    this.recalculateTotals();
    this.touch();
  }

  removeService(serviceIndex: number): void {
    if (this._status !== NFSeStatus.DRAFT) {
      throw new Error('Não é possível remover serviços de uma NFSe que não está em rascunho');
    }
    
    if (serviceIndex < 0 || serviceIndex >= this._services.length) {
      throw new Error('Índice do serviço inválido');
    }
    
    this._services.splice(serviceIndex, 1);
    this.recalculateTotals();
    this.touch();
  }

  authorize(): void {
    if (this._status !== NFSeStatus.DRAFT) {
      throw new Error('Apenas NFSe em rascunho podem ser autorizadas');
    }
    
    if (this._services.length === 0) {
      throw new Error('NFSe deve ter pelo menos um serviço');
    }
    
    this._status = NFSeStatus.PENDING_AUTHORIZATION;
    this.touch();
  }

  setAuthorized(number: number, verificationCode: string, xmlContent: string): void {
    if (this._status !== NFSeStatus.PENDING_AUTHORIZATION) {
      throw new Error('NFSe deve estar pendente de autorização');
    }
    
    this._status = NFSeStatus.AUTHORIZED;
    this._number = number;
    this._verificationCode = verificationCode;
    this._xmlContent = xmlContent;
    this.touch();
  }

  setRejected(reason: string): void {
    if (this._status !== NFSeStatus.PENDING_AUTHORIZATION) {
      throw new Error('NFSe deve estar pendente de autorização');
    }
    
    this._status = NFSeStatus.REJECTED;
    this._statusReason = reason;
    this.touch();
  }

  cancel(reason: string): void {
    if (this._status !== NFSeStatus.AUTHORIZED) {
      throw new Error('Apenas NFSe autorizadas podem ser canceladas');
    }
    
    this._status = NFSeStatus.CANCELLED;
    this._statusReason = reason;
    this.touch();
  }

  private recalculateTotals(): void {
    this._totalValue = this._services.reduce((sum, service) => sum + service.totalValue, 0);
    this._totalTaxes = this._services.reduce((sum, service) => sum + service.totalTaxes, 0);
  }
}

export interface NFSeService {
  serviceCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  totalTaxes: number;
  taxes: ServiceTaxes;
  retentionTaxes?: RetentionTaxes;
}

export interface ServiceTaxes {
  iss: number;
  pis: number;
  cofins: number;
  csll: number;
  inss: number;
  irrf: number;
}

export interface RetentionTaxes {
  issRetention: number;
  pisRetention: number;
  cofinsRetention: number;
  csllRetention: number;
  inssRetention: number;
  irrfRetention: number;
}

export enum NFSeStatus {
  DRAFT = 'DRAFT',
  PENDING_AUTHORIZATION = 'PENDING_AUTHORIZATION',
  AUTHORIZED = 'AUTHORIZED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}
