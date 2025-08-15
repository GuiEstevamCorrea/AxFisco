import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppSqliteModule } from '../../src/app-sqlite.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomerEntity } from '../../src/infrastructure/database/entities/customer.entity';
import { Repository } from 'typeorm';

describe('Customer Integration (SQLite)', () => {
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

  it('should create a customer via API', async () => {
    const customerData = {
      name: 'João Silva',
      document: '123.456.789-10',
      documentType: 'CPF',
      customerType: 'PF',
      street: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      country: 'Brasil',
      email: 'joao@example.com',
      phone: '(11) 98765-4321'
    };

    const response = await request(app.getHttpServer())
      .post('/customers')
      .send(customerData)
      .expect(201);

    expect(response.body).toMatchObject({
      name: customerData.name,
      document: customerData.document,
      email: customerData.email,
    });

    // Verificar se foi salvo no banco
    const savedCustomer = await customerRepository.findOne({
      where: { document: customerData.document }
    });

    expect(savedCustomer).toBeDefined();
    expect(savedCustomer.name).toBe(customerData.name);
  });

  it('should get all customers', async () => {
    // Criar alguns customers no banco
    const customer1 = customerRepository.create({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Customer 1',
      document: '111.111.111-11',
      documentType: 'CPF',
      customerType: 'PF',
      street: 'Rua A, 1',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01111-111',
      country: 'Brasil',
      email: 'customer1@test.com',
      phone: '11111111111'
    });

    const customer2 = customerRepository.create({
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Customer 2',
      document: '222.222.222-22',
      documentType: 'CPF',
      customerType: 'PF',
      street: 'Rua B, 2',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '02222-222',
      country: 'Brasil',
      email: 'customer2@test.com',
      phone: '22222222222'
    });

    await customerRepository.save([customer1, customer2]);

    const response = await request(app.getHttpServer())
      .get('/customers')
      .expect(200);

    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toMatchObject({
      name: 'Customer 1',
      document: '111.111.111-11',
    });
    expect(response.body[1]).toMatchObject({
      name: 'Customer 2',
      document: '222.222.222-22',
    });
  });

  it('should handle validation errors', async () => {
    const invalidCustomerData = {
      name: '', // Nome vazio - inválido
      document: 'invalid-document',
      email: 'invalid-email'
    };

    await request(app.getHttpServer())
      .post('/customers')
      .send(invalidCustomerData)
      .expect(400);
  });
});
