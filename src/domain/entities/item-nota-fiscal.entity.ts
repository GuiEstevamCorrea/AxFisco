import { BaseEntity } from './base.entity';

export enum TipoItem {
  PRODUTO = 'PRODUTO',
  SERVICO = 'SERVICO'
}

export enum OrigemMercadoria {
  NACIONAL = 0,
  ESTRANGEIRA_IMPORTACAO_DIRETA = 1,
  ESTRANGEIRA_MERCADO_INTERNO = 2,
  NACIONAL_CONTEUDO_IMPORT_SUPERIOR_40 = 3,
  NACIONAL_PRODUCAO_CONFORMIDADE = 4,
  NACIONAL_CONTEUDO_IMPORT_INFERIOR_40 = 5,
  ESTRANGEIRA_IMPORTACAO_DIRETA_SEM_NACIONAL = 6,
  ESTRANGEIRA_MERCADO_INTERNO_SEM_NACIONAL = 7
}

export interface TributoItem {
  cst: string;
  aliquota: number;
  valorBase: number;
  valorTributo: number;
}

export interface TributosItem {
  icms?: TributoItem;
  ipi?: TributoItem;
  pis?: TributoItem;
  cofins?: TributoItem;
  issqn?: TributoItem;
}

export class ItemNotaFiscal extends BaseEntity {
  private _notaFiscalId: string;
  private _produtoId: string;
  private _numeroItem: number;
  private _tipo: TipoItem;
  private _codigoProduto: string;
  private _codigoEAN?: string;
  private _descricao: string;
  private _ncm: string;
  private _cest?: string;
  private _cfop: string;
  private _unidadeComercial: string;
  private _quantidade: number;
  private _valorUnitario: number;
  private _valorTotal: number;
  private _valorDesconto: number;
  private _valorOutros: number;
  private _origem: OrigemMercadoria;
  private _tributos: TributosItem;
  private _informacoesAdicionais?: string;

  constructor(
    notaFiscalId: string,
    produtoId: string,
    numeroItem: number,
    tipo: TipoItem,
    codigoProduto: string,
    descricao: string,
    ncm: string,
    cfop: string,
    unidadeComercial: string,
    quantidade: number,
    valorUnitario: number,
    origem: OrigemMercadoria = OrigemMercadoria.NACIONAL,
    tributos: TributosItem = {},
    codigoEAN?: string,
    cest?: string,
    valorDesconto: number = 0,
    valorOutros: number = 0,
    informacoesAdicionais?: string
  ) {
    super();
    this.validarParametros(
      notaFiscalId, produtoId, numeroItem, codigoProduto, descricao,
      ncm, cfop, unidadeComercial, quantidade, valorUnitario
    );

    this._notaFiscalId = notaFiscalId;
    this._produtoId = produtoId;
    this._numeroItem = numeroItem;
    this._tipo = tipo;
    this._codigoProduto = codigoProduto;
    this._descricao = descricao;
    this._ncm = ncm;
    this._cfop = cfop;
    this._unidadeComercial = unidadeComercial;
    this._quantidade = quantidade;
    this._valorUnitario = valorUnitario;
    this._origem = origem;
    this._tributos = tributos;
    this._codigoEAN = codigoEAN;
    this._cest = cest;
    this._valorDesconto = valorDesconto;
    this._valorOutros = valorOutros;
    this._informacoesAdicionais = informacoesAdicionais;

    this._valorTotal = this.calcularValorTotal();
  }

