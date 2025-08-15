import { NFSeDocument, NFSeStatus } from '../entities/nfse.entity';

export interface NFSeRepository {
  save(nfse: NFSeDocument): Promise<NFSeDocument>;
  findById(id: string): Promise<NFSeDocument | null>;
  findByRps(rpsNumber: number, rpsSeries: string): Promise<NFSeDocument | null>;
  findByNumber(number: number): Promise<NFSeDocument | null>;
  findByStatus(status: NFSeStatus): Promise<NFSeDocument[]>;
  findByCompanyId(companyId: string): Promise<NFSeDocument[]>;
  findByCustomerId(customerId: string): Promise<NFSeDocument[]>;
  findAll(): Promise<NFSeDocument[]>;
  update(nfse: NFSeDocument): Promise<NFSeDocument>;
  delete(id: string): Promise<void>;
  getNextRpsNumber(series: string): Promise<number>;
}
