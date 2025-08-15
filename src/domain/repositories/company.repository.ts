import { Company } from '../entities/company.entity';

export interface CompanyRepository {
  save(company: Company): Promise<Company>;
  findById(id: string): Promise<Company | null>;
  findByCnpj(cnpj: string): Promise<Company | null>;
  findAll(): Promise<Company[]>;
  update(company: Company): Promise<Company>;
  delete(id: string): Promise<void>;
}
