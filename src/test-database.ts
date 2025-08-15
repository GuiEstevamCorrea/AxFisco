import { NestFactory } from '@nestjs/core';
import { AppSqliteModule } from './app-sqlite.module';
import { CustomerEntity } from './infrastructure/database/entities/customer.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

async function testDatabase() {
  console.log('🚀 Iniciando teste de banco de dados...');
  
  const app = await NestFactory.create(AppSqliteModule);
  
  try {
    const customerRepository = app.get<Repository<CustomerEntity>>(
      getRepositoryToken(CustomerEntity),
    );

    console.log('✅ Aplicação iniciada com sucesso!');
    console.log('✅ Conexão com banco SQLite estabelecida!');

    // Criar um customer de teste
    const testCustomer = customerRepository.create({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'João Silva de Teste',
      document: '123.456.789-10',
      documentType: 'CPF',
      customerType: 'PF',
      email: 'joao@teste.com',
      phone: '11999999999',
      street: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      country: 'Brasil',
      isActive: true
    });

    const savedCustomer = await customerRepository.save(testCustomer);
    console.log('✅ Customer criado:', {
      id: savedCustomer.id,
      name: savedCustomer.name,
      document: savedCustomer.document,
      email: savedCustomer.email
    });

    // Buscar todos os customers
    const allCustomers = await customerRepository.find();
    console.log(`✅ Total de customers no banco: ${allCustomers.length}`);

    // Buscar customer específico
    const foundCustomer = await customerRepository.findOne({
      where: { document: '123.456.789-10' }
    });

    if (foundCustomer) {
      console.log('✅ Customer encontrado pela busca:', foundCustomer.name);
    }

    // Atualizar customer
    foundCustomer.name = 'João Silva Atualizado';
    const updatedCustomer = await customerRepository.save(foundCustomer);
    console.log('✅ Customer atualizado:', updatedCustomer.name);

    // Criar um segundo customer
    const testCustomer2 = customerRepository.create({
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Maria Santos',
      document: '987.654.321-00',
      documentType: 'CPF',
      customerType: 'PF',
      email: 'maria@teste.com',
      phone: '11888888888',
      isActive: true
    });

    await customerRepository.save(testCustomer2);
    console.log('✅ Segundo customer criado: Maria Santos');

    // Listar todos novamente
    const finalCustomers = await customerRepository.find();
    console.log(`✅ Total final de customers: ${finalCustomers.length}`);
    
    finalCustomers.forEach((customer, index) => {
      console.log(`   ${index + 1}. ${customer.name} (${customer.document}) - ${customer.email}`);
    });

    console.log('\n🎉 Todos os testes de banco de dados passaram!');
    console.log('✅ CREATE (inserir) - OK');
    console.log('✅ READ (consultar) - OK');
    console.log('✅ UPDATE (atualizar) - OK');
    console.log('✅ LIST (listar todos) - OK');
    console.log('\n📊 Resumo:');
    console.log('- Banco de dados: SQLite (em memória)');
    console.log('- ORM: TypeORM');
    console.log('- Framework: NestJS');
    console.log('- Arquitetura: DDD/Clean Architecture');
    console.log('- Padrão: Repository Pattern');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await app.close();
    console.log('✅ Aplicação finalizada');
  }
}

testDatabase().catch(console.error);
