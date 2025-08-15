export class CertificadoDigital {
  private readonly _arquivo: Buffer;
  private readonly _senha: string;
  private readonly _validade: Date;
  private readonly _proprietario: string;
  private readonly _numeroCertificado: string;

  constructor(
    arquivo: Buffer,
    senha: string,
    validade: Date,
    proprietario: string,
    numeroCertificado: string
  ) {
    this.validarCertificado(arquivo, senha, validade, proprietario, numeroCertificado);
    
    this._arquivo = arquivo;
    this._senha = senha;
    this._validade = validade;
    this._proprietario = proprietario;
    this._numeroCertificado = numeroCertificado;
  }

  private validarCertificado(
    arquivo: Buffer,
    senha: string,
    validade: Date,
    proprietario: string,
    numeroCertificado: string
  ): void {
    if (!arquivo || arquivo.length === 0) {
      throw new Error('Arquivo do certificado é obrigatório');
    }

    if (!senha || senha.trim().length === 0) {
      throw new Error('Senha do certificado é obrigatória');
    }

    if (!validade || validade <= new Date()) {
      throw new Error('Certificado deve ter validade futura');
    }

    if (!proprietario || proprietario.trim().length === 0) {
      throw new Error('Proprietário do certificado é obrigatório');
    }

    if (!numeroCertificado || numeroCertificado.trim().length === 0) {
      throw new Error('Número do certificado é obrigatório');
    }

    // Validação básica do formato do arquivo (deve ser .p12 ou .pfx)
    const tiposPermitidos = ['.p12', '.pfx'];
    const extensao = this.obterExtensaoArquivo(arquivo);
    
    if (!tiposPermitidos.includes(extensao)) {
      throw new Error('Certificado deve ser no formato .p12 ou .pfx');
    }
  }

  private obterExtensaoArquivo(arquivo: Buffer): string {
    // Verificação básica de magic numbers para certificados
    const magicP12 = Buffer.from([0x30, 0x82]); // ASN.1 DER format
    
    if (arquivo.subarray(0, 2).equals(magicP12)) {
      return '.p12';
    }
    
    return '.pfx'; // Assume pfx se não for p12
  }

  get arquivo(): Buffer {
    return this._arquivo;
  }

  get senha(): string {
    return this._senha;
  }

  get validade(): Date {
    return this._validade;
  }

  get proprietario(): string {
    return this._proprietario;
  }

  get numeroCertificado(): string {
    return this._numeroCertificado;
  }

  public estaValido(): boolean {
    return this._validade > new Date();
  }

  public validarProprietario(cnpjEmpresa: string): boolean {
    // Remove formatação do CNPJ para comparação
    const cnpjLimpo = cnpjEmpresa.replace(/\D/g, '');
    return this._proprietario.includes(cnpjLimpo);
  }

  public diasParaVencimento(): number {
    const hoje = new Date();
    const diferenca = this._validade.getTime() - hoje.getTime();
    return Math.ceil(diferenca / (1000 * 3600 * 24));
  }

  public equals(other: CertificadoDigital): boolean {
    return this._numeroCertificado === other._numeroCertificado;
  }
}