  private validarParametros(
    notaFiscalId: string,
    produtoId: string,
    numeroItem: number,
    codigoProduto: string,
    descricao: string,
    ncm: string,
    cfop: string,
    unidadeComercial: string,
    quantidade: number,
    valorUnitario: number
  ): void {
    if (!notaFiscalId || notaFiscalId.trim().length === 0) {
      throw new Error('ID da nota fiscal é obrigatório');
    }

    if (!produtoId || produtoId.trim().length === 0) {
      throw new Error('ID do produto é obrigatório');
    }

    if (!numeroItem || numeroItem <= 0) {
      throw new Error('Número do item deve ser maior que zero');
    }

    if (!codigoProduto || codigoProduto.trim().length === 0) {
      throw new Error('Código do produto é obrigatório');
    }

    if (!descricao || descricao.trim().length === 0) {
      throw new Error('Descrição do produto é obrigatória');
    }

    if (!this.validarNCM(ncm)) {
      throw new Error('NCM inválido - deve ter 8 dígitos');
    }

    if (!this.validarCFOP(cfop)) {
      throw new Error('CFOP inválido - deve ter 4 dígitos');
    }

    if (!unidadeComercial || unidadeComercial.trim().length === 0) {
      throw new Error('Unidade comercial é obrigatória');
    }

    if (quantidade <= 0) {
      throw new Error('Quantidade deve ser maior que zero');
    }

    if (valorUnitario < 0) {
      throw new Error('Valor unitário não pode ser negativo');
    }
  }

  // Getters
  get notaFiscalId(): string { return this._notaFiscalId; }
  get produtoId(): string { return this._produtoId; }
  get numeroItem(): number { return this._numeroItem; }
  get tipo(): TipoItem { return this._tipo; }
  get codigoProduto(): string { return this._codigoProduto; }
  get codigoEAN(): string | undefined { return this._codigoEAN; }
  get descricao(): string { return this._descricao; }
  get ncm(): string { return this._ncm; }
  get cest(): string | undefined { return this._cest; }
  get cfop(): string { return this._cfop; }
  get unidadeComercial(): string { return this._unidadeComercial; }
  get quantidade(): number { return this._quantidade; }
  get valorUnitario(): number { return this._valorUnitario; }
  get valorTotal(): number { return this._valorTotal; }
  get valorDesconto(): number { return this._valorDesconto; }
  get valorOutros(): number { return this._valorOutros; }
  get origem(): OrigemMercadoria { return this._origem; }
  get tributos(): TributosItem { return this._tributos; }
  get informacoesAdicionais(): string | undefined { return this._informacoesAdicionais; }

  // Métodos de negócio
  public calcularValorTotal(): number {
    const valorBruto = this._quantidade * this._valorUnitario;
    return valorBruto - this._valorDesconto + this._valorOutros;
  }

  public aplicarDesconto(valorDesconto: number): void {
    if (valorDesconto < 0) {
      throw new Error('Valor do desconto não pode ser negativo');
    }

    const valorBruto = this._quantidade * this._valorUnitario;
    if (valorDesconto > valorBruto) {
      throw new Error('Desconto não pode ser maior que o valor bruto do item');
    }

    this._valorDesconto = valorDesconto;
    this._valorTotal = this.calcularValorTotal();
  }

  public adicionarValorOutros(valor: number): void {
    if (valor < 0) {
      throw new Error('Valor outros não pode ser negativo');
    }

    this._valorOutros = valor;
    this._valorTotal = this.calcularValorTotal();
  }

  public atualizarQuantidade(quantidade: number): void {
    if (quantidade <= 0) {
      throw new Error('Quantidade deve ser maior que zero');
    }

    this._quantidade = quantidade;
    this._valorTotal = this.calcularValorTotal();
  }

  public atualizarValorUnitario(valor: number): void {
    if (valor < 0) {
      throw new Error('Valor unitário não pode ser negativo');
    }

    this._valorUnitario = valor;
    this._valorTotal = this.calcularValorTotal();
  }

  public definirTributoICMS(tributo: TributoItem): void {
    this.validarTributo(tributo);
    this._tributos.icms = tributo;
  }

  public definirTributoIPI(tributo: TributoItem): void {
    this.validarTributo(tributo);
    this._tributos.ipi = tributo;
  }

  public definirTributoPIS(tributo: TributoItem): void {
    this.validarTributo(tributo);
    this._tributos.pis = tributo;
  }

  public definirTributoCOFINS(tributo: TributoItem): void {
    this.validarTributo(tributo);
    this._tributos.cofins = tributo;
  }

