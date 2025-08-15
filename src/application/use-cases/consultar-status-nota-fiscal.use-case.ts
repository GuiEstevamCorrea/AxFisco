import { Injectable, NotFoundException } from '@nestjs/common';
import { NFeRepository } from '../../domain/repositories/nfe.repository';
import { NFSeRepository } from '../../domain/repositories/nfse.repository';
import { ConsultarStatusNotaFiscalDto, StatusNotaFiscalDto } from '../dtos/consultar-notas-fiscais.dto';

@Injectable()
export class ConsultarStatusNotaFiscalUseCase {
  constructor(
    private readonly nfeRepository: NFeRepository,
    private readonly nfseRepository: NFSeRepository,
  ) {}

  async execute(dto: ConsultarStatusNotaFiscalDto): Promise<StatusNotaFiscalDto> {
    // 1. Tentar buscar como NFe primeiro
    let nfe = await this.nfeRepository.findById(dto.notaFiscalId);
    let nfse: any = null;
    let tipo: 'NFe' | 'NFSe' = 'NFe';

    // 2. Se não encontrou como NFe, tentar como NFSe
    if (!nfe) {
      nfse = await this.nfseRepository.findById(dto.notaFiscalId);
      tipo = 'NFSe';
    }

    // 3. Se não encontrou em nenhum repositório
    if (!nfe && !nfse) {
      throw new NotFoundException('Nota fiscal não encontrada');
    }

    const notaFiscal = nfe || nfse;

    // 4. Simular consulta ao status atualizado (em produção seria consulta ao SEFAZ)
    const statusAtualizado = this.simularConsultaStatus(notaFiscal, tipo);

    // 5. Mapear para DTO
    const result: StatusNotaFiscalDto = {
      id: notaFiscal.id,
      numero: this.getNumero(notaFiscal),
      serie: this.getSerie(notaFiscal),
      chaveAcesso: tipo === 'NFe' && nfe ? this.getChaveAcesso(nfe) : undefined,
      status: statusAtualizado.status,
      dataEmissao: this.getDataEmissao(notaFiscal),
      dataUltimaConsulta: new Date(),
      protocolo: statusAtualizado.protocolo,
      motivo: statusAtualizado.motivo,
      valorTotal: this.getValorTotal(notaFiscal),
      tipo,
      situacaoSefaz: statusAtualizado.situacaoSefaz,
      codigoRetorno: statusAtualizado.codigoRetorno,
      mensagemRetorno: statusAtualizado.mensagemRetorno,
    };

    return result;
  }

  private simularConsultaStatus(notaFiscal: any, tipo: 'NFe' | 'NFSe') {
    // Simulação de consulta ao status (em produção seria integração real com SEFAZ)
    const statusPossíveis = ['AUTORIZADA', 'PENDENTE', 'REJEITADA', 'CANCELADA'];
    const statusAtual = statusPossíveis[Math.floor(Math.random() * statusPossíveis.length)];

    return {
      status: statusAtual,
      protocolo: statusAtual === 'AUTORIZADA' ? `${tipo}${Date.now()}` : undefined,
      motivo: statusAtual === 'REJEITADA' ? 'Erro de validação nos dados' : undefined,
      situacaoSefaz: statusAtual === 'AUTORIZADA' ? '100 - Autorizado o uso da NFe' : '999 - Rejeição',
      codigoRetorno: statusAtual === 'AUTORIZADA' ? '100' : '999',
      mensagemRetorno: statusAtual === 'AUTORIZADA' ? 'Autorizado o uso da NFe' : 'Rejeição: Erro nos dados',
    };
  }

  // Métodos auxiliares para extrair dados das entidades (adaptados conforme as entidades reais)
  private getNumero(notaFiscal: any): string {
    return notaFiscal.number?.toString() || notaFiscal.numero?.toString() || '000001';
  }

  private getSerie(notaFiscal: any): string {
    return notaFiscal.series?.toString() || notaFiscal.serie?.toString() || '001';
  }

  private getChaveAcesso(notaFiscal: any): string | undefined {
    return notaFiscal.accessKey || notaFiscal.chaveAcesso;
  }

  private getDataEmissao(notaFiscal: any): Date {
    return notaFiscal.issueDate || notaFiscal.dataEmissao || new Date();
  }

  private getValorTotal(notaFiscal: any): number {
    return notaFiscal.totalValue || notaFiscal.valorTotal || 0;
  }
}
