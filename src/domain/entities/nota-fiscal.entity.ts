import { v4 as uuid } from 'uuid';
import { BaseEntity } from './base.entity';

export enum TipoNotaFiscal {
  NFE = 'NFE',
  NFSE = 'NFSE'
}

export enum StatusNotaFiscal {
  RASCUNHO = 'RASCUNHO',
  AGUARDANDO_ENVIO = 'AGUARDANDO_ENVIO',
  ENVIADA = 'ENVIADA',
  AUTORIZADA = 'AUTORIZADA',
  REJEITADA = 'REJEITADA',
  CANCELADA = 'CANCELADA',
  INUTILIZADA = 'INUTILIZADA'
}

export enum FinalidadeNF {
  NORMAL = 1,
  COMPLEMENTAR = 2,
  AJUSTE = 3,
  DEVOLUCAO = 4
}

export class NotaFiscal extends BaseEntity {
  private _numero: number;
  private _serie: number;
  private _tipo: TipoNotaFiscal;
  private _status: StatusNotaFiscal;
  private _finalidade: FinalidadeNF;
  private _chaveAcesso?: string;
  private _protocoloAutorizacao?: string;
  private _dataEmissao: Date;
  private _dataVencimento?: Date;
  private _empresaId: string;
  private _clienteId: string;
  private _valorTotal: number;
  private _valorTributos: number;
  private _observacoes?: string;
  private _informacoesAdicionais?: string;
  private _xmlOriginal?: string;
  private _xmlAssinado?: string;
  private _motivoRejeicao?: string;
  private _itens: string[] = []; // IDs dos itens

  constructor(
    numero: number,
    serie: number,
    tipo: TipoNotaFiscal,
    empresaId: string,
    clienteId: string,
    valorTotal: number,
    valorTributos: number,
    finalidade: FinalidadeNF = FinalidadeNF.NORMAL,
    observacoes?: string,
    informacoesAdicionais?: string
  ) {
    super();
    this.validarParametros(numero, serie, empresaId, clienteId, valorTotal, valorTributos);
    
    this._numero = numero;
    this._serie = serie;
    this._tipo = tipo;
    this._empresaId = empresaId;
    this._clienteId = clienteId;
    this._valorTotal = valorTotal;
    this._valorTributos = valorTributos;
    this._finalidade = finalidade;
    this._observacoes = observacoes;
    this._informacoesAdicionais = informacoesAdicionais;
    this._status = StatusNotaFiscal.RASCUNHO;
    this._dataEmissao = new Date();
  }

  private validarParametros(
    numero: number,
    serie: number,
    empresaId: string,
    clienteId: string,
    valorTotal: number,
    valorTributos: number
  ): void {
    if (!numero || numero <= 0) {
      throw new Error('Número da nota fiscal deve ser maior que zero');
    }

    if (!serie || serie <= 0) {
      throw new Error('Série da nota fiscal deve ser maior que zero');
    }

    if (!empresaId || empresaId.trim().length === 0) {
      throw new Error('ID da empresa é obrigatório');
    }

    if (!clienteId || clienteId.trim().length === 0) {
      throw new Error('ID do cliente é obrigatório');
    }

    if (valorTotal < 0) {
      throw new Error('Valor total não pode ser negativo');
    }

    if (valorTributos < 0) {
      throw new Error('Valor dos tributos não pode ser negativo');
    }

    if (valorTributos > valorTotal) {
      throw new Error('Valor dos tributos não pode ser maior que o valor total');
    }
  }

  // Getters
  get numero(): number { return this._numero; }
  get serie(): number { return this._serie; }
  get tipo(): TipoNotaFiscal { return this._tipo; }
  get status(): StatusNotaFiscal { return this._status; }
  get finalidade(): FinalidadeNF { return this._finalidade; }
  get chaveAcesso(): string | undefined { return this._chaveAcesso; }
  get protocoloAutorizacao(): string | undefined { return this._protocoloAutorizacao; }
  get dataEmissao(): Date { return this._dataEmissao; }
  get dataVencimento(): Date | undefined { return this._dataVencimento; }
  get empresaId(): string { return this._empresaId; }
  get clienteId(): string { return this._clienteId; }
  get valorTotal(): number { return this._valorTotal; }
  get valorTributos(): number { return this._valorTributos; }
  get observacoes(): string | undefined { return this._observacoes; }
  get informacoesAdicionais(): string | undefined { return this._informacoesAdicionais; }
  get xmlOriginal(): string | undefined { return this._xmlOriginal; }
  get xmlAssinado(): string | undefined { return this._xmlAssinado; }
  get motivoRejeicao(): string | undefined { return this._motivoRejeicao; }
  get itens(): readonly string[] { return this._itens; }

  // Métodos de negócio
  public gerarChaveAcesso(uf: string, cnpjEmpresa: string): string {
    if (this._status !== StatusNotaFiscal.RASCUNHO) {
      throw new Error('Chave de acesso só pode ser gerada para notas em rascunho');
    }

    const codigoUF = this.obterCodigoUF(uf);
    const aamm = this.formatarAnoMes(this._dataEmissao);
    const cnpj = cnpjEmpresa.replace(/\D/g, '');
    const mod = this._tipo === TipoNotaFiscal.NFE ? '55' : '56';
    const serie = this._serie.toString().padStart(3, '0');
    const numero = this._numero.toString().padStart(9, '0');
    const tpEmis = '1'; // Normal
    const codigo = Math.floor(Math.random() * 99999999).toString().padStart(8, '0');

    const chaveBase = codigoUF + aamm + cnpj + mod + serie + numero + tpEmis + codigo;
    const dv = this.calcularDV(chaveBase);
    
    this._chaveAcesso = chaveBase + dv;
    return this._chaveAcesso;
  }

