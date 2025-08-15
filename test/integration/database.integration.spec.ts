import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppSqliteModule } from '../../src/app-sqlite.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomerEntity } from '../../src/infrastructure/database/entities/customer.entity';
import { Repository } from 'typeorm';

describe('Database Integration (SQLite)', () => {
  let app: INestApplication;
  let customerRepository: Repository<CustomerEntity>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppSqliteModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    customerRepository = moduleFixture.get<Repository<CustomerEntity>>(
      getRepositoryToken(CustomerEntity),
    );
    
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should connect to database and create customer entity', async () => {
    // Criar um customer no banco
    const customer = customerRepository.create({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Customer',
      document: '123.456.789-10',
      documentType: 'CPF',
      customerType: 'PF',
      email: 'test@example.com',
      phone: '11999999999',
      isActive: true
    });

    const savedCustomer = await customerRepository.save(customer);
    expect(savedCustomer).toBeDefined();
    expect(savedCustomer.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(savedCustomer.name).toBe('Test Customer');
    expect(savedCustomer.document).toBe('123.456.789-10');

    // Buscar o customer salvo
    const foundCustomer = await customerRepository.findOne({
      where: { id: '123e4567-e89b-12d3-a456-426614174000' }
    });

    expect(foundCustomer).toBeDefined();
    expect(foundCustomer?.name).toBe('Test Customer');
  });

  it('should list all customers', async () => {
    // Criar alguns customers
    const customers = [
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Customer 1',
        document: '111.111.111-11',
        documentType: 'CPF',
        customerType: 'PF',
        email: 'customer1@test.com',
        isActive: true
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        name: 'Customer 2',
        document: '222.222.222-22',
        documentType: 'CPF',
        customerType: 'PF',
        email: 'customer2@test.com',
        isActive: true
      }
    ];

    await customerRepository.save(customers);

    const allCustomers = await customerRepository.find();
    expect(allCustomers).toHaveLength(2);
    expect(allCustomers[0].name).toBe('Customer 1');
    expect(allCustomers[1].name).toBe('Customer 2');
  });

  it('should update customer', async () => {
    // Criar customer
    const customer = await customerRepository.save({
      id: '123e4567-e89b-12d3-a456-426614174003',
      name: 'Original Name',
      document: '333.333.333-33',
      documentType: 'CPF',
      customerType: 'PF',
      email: 'original@test.com',
      isActive: true
    });

    // Atualizar customer
    customer.name = 'Updated Name';
    customer.email = 'updated@test.com';
    
    const updatedCustomer = await customerRepository.save(customer);
    expect(updatedCustomer.name).toBe('Updated Name');
    expect(updatedCustomer.email).toBe('updated@test.com');

    // Verificar se foi atualizado no banco
    const foundCustomer = await customerRepository.findOne({
      where: { id: customer.id }
    });
    
    expect(foundCustomer?.name).toBe('Updated Name');
    expect(foundCustomer?.email).toBe('updated@test.com');
  });

  it('should delete customer', async () => {
    // Criar customer
    const customer = await customerRepository.save({
      id: '123e4567-e89b-12d3-a456-426614174004',
      name: 'To Be Deleted',
      document: '444.444.444-44',
      documentType: 'CPF',
      customerType: 'PF',
      email: 'delete@test.com',
      isActive: true
    });

    // Deletar customer
    await customerRepository.delete(customer.id);

    // Verificar se foi deletado
    const foundCustomer = await customerRepository.findOne({
      where: { id: customer.id }
    });
    
    expect(foundCustomer).toBeNull();
  });
});
