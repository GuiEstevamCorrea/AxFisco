import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerRepository } from '../../domain/repositories/customer.repository';
import { Customer, CustomerType, IndicadorIE } from '../../domain/entities/customer.entity';
import { CustomerEntity } from '../database/entities/customer.entity';
import { CNPJ } from '../../domain/value-objects/cnpj.vo';
import { CPF } from '../../domain/value-objects/cpf.vo';
import { Address } from '../../domain/value-objects/address.vo';

@Injectable()
export class TypeOrmCustomerRepository implements CustomerRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
  ) {}

  async save(customer: Customer): Promise<Customer> {
    const customerEntity = this.toEntity(customer);
    const savedEntity = await this.customerRepository.save(customerEntity);
    return this.toDomain(savedEntity);
  }

  async findById(id: string): Promise<Customer | null> {
    const entity = await this.customerRepository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const entity = await this.customerRepository.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByDocument(document: string): Promise<Customer | null> {
    const cleanDocument = document.replace(/\D/g, '');
    const entity = await this.customerRepository.findOne({ where: { document: cleanDocument } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<Customer[]> {
    const entities = await this.customerRepository.find({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async update(customer: Customer): Promise<Customer> {
    const customerEntity = this.toEntity(customer);
    await this.customerRepository.update(customer.id, customerEntity);
    const updatedEntity = await this.customerRepository.findOne({ where: { id: customer.id } });
    if (!updatedEntity) {
      throw new Error('Customer not found after update');
    }
    return this.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.customerRepository.delete(id);
  }

  async count(): Promise<number> {
    return await this.customerRepository.count();
  }

  private toEntity(customer: Customer): CustomerEntity {
    const entity = new CustomerEntity();
    entity.id = customer.id;
    entity.name = customer.name;
    entity.email = customer.email;
    entity.phone = customer.phone;
    entity.document = customer.document.value.replace(/\D/g, '');
    entity.documentType = customer.document instanceof CNPJ ? 'CNPJ' : 'CPF';
    entity.customerType = customer.customerType;
    entity.stateRegistration = customer.stateRegistration;
    entity.municipalRegistration = customer.municipalRegistration;
    entity.isActive = customer.isActive;
    entity.indicadorIE = customer.indicadorIE;
    entity.suframa = customer.suframa;
    entity.observacoes = customer.observacoes;
    entity.createdAt = customer.createdAt;
    entity.updatedAt = customer.updatedAt;

    // Address
    if (customer.address) {
      entity.street = customer.address.street;
      entity.number = customer.address.number;
      entity.complement = customer.address.complement;
      entity.neighborhood = customer.address.neighborhood;
      entity.city = customer.address.city;
      entity.state = customer.address.state;
      entity.zipCode = customer.address.zipCode;
      entity.country = customer.address.country;
      entity.codigoIbge = customer.address.codigoIbge;
      entity.codigoPais = customer.address.codigoPais;
    }

    return entity;
  }

  private toDomain(entity: CustomerEntity): Customer {
    // Criar documento (CNPJ ou CPF)
    const document = entity.documentType === 'CNPJ' 
      ? new CNPJ(entity.document) 
      : new CPF(entity.document);

    // Criar endereço se existir
    let address: Address | undefined;
    if (entity.street && entity.number && entity.neighborhood && entity.city && entity.state && entity.zipCode) {
      address = new Address(
        entity.street,
        entity.number,
        entity.complement || '',
        entity.neighborhood,
        entity.city,
        entity.state,
        entity.zipCode,
        entity.country || 'Brasil',
        entity.codigoIbge,
        entity.codigoPais
      );
    }

    // Criar customer domain
    const customer = new Customer(
      entity.name,
      entity.email,
      document,
      entity.customerType as CustomerType,
      entity.indicadorIE as IndicadorIE,
      entity.phone,
      address,
      entity.stateRegistration,
      entity.municipalRegistration,
      entity.suframa,
      entity.observacoes,
      entity.id
    );

    // Definir timestamps
    (customer as any)._createdAt = entity.createdAt;
    (customer as any)._updatedAt = entity.updatedAt;

    if (!entity.isActive) {
      customer.deactivate();
    }

    return customer;
  }
}