  public adicionarItem(itemId: string): void {
    if (!itemId || itemId.trim().length === 0) {
      throw new Error('ID do item é obrigatório');
    }

    if (this._itens.includes(itemId)) {
      throw new Error('Item já adicionado à nota fiscal');
    }

    if (this._status !== StatusNotaFiscal.RASCUNHO) {
      throw new Error('Não é possível adicionar itens a uma nota que não está em rascunho');
    }

    this._itens.push(itemId);
  }

  public removerItem(itemId: string): void {
    if (this._status !== StatusNotaFiscal.RASCUNHO) {
      throw new Error('Não é possível remover itens de uma nota que não está em rascunho');
    }

    const index = this._itens.indexOf(itemId);
    if (index === -1) {
      throw new Error('Item não encontrado na nota fiscal');
    }

    this._itens.splice(index, 1);
  }

  public prepararParaEnvio(): void {
    if (this._status !== StatusNotaFiscal.RASCUNHO) {
      throw new Error('Nota fiscal deve estar em rascunho para ser preparada para envio');
    }

    if (this._itens.length === 0) {
      throw new Error('Nota fiscal deve ter pelo menos um item');
    }

    if (!this._chaveAcesso) {
      throw new Error('Chave de acesso deve ser gerada antes do envio');
    }

    this._status = StatusNotaFiscal.AGUARDANDO_ENVIO;
  }

  public marcarComoEnviada(): void {
    if (this._status !== StatusNotaFiscal.AGUARDANDO_ENVIO) {
      throw new Error('Nota fiscal deve estar aguardando envio');
    }

    this._status = StatusNotaFiscal.ENVIADA;
  }

  public autorizar(protocoloAutorizacao: string, xmlAssinado: string): void {
    if (this._status !== StatusNotaFiscal.ENVIADA) {
      throw new Error('Nota fiscal deve estar enviada para ser autorizada');
    }

    if (!protocoloAutorizacao || protocoloAutorizacao.trim().length === 0) {
      throw new Error('Protocolo de autorização é obrigatório');
    }

    if (!xmlAssinado || xmlAssinado.trim().length === 0) {
      throw new Error('XML assinado é obrigatório');
    }

    this._protocoloAutorizacao = protocoloAutorizacao;
    this._xmlAssinado = xmlAssinado;
    this._status = StatusNotaFiscal.AUTORIZADA;
  }

  public rejeitar(motivo: string): void {
    if (this._status !== StatusNotaFiscal.ENVIADA) {
      throw new Error('Nota fiscal deve estar enviada para ser rejeitada');
    }

    if (!motivo || motivo.trim().length === 0) {
      throw new Error('Motivo da rejeição é obrigatório');
    }

    this._motivoRejeicao = motivo;
    this._status = StatusNotaFiscal.REJEITADA;
  }

  public cancelar(motivo: string): void {
    if (this._status !== StatusNotaFiscal.AUTORIZADA) {
      throw new Error('Apenas notas autorizadas podem ser canceladas');
    }

    if (!motivo || motivo.trim().length === 0) {
      throw new Error('Motivo do cancelamento é obrigatório');
    }

    this._motivoRejeicao = motivo;
    this._status = StatusNotaFiscal.CANCELADA;
  }

  public definirXmlOriginal(xml: string): void {
    if (!xml || xml.trim().length === 0) {
      throw new Error('XML é obrigatório');
    }

    this._xmlOriginal = xml;
  }

  public definirDataVencimento(data: Date): void {
    if (data <= this._dataEmissao) {
      throw new Error('Data de vencimento deve ser posterior à data de emissão');
    }

    this._dataVencimento = data;
  }

  public atualizarObservacoes(observacoes: string): void {
    if (this._status !== StatusNotaFiscal.RASCUNHO) {
      throw new Error('Observações só podem ser alteradas em notas em rascunho');
    }

    this._observacoes = observacoes;
  }

  public atualizarInformacoesAdicionais(informacoes: string): void {
    if (this._status !== StatusNotaFiscal.RASCUNHO) {
      throw new Error('Informações adicionais só podem ser alteradas em notas em rascunho');
    }

    this._informacoesAdicionais = informacoes;
  }

  public podeSerEditada(): boolean {
    return this._status === StatusNotaFiscal.RASCUNHO;
  }

  public estaAutorizada(): boolean {
    return this._status === StatusNotaFiscal.AUTORIZADA;
  }

  public estaCancelada(): boolean {
    return this._status === StatusNotaFiscal.CANCELADA;
  }

  private obterCodigoUF(uf: string): string {
    const codigosUF: { [key: string]: string } = {
      'AC': '12', 'AL': '17', 'AP': '16', 'AM': '23', 'BA': '29', 'CE': '23',
      'DF': '53', 'ES': '32', 'GO': '52', 'MA': '21', 'MT': '51', 'MS': '50',
      'MG': '31', 'PA': '15', 'PB': '25', 'PR': '41', 'PE': '26', 'PI': '22',
      'RJ': '33', 'RN': '24', 'RS': '43', 'RO': '11', 'RR': '14', 'SC': '42',
      'SP': '35', 'SE': '28', 'TO': '17'
    };

    const codigo = codigosUF[uf.toUpperCase()];
    if (!codigo) {
      throw new Error(`UF inválida: ${uf}`);
    }

    return codigo;
  }

  private formatarAnoMes(data: Date): string {
    const ano = data.getFullYear().toString().substr(2, 2);
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    return ano + mes;
  }

  private calcularDV(chave: string): string {
    const pesos = [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    let soma = 0;
    for (let i = 0; i < chave.length; i++) {
      soma += parseInt(chave[i]) * pesos[i];
    }

    const resto = soma % 11;
    return resto < 2 ? '0' : (11 - resto).toString();
  }
}
