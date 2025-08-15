import { ItemNotaFiscal, TipoItem } from '../entities/item-nota-fiscal.entity';

export interface IItemNotaFiscalRepository {
  save(item: ItemNotaFiscal): Promise<ItemNotaFiscal>;
  findById(id: string): Promise<ItemNotaFiscal | null>;
  findByNotaFiscal(notaFiscalId: string): Promise<ItemNotaFiscal[]>;
  findByProduto(produtoId: string): Promise<ItemNotaFiscal[]>;
  findByTipo(tipo: TipoItem, notaFiscalId?: string): Promise<ItemNotaFiscal[]>;
  update(item: ItemNotaFiscal): Promise<ItemNotaFiscal>;
  delete(id: string): Promise<void>;
  deleteByNotaFiscal(notaFiscalId: string): Promise<void>;
  count(notaFiscalId?: string): Promise<number>;
  sumValorTotal(notaFiscalId: string): Promise<number>;
  sumValorTributos(notaFiscalId: string): Promise<number>;
}
