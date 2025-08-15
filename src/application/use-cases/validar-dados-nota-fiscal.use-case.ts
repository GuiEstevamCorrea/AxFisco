import { Injectable, NotFoundException } from '@nestjs/common';
import { CompanyRepository } from '../../domain/repositories/company.repository';
import { CustomerRepository } from '../../domain/repositories/customer.repository';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { ValidacaoNFeService } from '../../domain/services/validacao-nfe.service';
import { ValidacaoNFSeService } from '../../domain/services/validacao-nfse.service';
import { 
  ValidarDadosNotaFiscalDto, 
  ResultadoValidacaoDto, 
  ErroValidacaoDto 
} from '../dtos/validar-dados-nota-fiscal.dto';

@Injectable()
export class ValidarDadosNotaFiscalUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly productRepository: ProductRepository,
    private readonly validacaoNFeService: ValidacaoNFeService,
    private readonly validacaoNFSeService: ValidacaoNFSeService,
  ) {}

  async execute(dto: ValidarDadosNotaFiscalDto): Promise<ResultadoValidacaoDto> {
    const erros: ErroValidacaoDto[] = [];
    const avisos: ErroValidacaoDto[] = [];
    let valorTotalCalculado = 0;
    let impostoTotalCalculado = 0;

    try {
      // 1. Validar empresa
      const company = await this.companyRepository.findById(dto.companyId);
      if (!company) {
        erros.push({
          campo: 'companyId',
          mensagem: 'Empresa não encontrada',
          valor: dto.companyId,
        });
      } else {
        // Validar se empresa está ativa
        if (!company.isActive) {
          erros.push({
            campo: 'companyId',
            mensagem: 'Empresa não está ativa',
            valor: dto.companyId,
          });
        }

        // Validar certificado digital se for NFe
        if (dto.tipo === 'NFe' && !company.certificadoDigital) {
          erros.push({
            campo: 'companyId',
            mensagem: 'Empresa não possui certificado digital configurado',
            valor: dto.companyId,
          });
        }
      }

      // 2. Validar cliente
      const customer = await this.customerRepository.findById(dto.customerId);
      if (!customer) {
        erros.push({
          campo: 'customerId',
          mensagem: 'Cliente não encontrado',
          valor: dto.customerId,
        });
      } else {
        // Validar se cliente está ativo
        if (!customer.isActive) {
          avisos.push({
            campo: 'customerId',
            mensagem: 'Cliente não está ativo',
            valor: dto.customerId,
          });
        }

        // Validar documento do cliente
        const validacaoDocumento = this.validarDocumentoCliente(customer);
        if (!validacaoDocumento.valido) {
          erros.push({
            campo: 'customerId',
            mensagem: validacaoDocumento.erro,
            valor: dto.customerId,
          });
        }
      }

      // 3. Validar natureza da operação
      if (!dto.naturezaOperacao || dto.naturezaOperacao.trim().length === 0) {
        erros.push({
          campo: 'naturezaOperacao',
          mensagem: 'Natureza da operação é obrigatória',
          valor: dto.naturezaOperacao,
        });
      }

      // 4. Validar itens
      if (!dto.itens || dto.itens.length === 0) {
        erros.push({
          campo: 'itens',
          mensagem: 'Nota fiscal deve ter pelo menos um item',
          valor: dto.itens,
        });
      } else {
        for (let i = 0; i < dto.itens.length; i++) {
          const item = dto.itens[i];
          const validacaoItem = await this.validarItem(item, i);
          
          erros.push(...validacaoItem.erros);
          avisos.push(...validacaoItem.avisos);
          valorTotalCalculado += validacaoItem.valorItem;
          impostoTotalCalculado += validacaoItem.impostoItem;
        }
      }

      // 5. Validações específicas por tipo
      if (dto.tipo === 'NFe') {
        const validacaoNFe = this.validarEspecificoNFe(dto, company, customer);
        erros.push(...validacaoNFe.erros);
        avisos.push(...validacaoNFe.avisos);
      } else {
        const validacaoNFSe = this.validarEspecificoNFSe(dto, company, customer);
        erros.push(...validacaoNFSe.erros);
        avisos.push(...validacaoNFSe.avisos);
      }

      // 6. Validações de valores
      if (valorTotalCalculado <= 0) {
        erros.push({
          campo: 'itens',
          mensagem: 'Valor total deve ser maior que zero',
          valor: valorTotalCalculado,
        });
      }

      // 7. Construir resultado
      const resultado: ResultadoValidacaoDto = {
        valido: erros.length === 0,
        erros,
        avisos,
        valorTotalCalculado,
        impostoTotalCalculado,
      };

      return resultado;

    } catch (error) {
      // Em caso de erro inesperado, retornar como erro de validação
      erros.push({
        campo: 'geral',
        mensagem: `Erro interno na validação: ${error.message}`,
        valor: error,
      });

      return {
        valido: false,
        erros,
        avisos,
        valorTotalCalculado: 0,
        impostoTotalCalculado: 0,
      };
    }
  }

  private validarDocumentoCliente(customer: any): { valido: boolean; erro?: string } {
    try {
      if (!customer.document) {
        return { valido: false, erro: 'Cliente não possui documento' };
      }

      // Se for string simples
      if (typeof customer.document === 'string') {
        const documento = customer.document.replace(/\D/g, '');
        if (documento.length === 11) {
          // Validação simples de CPF
          return { valido: this.validarCPF(documento), erro: 'CPF inválido' };
        } else if (documento.length === 14) {
          // Validação simples de CNPJ
          return { valido: this.validarCNPJ(documento), erro: 'CNPJ inválido' };
        }
        return { valido: false, erro: 'Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos' };
      }

      // Se for objeto com value
      if (customer.document.value) {
        const documento = customer.document.value.replace(/\D/g, '');
        return this.validarDocumentoCliente({ document: documento });
      }

      return { valido: false, erro: 'Formato de documento inválido' };
    } catch (error) {
      return { valido: false, erro: 'Erro na validação do documento' };
    }
  }

  private async validarItem(item: any, index: number): Promise<{
    erros: ErroValidacaoDto[];
    avisos: ErroValidacaoDto[];
    valorItem: number;
    impostoItem: number;
  }> {
    const erros: ErroValidacaoDto[] = [];
    const avisos: ErroValidacaoDto[] = [];
    let valorItem = 0;
    let impostoItem = 0;

    const campo = `itens[${index}]`;

    // Validar produto
    try {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        erros.push({
          campo: `${campo}.productId`,
          mensagem: 'Produto não encontrado',
          valor: item.productId,
        });
      } else if (!product.isActive) {
        avisos.push({
          campo: `${campo}.productId`,
          mensagem: 'Produto não está ativo',
          valor: item.productId,
        });
      }
    } catch (error) {
      erros.push({
        campo: `${campo}.productId`,
        mensagem: 'Erro ao buscar produto',
        valor: item.productId,
      });
    }

    // Validar descrição
    if (!item.descricao || item.descricao.trim().length === 0) {
      erros.push({
        campo: `${campo}.descricao`,
        mensagem: 'Descrição é obrigatória',
        valor: item.descricao,
      });
    }

    // Validar quantidade
    if (!item.quantidade || item.quantidade <= 0) {
      erros.push({
        campo: `${campo}.quantidade`,
        mensagem: 'Quantidade deve ser maior que zero',
        valor: item.quantidade,
      });
    }

    // Validar valor unitário
    if (!item.valorUnitario || item.valorUnitario <= 0) {
      erros.push({
        campo: `${campo}.valorUnitario`,
        mensagem: 'Valor unitário deve ser maior que zero',
        valor: item.valorUnitario,
      });
    }

    // Calcular valores se válidos
    if (item.quantidade > 0 && item.valorUnitario > 0) {
      const valorBruto = item.quantidade * item.valorUnitario;
      const desconto = item.valorDesconto || 0;
      valorItem = valorBruto - desconto;

      // Calcular impostos aproximados (simplificado)
      impostoItem = valorItem * 0.18; // 18% aproximado
    }

    return { erros, avisos, valorItem, impostoItem };
  }

  private validarEspecificoNFe(dto: any, company: any, customer: any): {
    erros: ErroValidacaoDto[];
    avisos: ErroValidacaoDto[];
  } {
    const erros: ErroValidacaoDto[] = [];
    const avisos: ErroValidacaoDto[] = [];

    // Validações específicas para NFe
    if (company && !company.inscricaoEstadual) {
      avisos.push({
        campo: 'companyId',
        mensagem: 'Empresa sem inscrição estadual pode ter limitações',
        valor: company.id,
      });
    }

    return { erros, avisos };
  }

  private validarEspecificoNFSe(dto: any, company: any, customer: any): {
    erros: ErroValidacaoDto[];
    avisos: ErroValidacaoDto[];
  } {
    const erros: ErroValidacaoDto[] = [];
    const avisos: ErroValidacaoDto[] = [];

    // Validações específicas para NFSe
    if (company && !company.inscricaoMunicipal) {
      erros.push({
        campo: 'companyId',
        mensagem: 'Empresa deve ter inscrição municipal para emitir NFSe',
        valor: company.id,
      });
    }

    return { erros, avisos };
  }

  private validarCPF(cpf: string): boolean {
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false; // CPFs com dígitos iguais
    
    // Validação básica dos dígitos verificadores
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digito1 = 11 - (soma % 11);
    if (digito1 > 9) digito1 = 0;
    
    if (parseInt(cpf.charAt(9)) !== digito1) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let digito2 = 11 - (soma % 11);
    if (digito2 > 9) digito2 = 0;
    
    return parseInt(cpf.charAt(10)) === digito2;
  }

  private validarCNPJ(cnpj: string): boolean {
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false; // CNPJs com dígitos iguais
    
    // Validação básica dos dígitos verificadores
    const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    let soma = 0;
    for (let i = 0; i < 12; i++) {
      soma += parseInt(cnpj.charAt(i)) * pesos1[i];
    }
    let digito1 = 11 - (soma % 11);
    if (digito1 > 9) digito1 = 0;
    
    if (parseInt(cnpj.charAt(12)) !== digito1) return false;
    
    soma = 0;
    for (let i = 0; i < 13; i++) {
      soma += parseInt(cnpj.charAt(i)) * pesos2[i];
    }
    let digito2 = 11 - (soma % 11);
    if (digito2 > 9) digito2 = 0;
    
    return parseInt(cnpj.charAt(13)) === digito2;
  }
}
