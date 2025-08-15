import { NFeDocument, NFeStatus } from '../entities/nfe.entity';

export interface NFeRepository {
  save(nfe: NFeDocument): Promise<NFeDocument>;
  findById(id: string): Promise<NFeDocument | null>;
  findByNumber(number: number, series: number): Promise<NFeDocument | null>;
  findByAccessKey(accessKey: string): Promise<NFeDocument | null>;
  findByStatus(status: NFeStatus): Promise<NFeDocument[]>;
  findByCompanyId(companyId: string): Promise<NFeDocument[]>;
  findByCustomerId(customerId: string): Promise<NFeDocument[]>;
  findAll(): Promise<NFeDocument[]>;
  update(nfe: NFeDocument): Promise<NFeDocument>;
  delete(id: string): Promise<void>;
  getNextNumber(series: number): Promise<number>;
}
