import { BaseEntity } from './base.entity';
import { CNPJ } from '../value-objects/cnpj.vo';
import { CPF } from '../value-objects/cpf.vo';
import { Address } from '../value-objects/address.vo';

export class Company extends BaseEntity {
  private _corporateName: string;
  private _tradeName: string;
  private _cnpj: CNPJ;
  private _stateRegistration: string;
  private _municipalRegistration?: string;
  private _address: Address;
  private _email: string;
  private _phone: string;
  private _taxRegime: TaxRegime;
  private _isActive: boolean;

  constructor(
    corporateName: string,
    tradeName: string,
    cnpj: CNPJ,
    stateRegistration: string,
    address: Address,
    email: string,
    phone: string,
    taxRegime: TaxRegime,
    municipalRegistration?: string,
    id?: string,
  ) {
    super(id);
    this._corporateName = corporateName;
    this._tradeName = tradeName;
    this._cnpj = cnpj;
    this._stateRegistration = stateRegistration;
    this._municipalRegistration = municipalRegistration;
    this._address = address;
    this._email = email;
    this._phone = phone;
    this._taxRegime = taxRegime;
    this._isActive = true;
  }

  // Getters
  get corporateName(): string { return this._corporateName; }
  get tradeName(): string { return this._tradeName; }
  get cnpj(): CNPJ { return this._cnpj; }
  get stateRegistration(): string { return this._stateRegistration; }
  get municipalRegistration(): string | undefined { return this._municipalRegistration; }
  get address(): Address { return this._address; }
  get email(): string { return this._email; }
  get phone(): string { return this._phone; }
  get taxRegime(): TaxRegime { return this._taxRegime; }
  get isActive(): boolean { return this._isActive; }

  // Business methods
  updateCompanyInfo(corporateName: string, tradeName: string, email: string, phone: string): void {
    this._corporateName = corporateName;
    this._tradeName = tradeName;
    this._email = email;
    this._phone = phone;
    this.touch();
  }

  updateAddress(address: Address): void {
    this._address = address;
    this.touch();
  }

  changeTaxRegime(taxRegime: TaxRegime): void {
    this._taxRegime = taxRegime;
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
}

export enum TaxRegime {
  SIMPLES_NACIONAL = 'SIMPLES_NACIONAL',
  LUCRO_PRESUMIDO = 'LUCRO_PRESUMIDO',
  LUCRO_REAL = 'LUCRO_REAL',
  MEI = 'MEI',
}
