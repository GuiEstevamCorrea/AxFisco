import { BaseEntity } from './base.entity';
import { CNPJ } from '../value-objects/cnpj.vo';
import { CPF } from '../value-objects/cpf.vo';
import { Address } from '../value-objects/address.vo';

export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL',
  LEGAL_ENTITY = 'LEGAL_ENTITY',
}

export enum IndicadorIE {
  CONTRIBUINTE = 1,
  ISENTO = 2,
  NAO_CONTRIBUINTE = 9
}

export class Customer extends BaseEntity {
  private _name: string;
  private _email: string;
  private _phone?: string;
  private _document: CNPJ | CPF;
  private _address?: Address;
  private _stateRegistration?: string;
  private _municipalRegistration?: string;
  private _customerType: CustomerType;
  private _isActive: boolean;
  private _indicadorIE: IndicadorIE;
  private _suframa?: string;
  private _observacoes?: string;

  constructor(
    name: string,
    email: string,
    document: CNPJ | CPF,
    customerType: CustomerType,
    indicadorIE: IndicadorIE = IndicadorIE.NAO_CONTRIBUINTE,
    phone?: string,
    address?: Address,
    stateRegistration?: string,
    municipalRegistration?: string,
    suframa?: string,
    observacoes?: string,
    id?: string,
  ) {
    super(id);
    this.validarParametros(name, email, customerType, indicadorIE, stateRegistration);
    
    this._name = name;
    this._email = email;
    this._phone = phone;
    this._document = document;
    this._address = address;
    this._stateRegistration = stateRegistration;
    this._municipalRegistration = municipalRegistration;
    this._customerType = customerType;
    this._isActive = true;
    this._indicadorIE = indicadorIE;
    this._suframa = suframa;
    this._observacoes = observacoes;
  }

  // Getters
  get name(): string { return this._name; }
  get email(): string { return this._email; }
  get phone(): string | undefined { return this._phone; }
  get document(): CNPJ | CPF { return this._document; }
  get address(): Address | undefined { return this._address; }
  get stateRegistration(): string | undefined { return this._stateRegistration; }
  get municipalRegistration(): string | undefined { return this._municipalRegistration; }
  get customerType(): CustomerType { return this._customerType; }
  get isActive(): boolean { return this._isActive; }
  get indicadorIE(): IndicadorIE { return this._indicadorIE; }
  get suframa(): string | undefined { return this._suframa; }
  get observacoes(): string | undefined { return this._observacoes; }

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

  private validarParametros(
    name: string,
    email: string,
    customerType: CustomerType,
    indicadorIE: IndicadorIE,
    stateRegistration?: string
  ): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }

    if (!email || !this.validarEmail(email)) {
      throw new Error('Email inválido');
    }

    if (customerType === CustomerType.LEGAL_ENTITY && indicadorIE === IndicadorIE.CONTRIBUINTE) {
      if (!stateRegistration || stateRegistration.trim().length === 0) {
        throw new Error('Inscrição estadual é obrigatória para pessoa jurídica contribuinte');
      }
    }
  }

  // Métodos específicos para emissão fiscal
  public ehContribuinteICMS(): boolean {
    return this._indicadorIE === IndicadorIE.CONTRIBUINTE;
  }

  public ehIsentoIE(): boolean {
    return this._indicadorIE === IndicadorIE.ISENTO;
  }

  public ehNaoContribuinte(): boolean {
    return this._indicadorIE === IndicadorIE.NAO_CONTRIBUINTE;
  }

  public definirIndicadorIE(indicador: IndicadorIE): void {
    if (indicador === IndicadorIE.CONTRIBUINTE && !this._stateRegistration) {
      throw new Error('Inscrição estadual é obrigatória para contribuinte');
    }

    this._indicadorIE = indicador;
    this.touch();
  }

  public atualizarInscricaoEstadual(inscricao: string): void {
    this._stateRegistration = inscricao;
    
    // Se tem IE, deve ser contribuinte
    if (inscricao && inscricao.trim().length > 0 && this._indicadorIE === IndicadorIE.NAO_CONTRIBUINTE) {
      this._indicadorIE = IndicadorIE.CONTRIBUINTE;
    }
    
    this.touch();
  }

  public atualizarInscricaoMunicipal(inscricao: string): void {
    this._municipalRegistration = inscricao;
    this.touch();
  }

  public definirSuframa(suframa: string): void {
    if (suframa && !this.validarSuframa(suframa)) {
      throw new Error('Inscrição SUFRAMA inválida');
    }

    this._suframa = suframa;
    this.touch();
  }

  public atualizarObservacoes(observacoes: string): void {
    this._observacoes = observacoes;
    this.touch();
  }

  public podeSerDestinarioNFe(): boolean {
    return this._isActive && this._address !== undefined;
  }

  public necessitaIE(): boolean {
    return this._customerType === CustomerType.LEGAL_ENTITY && 
           this._indicadorIE === IndicadorIE.CONTRIBUINTE;
  }

  public obterDocumentoFormatado(): string {
    return this._document instanceof CNPJ 
      ? this._document.formatted 
      : this._document.formatted;
  }

  public obterTipoDocumento(): 'CNPJ' | 'CPF' {
    return this._document instanceof CNPJ ? 'CNPJ' : 'CPF';
  }

  public toNFeFormat(): object {
    const isLegalEntity = this.isLegalEntity();
    
    return {
      [isLegalEntity ? 'CNPJ' : 'CPF']: this._document.value.replace(/\D/g, ''),
      xNome: this._name,
      enderDest: this._address?.toNFeFormat(),
      indIEDest: this._indicadorIE,
      IE: this._stateRegistration || '',
      IM: this._municipalRegistration || '',
      ISUF: this._suframa || '',
      email: this._email
    };
  }

  private validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validarSuframa(suframa: string): boolean {
    const suframaLimpo = suframa.replace(/\D/g, '');
    return suframaLimpo.length >= 8 && suframaLimpo.length <= 9;
  }
}
