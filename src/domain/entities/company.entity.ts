import { BaseEntity } from './base.entity';
import { CNPJ } from '../value-objects/cnpj.vo';
import { CPF } from '../value-objects/cpf.vo';
import { Address } from '../value-objects/address.vo';
import { CertificadoDigital } from '../value-objects/certificado-digital.vo';

export enum TaxRegime {
  SIMPLES_NACIONAL = 'SIMPLES_NACIONAL',
  LUCRO_PRESUMIDO = 'LUCRO_PRESUMIDO',
  LUCRO_REAL = 'LUCRO_REAL',
  MEI = 'MEI',
}

export enum TipoAmbiente {
  PRODUCAO = 1,
  HOMOLOGACAO = 2
}

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
  private _certificadoDigital?: CertificadoDigital;
  private _ambienteNFe: TipoAmbiente;
  private _serieNFe: number;
  private _numeroUltimaNFe: number;
  private _serieNFSe: number;
  private _numeroUltimaNFSe: number;
  private _codigoMunicipio?: string;
  private _inscricaoSuframa?: string;
  private _regimeTributarioEspecial?: string;

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
    codigoMunicipio?: string,
    inscricaoSuframa?: string,
    regimeTributarioEspecial?: string,
    id?: string,
  ) {
    super(id);
    this.validarParametros(corporateName, tradeName, email, phone, stateRegistration);
    
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
    this._ambienteNFe = TipoAmbiente.HOMOLOGACAO; // Inicia em homologação
    this._serieNFe = 1;
    this._numeroUltimaNFe = 0;
    this._serieNFSe = 1;
    this._numeroUltimaNFSe = 0;
    this._codigoMunicipio = codigoMunicipio;
    this._inscricaoSuframa = inscricaoSuframa;
    this._regimeTributarioEspecial = regimeTributarioEspecial;
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
  get certificadoDigital(): CertificadoDigital | undefined { return this._certificadoDigital; }
  get ambienteNFe(): TipoAmbiente { return this._ambienteNFe; }
  get serieNFe(): number { return this._serieNFe; }
  get numeroUltimaNFe(): number { return this._numeroUltimaNFe; }
  get serieNFSe(): number { return this._serieNFSe; }
  get numeroUltimaNFSe(): number { return this._numeroUltimaNFSe; }
  get codigoMunicipio(): string | undefined { return this._codigoMunicipio; }
  get inscricaoSuframa(): string | undefined { return this._inscricaoSuframa; }
  get regimeTributarioEspecial(): string | undefined { return this._regimeTributarioEspecial; }

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

  private validarParametros(
    corporateName: string,
    tradeName: string,
    email: string,
    phone: string,
    stateRegistration: string
  ): void {
    if (!corporateName || corporateName.trim().length === 0) {
      throw new Error('Razão social é obrigatória');
    }

    if (!tradeName || tradeName.trim().length === 0) {
      throw new Error('Nome fantasia é obrigatório');
    }

    if (!email || !this.validarEmail(email)) {
      throw new Error('Email inválido');
    }

    if (!phone || phone.trim().length === 0) {
      throw new Error('Telefone é obrigatório');
    }

    if (!stateRegistration || stateRegistration.trim().length === 0) {
      throw new Error('Inscrição estadual é obrigatória');
    }
  }

  // Métodos específicos para emissão fiscal
  public definirCertificadoDigital(certificado: CertificadoDigital): void {
    if (!certificado.estaValido()) {
      throw new Error('Certificado digital vencido');
    }

    if (!certificado.validarProprietario(this._cnpj.value)) {
      throw new Error('Certificado digital não pertence a esta empresa');
    }

    this._certificadoDigital = certificado;
    this.touch();
  }

  public alternarAmbienteNFe(): void {
    this._ambienteNFe = this._ambienteNFe === TipoAmbiente.PRODUCAO 
      ? TipoAmbiente.HOMOLOGACAO 
      : TipoAmbiente.PRODUCAO;
    this.touch();
  }

  public ativarProducao(): void {
    if (!this._certificadoDigital) {
      throw new Error('Certificado digital é obrigatório para ambiente de produção');
    }

    if (!this._certificadoDigital.estaValido()) {
      throw new Error('Certificado digital vencido');
    }

    this._ambienteNFe = TipoAmbiente.PRODUCAO;
    this.touch();
  }

  public obterProximoNumeroNFe(): number {
    this._numeroUltimaNFe++;
    this.touch();
    return this._numeroUltimaNFe;
  }

  public obterProximoNumeroNFSe(): number {
    this._numeroUltimaNFSe++;
    this.touch();
    return this._numeroUltimaNFSe;
  }

  public definirSerieNFe(serie: number): void {
    if (serie <= 0 || serie > 999) {
      throw new Error('Série da NF-e deve estar entre 1 e 999');
    }

    this._serieNFe = serie;
    this.touch();
  }

  public definirSerieNFSe(serie: number): void {
    if (serie <= 0 || serie > 999) {
      throw new Error('Série da NFS-e deve estar entre 1 e 999');
    }

    this._serieNFSe = serie;
    this.touch();
  }

  public atualizarNumeroUltimaNFe(numero: number): void {
    if (numero < this._numeroUltimaNFe) {
      throw new Error('Número da última NF-e não pode ser menor que o atual');
    }

    this._numeroUltimaNFe = numero;
    this.touch();
  }

  public atualizarNumeroUltimaNFSe(numero: number): void {
    if (numero < this._numeroUltimaNFSe) {
      throw new Error('Número da última NFS-e não pode ser menor que o atual');
    }

    this._numeroUltimaNFSe = numero;
    this.touch();
  }

  public podeEmitirNFe(): boolean {
    return this._isActive && 
           (this._ambienteNFe === TipoAmbiente.HOMOLOGACAO || 
            (this._certificadoDigital && this._certificadoDigital.estaValido()));
  }

  public podeEmitirNFSe(): boolean {
    return this._isActive && 
           this._municipalRegistration !== undefined &&
           this._municipalRegistration.trim().length > 0;
  }

  public diasParaVencimentoCertificado(): number | undefined {
    return this._certificadoDigital?.diasParaVencimento();
  }

  public certificadoPrecisaRenovar(): boolean {
    const dias = this.diasParaVencimentoCertificado();
    return dias !== undefined && dias <= 30;
  }

  private validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
