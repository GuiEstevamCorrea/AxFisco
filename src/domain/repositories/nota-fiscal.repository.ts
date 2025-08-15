import { NotaFiscal, StatusNotaFiscal, TipoNotaFiscal } from '../entities/nota-fiscal.entity';

export interface INotaFiscalRepository {
  save(notaFiscal: NotaFiscal): Promise<NotaFiscal>;
  findById(id: string): Promise<NotaFiscal | null>;
  findByChaveAcesso(chaveAcesso: string): Promise<NotaFiscal | null>;
  findByNumeroSerie(numero: number, serie: number, empresaId: string): Promise<NotaFiscal | null>;
  findByEmpresa(empresaId: string, page?: number, limit?: number): Promise<NotaFiscal[]>;
  findByCliente(clienteId: string, page?: number, limit?: number): Promise<NotaFiscal[]>;
  findByStatus(status: StatusNotaFiscal, empresaId?: string): Promise<NotaFiscal[]>;
  findByTipo(tipo: TipoNotaFiscal, empresaId?: string): Promise<NotaFiscal[]>;
  findByPeriodo(dataInicio: Date, dataFim: Date, empresaId?: string): Promise<NotaFiscal[]>;
  update(notaFiscal: NotaFiscal): Promise<NotaFiscal>;
  delete(id: string): Promise<void>;
  count(empresaId?: string): Promise<number>;
  countByStatus(status: StatusNotaFiscal, empresaId?: string): Promise<number>;
}
