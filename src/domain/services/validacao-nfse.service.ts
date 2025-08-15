import { NotaFiscal, TipoNotaFiscal } from '../entities/nota-fiscal.entity';
import { Company } from '../entities/company.entity';

export class ValidacaoNFSeService {
  
  public static validarDadosObrigatoriosNFSe(
    notaFiscal: NotaFiscal, 
    empresa: Company
  ): IResultadoValidacaoNFSe {
    const erros: string[] = [];
    const avisos: string[] = [];

    // Validações específicas para NFS-e
    if (notaFiscal.tipo !== TipoNotaFiscal.NFSE) {
      erros.push('Nota fiscal deve ser do tipo NFS-e');
    }

    if (!empresa.podeEmitirNFSe()) {
      erros.push('Empresa não está configurada para emitir NFS-e');
    }

    if (!empresa.municipalRegistration) {
      erros.push('Inscrição municipal é obrigatória para emissão de NFS-e');
    }

    if (!empresa.address.codigoIbge) {
      erros.push('Código IBGE do município é obrigatório para NFS-e');
    }

    // Validações de limites específicos para NFS-e
    const LIMITE_VALOR_NFSE = 99999999.99; // Limite menor que NF-e
    if (notaFiscal.valorTotal > LIMITE_VALOR_NFSE) {
      erros.push(`Valor total excede o limite para NFS-e: R$ ${LIMITE_VALOR_NFSE.toLocaleString('pt-BR')}`);
    }

    return {
      valida: erros.length === 0,
      erros,
      avisos
    };
  }

  public static validarServicosNFSe(itens: any[]): IResultadoValidacaoNFSe {
    const erros: string[] = [];
    const avisos: string[] = [];

    // Todos os itens devem ser serviços
    const produtosEncontrados = itens.filter(item => item.ehProduto && item.ehProduto());
    if (produtosEncontrados.length > 0) {
      erros.push('NFS-e só pode conter serviços, produtos não são permitidos');
    }

    // Validar código de serviço (lista de serviços LC 116/2003)
    itens.forEach((item, index) => {
      if (!item.codigoServico) {
        erros.push(`Item ${index + 1}: Código de serviço é obrigatório para NFS-e`);
      } else if (!this.validarCodigoServico(item.codigoServico)) {
        erros.push(`Item ${index + 1}: Código de serviço inválido`);
      }

      // Validar ISSQN
      if (!item.tributos?.issqn) {
        erros.push(`Item ${index + 1}: ISSQN é obrigatório para serviços`);
      } else {
        const issqn = item.tributos.issqn;
        if (issqn.aliquota <= 0 || issqn.aliquota > 5) {
          erros.push(`Item ${index + 1}: Alíquota de ISSQN deve estar entre 0,01% e 5%`);
        }
      }
    });

    return {
      valida: erros.length === 0,
      erros,
      avisos
    };
  }

  public static validarRetencoes(dadosNFSe: any): IResultadoValidacaoNFSe {
    const erros: string[] = [];
    const avisos: string[] = [];

    const retencoes = dadosNFSe.retencoes || {};

    // Validar retenção de ISSQN
    if (retencoes.issqnRetido) {
      if (!retencoes.valorIssqnRetido || retencoes.valorIssqnRetido <= 0) {
        erros.push('Valor do ISSQN retido deve ser informado quando há retenção');
      }

      if (retencoes.valorIssqnRetido > dadosNFSe.valorTotal) {
        erros.push('Valor do ISSQN retido não pode ser maior que o valor total');
      }
    }

    // Validar outras retenções (IR, PIS, COFINS, CSLL, INSS)
    const outrasRetencoes = ['ir', 'pis', 'cofins', 'csll', 'inss'];
    outrasRetencoes.forEach(tributo => {
      const valorRetido = retencoes[`valor${tributo.toUpperCase()}Retido`];
      if (valorRetido && valorRetido > dadosNFSe.valorTotal) {
        erros.push(`Valor do ${tributo.toUpperCase()} retido não pode ser maior que o valor total`);
      }
    });

    return {
      valida: erros.length === 0,
      erros,
      avisos
    };
  }

  public static validarRegimeEspecialTributacao(empresa: Company): IResultadoValidacaoNFSe {
    const erros: string[] = [];
    const avisos: string[] = [];

    // Verificar se o regime tributário é compatível com NFS-e
    switch (empresa.taxRegime) {
      case 'SIMPLES_NACIONAL':
        // Simples Nacional tem regras específicas
        if (!empresa.regimeTributarioEspecial) {
          avisos.push('Empresa do Simples Nacional deve informar regime tributário especial se aplicável');
        }
        break;

      case 'MEI':
        // MEI tem limitações
        avisos.push('MEI tem limitações para emissão de NFS-e, verificar valores e atividades');
        break;

      case 'LUCRO_PRESUMIDO':
      case 'LUCRO_REAL':
        // Regimes normais, sem restrições especiais
        break;

      default:
        erros.push('Regime tributário não reconhecido para emissão de NFS-e');
    }

    return {
      valida: erros.length === 0,
      erros,
      avisos
    };
  }

  public static validarMunicipioServico(
    codigoMunicipioEmpresa: string, 
    codigoMunicipioServico: string
  ): IResultadoValidacaoNFSe {
    const erros: string[] = [];
    const avisos: string[] = [];

    if (!codigoMunicipioServico) {
      erros.push('Código do município de prestação do serviço é obrigatório');
    }

    // Se o serviço foi prestado em município diferente da empresa
    if (codigoMunicipioEmpresa !== codigoMunicipioServico) {
      avisos.push('Serviço prestado em município diferente da empresa - verificar regras específicas');
    }

    return {
      valida: erros.length === 0,
      erros,
      avisos
    };
  }

  public static validarCompleta(
    notaFiscal: NotaFiscal,
    empresa: Company,
    itens: any[],
    dadosAdicionais: any
  ): IResultadoValidacaoNFSe {
    const resultados: IResultadoValidacaoNFSe[] = [
      this.validarDadosObrigatoriosNFSe(notaFiscal, empresa),
      this.validarServicosNFSe(itens),
      this.validarRetencoes(dadosAdicionais),
      this.validarRegimeEspecialTributacao(empresa),
      this.validarMunicipioServico(
        empresa.address.codigoIbge || '',
        dadosAdicionais.codigoMunicipioServico || empresa.address.codigoIbge || ''
      )
    ];

    const todosErros = resultados.flatMap(r => r.erros);
    const todosAvisos = resultados.flatMap(r => r.avisos);

    return {
      valida: todosErros.length === 0,
      erros: todosErros,
      avisos: todosAvisos
    };
  }

  private static validarCodigoServico(codigo: string): boolean {
    // Lista simplificada - em produção seria uma lista completa da LC 116/2003
    const codigosValidos = [
      '01.01', '01.02', '01.03', '01.04', '01.05', '01.06', '01.07', '01.08', '01.09',
      '02.01', '02.02', '02.03', '02.04', '02.05', '02.06', '02.07', '02.08', '02.09',
      '03.01', '03.02', '03.03', '03.04', '03.05',
      '04.01', '04.02', '04.03', '04.04', '04.05', '04.06', '04.07', '04.08', '04.09',
      '05.01', '05.02', '05.03', '05.04', '05.05', '05.06', '05.07', '05.08', '05.09'
      // ... mais códigos conforme LC 116/2003
    ];

    return codigosValidos.includes(codigo);
  }
}

export interface IResultadoValidacaoNFSe {
  valida: boolean;
  erros: string[];
  avisos: string[];
}
