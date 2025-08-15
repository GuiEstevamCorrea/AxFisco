import { NotaFiscal, StatusNotaFiscal, TipoNotaFiscal } from '../entities/nota-fiscal.entity';
import { ItemNotaFiscal } from '../entities/item-nota-fiscal.entity';
import { Company } from '../entities/company.entity';
import { Customer } from '../entities/customer.entity';

export class ValidacaoNFeService {
  
  public static validarDadosObrigatorios(notaFiscal: NotaFiscal, empresa: Company, cliente: Customer): IResultadoValidacao {
    const erros: string[] = [];

    // Validações da empresa
    if (!empresa.isActive) {
      erros.push('Empresa deve estar ativa para emissão de NF-e');
    }

    if (!empresa.podeEmitirNFe()) {
      erros.push('Empresa não está configurada para emitir NF-e');
    }

    if (empresa.certificadoPrecisaRenovar()) {
      erros.push('Certificado digital próximo ao vencimento');
    }

    // Validações do cliente
    if (!cliente.isActive) {
      erros.push('Cliente deve estar ativo');
    }

    if (!cliente.podeSerDestinarioNFe()) {
      erros.push('Cliente deve ter endereço cadastrado');
    }

    if (cliente.necessitaIE() && !cliente.stateRegistration) {
      erros.push('Cliente pessoa jurídica contribuinte deve ter inscrição estadual');
    }

    // Validações da nota fiscal
    if (notaFiscal.status !== StatusNotaFiscal.RASCUNHO) {
      erros.push('Nota fiscal deve estar em rascunho para validação');
    }

    if (notaFiscal.itens.length === 0) {
      erros.push('Nota fiscal deve ter pelo menos um item');
    }

    if (notaFiscal.valorTotal <= 0) {
      erros.push('Valor total da nota fiscal deve ser maior que zero');
    }

    return {
      valida: erros.length === 0,
      erros,
      avisos: []
    };
  }

  public static validarItens(itens: ItemNotaFiscal[]): IResultadoValidacao {
    const erros: string[] = [];
    const avisos: string[] = [];

    if (itens.length === 0) {
      erros.push('Nota fiscal deve ter pelo menos um item');
      return { valida: false, erros, avisos };
    }

    if (itens.length > 990) {
      erros.push('Nota fiscal não pode ter mais de 990 itens');
    }

    // Validar numeração sequencial dos itens
    const numerosItens = itens.map(item => item.numeroItem).sort((a, b) => a - b);
    for (let i = 0; i < numerosItens.length; i++) {
      if (numerosItens[i] !== i + 1) {
        erros.push(`Numeração dos itens deve ser sequencial. Item ${i + 1} esperado, mas encontrado ${numerosItens[i]}`);
        break;
      }
    }

    // Validar cada item
    itens.forEach((item, index) => {
      const validacaoItem = this.validarItem(item, index + 1);
      erros.push(...validacaoItem.erros);
      avisos.push(...validacaoItem.avisos);
    });

    return {
      valida: erros.length === 0,
      erros,
      avisos
    };
  }

  public static validarItem(item: ItemNotaFiscal, numeroEsperado: number): IResultadoValidacao {
    const erros: string[] = [];
    const avisos: string[] = [];

    if (item.numeroItem !== numeroEsperado) {
      erros.push(`Item ${item.numeroItem}: Numeração deve ser sequencial`);
    }

    if (item.quantidade <= 0) {
      erros.push(`Item ${item.numeroItem}: Quantidade deve ser maior que zero`);
    }

    if (item.valorUnitario < 0) {
      erros.push(`Item ${item.numeroItem}: Valor unitário não pode ser negativo`);
    }

    if (item.valorTotal <= 0) {
      erros.push(`Item ${item.numeroItem}: Valor total deve ser maior que zero`);
    }

    if (item.valorDesconto > item.quantidade * item.valorUnitario) {
      erros.push(`Item ${item.numeroItem}: Desconto não pode ser maior que o valor bruto`);
    }

    // Validações de tributos
    const totalTributos = item.calcularTotalTributos();
    if (totalTributos > item.valorTotal) {
      erros.push(`Item ${item.numeroItem}: Valor total dos tributos não pode ser maior que o valor do item`);
    }

    // Validações específicas por tipo
    if (item.ehProduto()) {
      this.validarProduto(item, erros, avisos);
    } else if (item.ehServico()) {
      this.validarServico(item, erros, avisos);
    }

    return {
      valida: erros.length === 0,
      erros,
      avisos
    };
  }

