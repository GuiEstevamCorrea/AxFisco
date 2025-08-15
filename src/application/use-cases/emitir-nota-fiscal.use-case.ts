import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CompanyRepository } from '../../domain/repositories/company.repository';
import { CustomerRepository } from '../../domain/repositories/customer.repository';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { EmitirNotaFiscalDto, NotaFiscalEmitidaDto } from '../dtos/emitir-nota-fiscal.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EmitirNotaFiscalUseCase {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(dto: EmitirNotaFiscalDto): Promise<NotaFiscalEmitidaDto> {
    // 1. Validar se empresa existe
    const company = await this.companyRepository.findById(dto.companyId);
    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // 2. Validar se cliente existe
    const customer = await this.customerRepository.findById(dto.customerId);
    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // 3. Validar e buscar produtos
    let valorTotal = 0;
    for (const itemDto of dto.itens) {
      const product = await this.productRepository.findById(itemDto.productId);
      if (!product) {
        throw new NotFoundException(`Produto não encontrado: ${itemDto.productId}`);
      }

      // Calcular valor do item
      const valorItem = itemDto.quantidade * itemDto.valorUnitario;
      const desconto = itemDto.valorDesconto || 0;
      valorTotal += (valorItem - desconto);
    }

    // 4. Validações básicas de negócio
    if (dto.itens.length === 0) {
      throw new BadRequestException('Nota fiscal deve ter pelo menos um item');
    }

    if (valorTotal <= 0) {
      throw new BadRequestException('Valor total da nota fiscal deve ser maior que zero');
    }

    // 5. Gerar dados da nota fiscal
    const notaFiscalId = uuidv4();
    const numero = this.gerarNumeroNota();
    const serie = '001';
    const dataEmissao = new Date();
    const status = 'PENDENTE';

    // 6. Simular emissão (em produção seria integração com SEFAZ)
    let chaveAcesso: string | undefined;
    if (dto.tipo === 'NFe') {
      chaveAcesso = this.gerarChaveAcesso(company.cnpj.value, numero, serie);
    }

    // 7. Retornar resultado
    const result: NotaFiscalEmitidaDto = {
      id: notaFiscalId,
      numero,
      serie,
      chaveAcesso,
      dataEmissao,
      valorTotal,
      status,
      tipo: dto.tipo,
      companyId: dto.companyId,
      customerId: dto.customerId,
      observacoes: dto.observacoes,
    };

    return result;
  }

  private gerarNumeroNota(): string {
    // Simples gerador de número sequencial
    return Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  }

  private gerarChaveAcesso(cnpj: string, numero: string, serie: string): string {
    // Chave de acesso simplificada para exemplo
    const estado = '35'; // SP
    const ano = new Date().getFullYear().toString().slice(-2);
    const mes = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const modelo = '55'; // NFe
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    const numeroFormatado = numero.padStart(9, '0');
    const serieFormatada = serie.padStart(3, '0');
    
    return `${estado}${ano}${mes}${cnpjLimpo}${modelo}${serieFormatada}${numeroFormatado}000000001`;
  }
}