  public definirTributoISSQN(tributo: TributoItem): void {
    this.validarTributo(tributo);
    this._tributos.issqn = tributo;
  }

  public calcularTotalTributos(): number {
    let total = 0;

    if (this._tributos.icms) total += this._tributos.icms.valorTributo;
    if (this._tributos.ipi) total += this._tributos.ipi.valorTributo;
    if (this._tributos.pis) total += this._tributos.pis.valorTributo;
    if (this._tributos.cofins) total += this._tributos.cofins.valorTributo;
    if (this._tributos.issqn) total += this._tributos.issqn.valorTributo;

    return total;
  }

  public obterAliquotaTotalTributos(): number {
    let total = 0;

    if (this._tributos.icms) total += this._tributos.icms.aliquota;
    if (this._tributos.ipi) total += this._tributos.ipi.aliquota;
    if (this._tributos.pis) total += this._tributos.pis.aliquota;
    if (this._tributos.cofins) total += this._tributos.cofins.aliquota;
    if (this._tributos.issqn) total += this._tributos.issqn.aliquota;

    return total;
  }

  public ehProduto(): boolean {
    return this._tipo === TipoItem.PRODUTO;
  }

  public ehServico(): boolean {
    return this._tipo === TipoItem.SERVICO;
  }

  public definirCodigoEAN(codigo: string): void {
    if (codigo && !this.validarEAN(codigo)) {
      throw new Error('Código EAN inválido');
    }
    this._codigoEAN = codigo;
  }

  public definirCEST(cest: string): void {
    if (cest && !this.validarCEST(cest)) {
      throw new Error('CEST inválido - deve ter 7 dígitos');
    }
    this._cest = cest;
  }

  public atualizarInformacoesAdicionais(informacoes: string): void {
    this._informacoesAdicionais = informacoes;
  }

  public toNFeFormat(): object {
    return {
      nItem: this._numeroItem,
      prod: {
        cProd: this._codigoProduto,
        cEAN: this._codigoEAN || 'SEM GTIN',
        xProd: this._descricao,
        NCM: this._ncm,
        CEST: this._cest,
        CFOP: this._cfop,
        uCom: this._unidadeComercial,
        qCom: this._quantidade,
        vUnCom: this._valorUnitario,
        vProd: this._valorTotal,
        vDesc: this._valorDesconto,
        vOutro: this._valorOutros,
        indTot: 1,
        orig: this._origem
      },
      imposto: this._tributos,
      infAdProd: this._informacoesAdicionais
    };
  }

  private validarTributo(tributo: TributoItem): void {
    if (!tributo.cst || tributo.cst.trim().length === 0) {
      throw new Error('CST do tributo é obrigatório');
    }

    if (tributo.aliquota < 0 || tributo.aliquota > 100) {
      throw new Error('Alíquota deve estar entre 0 e 100');
    }

    if (tributo.valorBase < 0) {
      throw new Error('Valor base do tributo não pode ser negativo');
    }

    if (tributo.valorTributo < 0) {
      throw new Error('Valor do tributo não pode ser negativo');
    }
  }

  private validarNCM(ncm: string): boolean {
    const ncmLimpo = ncm.replace(/\D/g, '');
    return ncmLimpo.length === 8 && /^\d{8}$/.test(ncmLimpo);
  }

  private validarCFOP(cfop: string): boolean {
    const cfopLimpo = cfop.replace(/\D/g, '');
    return cfopLimpo.length === 4 && /^\d{4}$/.test(cfopLimpo);
  }

  private validarEAN(ean: string): boolean {
    const eanLimpo = ean.replace(/\D/g, '');
    return [8, 12, 13, 14].includes(eanLimpo.length) && /^\d+$/.test(eanLimpo);
  }

  private validarCEST(cest: string): boolean {
    const cestLimpo = cest.replace(/\D/g, '');
    return cestLimpo.length === 7 && /^\d{7}$/.test(cestLimpo);
  }
}
