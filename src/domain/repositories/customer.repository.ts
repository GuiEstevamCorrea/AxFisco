import { Customer } from '../entities/customer.entity';

export interface CustomerRepository {
  save(customer: Customer): Promise<Customer>;
  findById(id: string): Promise<Customer | null>;
  findByDocument(document: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
  update(customer: Customer): Promise<Customer>;
  delete(id: string): Promise<void>;
}
