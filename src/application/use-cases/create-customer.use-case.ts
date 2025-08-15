import { Injectable, Inject } from '@nestjs/common';
import { UseCase } from '../ports/use-case.interface';
import { CustomerRepository } from '@domain/repositories/customer.repository';
import { Customer, CustomerType, IndicadorIE } from '@domain/entities/customer.entity';
import { CNPJ } from '@domain/value-objects/cnpj.vo';
import { CPF } from '@domain/value-objects/cpf.vo';
import { Address } from '@domain/value-objects/address.vo';
import { CreateCustomerDto } from '../dtos/customer.dto';

@Injectable()
export class CreateCustomerUseCase implements UseCase<CreateCustomerDto, Customer> {
  constructor(
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository
  ) {}

  async execute(input: CreateCustomerDto): Promise<Customer> {
    // Verificar se já existe cliente com o mesmo documento
    const existingCustomer = await this.customerRepository.findByDocument(input.document);
    if (existingCustomer) {
      throw new Error('Já existe um cliente cadastrado com este documento');
    }

    // Verificar se já existe cliente com o mesmo email
    const existingEmail = await this.customerRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new Error('Já existe um cliente cadastrado com este email');
    }

    // Criar value object do documento
    const document = input.customerType === CustomerType.LEGAL_ENTITY
      ? new CNPJ(input.document)
      : new CPF(input.document);

    // Criar endereço se fornecido
    let address: Address | undefined;
    if (input.street && input.number && input.neighborhood && input.city && input.state && input.zipCode) {
      address = new Address(
        input.street,
        input.number,
        input.complement || '',
        input.neighborhood,
        input.city,
        input.state,
        input.zipCode,
      );
    }

    // Criar cliente
    const customer = new Customer(
      input.name,
      input.email,
      document,
      input.customerType,
      input.customerType === CustomerType.LEGAL_ENTITY ? IndicadorIE.CONTRIBUINTE : IndicadorIE.NAO_CONTRIBUINTE,
      input.phone,
      address,
      input.stateRegistration,
    );

    // Salvar no repositório
    return await this.customerRepository.save(customer);
  }
}