  private static validarProduto(item: ItemNotaFiscal, erros: string[], avisos: string[]): void {
    if (!item.ncm || item.ncm.replace(/\D/g, '').length !== 8) {
      erros.push(`Item ${item.numeroItem}: NCM deve ter 8 dígitos para produtos`);
    }

    if (!item.cfop || item.cfop.replace(/\D/g, '').length !== 4) {
      erros.push(`Item ${item.numeroItem}: CFOP deve ter 4 dígitos`);
    }

    // Validar CFOP para operações com produtos
    const cfopNumero = parseInt(item.cfop.replace(/\D/g, ''));
    if (cfopNumero < 5000 && cfopNumero >= 1000) {
      // CFOP de entrada - pode gerar aviso dependendo do contexto
    } else if (cfopNumero >= 5000 && cfopNumero < 7000) {
      // CFOP de saída - normal para NF-e de venda
    } else {
      avisos.push(`Item ${item.numeroItem}: CFOP ${item.cfop} pode não ser adequado para produtos`);
    }
  }

  private static validarServico(item: ItemNotaFiscal, erros: string[], avisos: string[]): void {
    // Validações específicas para serviços
    if (item.tributos.issqn) {
      if (item.tributos.issqn.aliquota <= 0 || item.tributos.issqn.aliquota > 5) {
        avisos.push(`Item ${item.numeroItem}: Alíquota de ISSQN fora da faixa normal (0-5%)`);
      }
    }

    // Para serviços, alguns campos podem ser opcionais
    if (!item.ncm) {
      avisos.push(`Item ${item.numeroItem}: NCM não informado para serviço`);
    }
  }

  public static validarLimites(notaFiscal: NotaFiscal): IResultadoValidacao {
    const erros: string[] = [];
    const avisos: string[] = [];

    // Limite de valor para NF-e
    const LIMITE_VALOR_NFE = 999999999.99;
    if (notaFiscal.valorTotal > LIMITE_VALOR_NFE) {
      erros.push(`Valor total (${notaFiscal.valorTotal}) excede o limite máximo de R$ ${LIMITE_VALOR_NFE.toLocaleString('pt-BR')}`);
    }

    // Avisos para valores altos
    if (notaFiscal.valorTotal > 100000) {
      avisos.push('Nota fiscal com valor alto - verificar se está correto');
    }

    // Limite de caracteres na descrição
    if (notaFiscal.observacoes && notaFiscal.observacoes.length > 5000) {
      erros.push('Observações não podem exceder 5000 caracteres');
    }

    if (notaFiscal.informacoesAdicionais && notaFiscal.informacoesAdicionais.length > 5000) {
      erros.push('Informações adicionais não podem exceder 5000 caracteres');
    }

    return {
      valida: erros.length === 0,
      erros,
      avisos
    };
  }

  public static validarCoerencia(notaFiscal: NotaFiscal, itens: ItemNotaFiscal[]): IResultadoValidacao {
    const erros: string[] = [];
    const avisos: string[] = [];

    // Verificar se o valor total da nota confere com a soma dos itens
    const valorTotalItens = itens.reduce((total, item) => total + item.valorTotal, 0);
    const diferenca = Math.abs(notaFiscal.valorTotal - valorTotalItens);

    if (diferenca > 0.02) { // Tolerância de 2 centavos para arredondamentos
      erros.push(`Valor total da nota (${notaFiscal.valorTotal}) não confere com a soma dos itens (${valorTotalItens})`);
    }

    // Verificar se o valor dos tributos confere
    const valorTributosItens = itens.reduce((total, item) => total + item.calcularTotalTributos(), 0);
    const diferencaTributos = Math.abs(notaFiscal.valorTributos - valorTributosItens);

    if (diferencaTributos > 0.02) {
      erros.push(`Valor total dos tributos (${notaFiscal.valorTributos}) não confere com a soma dos tributos dos itens (${valorTributosItens})`);
    }

    // Verificar se todos os itens pertencem à nota fiscal
    const itensIncorretos = itens.filter(item => item.notaFiscalId !== notaFiscal.id);
    if (itensIncorretos.length > 0) {
      erros.push(`${itensIncorretos.length} item(ns) não pertencem a esta nota fiscal`);
    }

    return {
      valida: erros.length === 0,
      erros,
      avisos
    };
  }

  public static validarParaEnvio(
    notaFiscal: NotaFiscal, 
    empresa: Company, 
    cliente: Customer, 
    itens: ItemNotaFiscal[]
  ): IResultadoValidacao {
    const resultados: IResultadoValidacao[] = [
      this.validarDadosObrigatorios(notaFiscal, empresa, cliente),
      this.validarItens(itens),
      this.validarLimites(notaFiscal),
      this.validarCoerencia(notaFiscal, itens)
    ];

    const todosErros = resultados.flatMap(r => r.erros);
    const todosAvisos = resultados.flatMap(r => r.avisos);

    return {
      valida: todosErros.length === 0,
      erros: todosErros,
      avisos: todosAvisos
    };
  }
}

export interface IResultadoValidacao {
  valida: boolean;
  erros: string[];
  avisos: string[];
}
