import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '@domain/repositories/customer.repository';
import { Customer } from '@domain/entities/customer.entity';

@Injectable()
export class InMemoryCustomerRepository implements CustomerRepository {
  private customers: Customer[] = [];

  async save(customer: Customer): Promise<Customer> {
    this.customers.push(customer);
    return customer;
  }

  async findById(id: string): Promise<Customer | null> {
    return this.customers.find(customer => customer.id === id) || null;
  }

  async findByDocument(document: string): Promise<Customer | null> {
    return this.customers.find(customer => 
      customer.document.toString() === document.replace(/\D/g, '')
    ) || null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.customers.find(customer => customer.email === email) || null;
  }

  async findAll(): Promise<Customer[]> {
    return [...this.customers];
  }

  async update(customer: Customer): Promise<Customer> {
    const index = this.customers.findIndex(c => c.id === customer.id);
    if (index !== -1) {
      this.customers[index] = customer;
    }
    return customer;
  }

  async delete(id: string): Promise<void> {
    const index = this.customers.findIndex(c => c.id === id);
    if (index !== -1) {
      this.customers.splice(index, 1);
    }
  }
}
