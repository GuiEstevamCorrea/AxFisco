import { BaseEntity } from './base.entity';
import { CNPJ } from '../value-objects/cnpj.vo';
import { CPF } from '../value-objects/cpf.vo';
import { Address } from '../value-objects/address.vo';

export class Customer extends BaseEntity {
  private _name: string;
  private _email: string;
  private _phone?: string;
  private _document: CNPJ | CPF;
  private _address?: Address;
  private _stateRegistration?: string;
  private _customerType: CustomerType;
  private _isActive: boolean;

  constructor(
    name: string,
    email: string,
    document: CNPJ | CPF,
    customerType: CustomerType,
    phone?: string,
    address?: Address,
    stateRegistration?: string,
    id?: string,
  ) {
    super(id);
    this._name = name;
    this._email = email;
    this._phone = phone;
    this._document = document;
    this._address = address;
    this._stateRegistration = stateRegistration;
    this._customerType = customerType;
    this._isActive = true;
  }

  // Getters
  get name(): string { return this._name; }
  get email(): string { return this._email; }
  get phone(): string | undefined { return this._phone; }
  get document(): CNPJ | CPF { return this._document; }
  get address(): Address | undefined { return this._address; }
  get stateRegistration(): string | undefined { return this._stateRegistration; }
  get customerType(): CustomerType { return this._customerType; }
  get isActive(): boolean { return this._isActive; }

  // Business methods
  updateInfo(name: string, email: string, phone?: string): void {
    this._name = name;
    this._email = email;
    this._phone = phone;
    this.touch();
  }

  updateAddress(address: Address): void {
    this._address = address;
    this.touch();
  }

  updateStateRegistration(stateRegistration: string): void {
    this._stateRegistration = stateRegistration;
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

  isLegalEntity(): boolean {
    return this._document instanceof CNPJ;
  }

  isIndividual(): boolean {
    return this._document instanceof CPF;
  }
}

export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL',
  LEGAL_ENTITY = 'LEGAL_ENTITY',
}
