import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyRepository } from '@domain/repositories/company.repository';
import { Company, TaxRegime } from '@domain/entities/company.entity';
import { CompanyEntity } from '../database/entities/company.entity';
import { CNPJ } from '@domain/value-objects/cnpj.vo';
import { Address } from '@domain/value-objects/address.vo';

@Injectable()
export class TypeOrmCompanyRepository implements CompanyRepository {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly repository: Repository<CompanyEntity>,
  ) {}

  async save(company: Company): Promise<Company> {
    const entity = this.toEntity(company);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Company | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCnpj(cnpj: string): Promise<Company | null> {
    const entity = await this.repository.findOne({ where: { cnpj } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<Company[]> {
    const entities = await this.repository.find();
    return entities.map(entity => this.toDomain(entity));
  }

  async update(company: Company): Promise<Company> {
    const entity = this.toEntity(company);
    const updated = await this.repository.save(entity);
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toEntity(company: Company): CompanyEntity {
    const entity = new CompanyEntity();
    entity.id = company.id;
    entity.corporateName = company.corporateName;
    entity.tradeName = company.tradeName;
    entity.cnpj = company.cnpj.value;
    entity.stateRegistration = company.stateRegistration;
    entity.municipalRegistration = company.municipalRegistration;
    entity.email = company.email;
    entity.phone = company.phone;
    entity.taxRegime = company.taxRegime;
    entity.street = company.address.street;
    entity.number = company.address.number;
    entity.complement = company.address.complement;
    entity.neighborhood = company.address.neighborhood;
    entity.city = company.address.city;
    entity.state = company.address.state;
    entity.zipCode = company.address.zipCode;
    entity.country = company.address.country;
    entity.isActive = company.isActive;
    entity.createdAt = company.createdAt;
    entity.updatedAt = company.updatedAt;
    return entity;
  }

  private toDomain(entity: CompanyEntity): Company {
    const cnpj = new CNPJ(entity.cnpj);
    const address = new Address(
      entity.street,
      entity.number,
      entity.complement || '',
      entity.neighborhood,
      entity.city,
      entity.state,
      entity.zipCode,
      entity.country,
    );

    const company = new Company(
      entity.corporateName,
      entity.tradeName,
      cnpj,
      entity.stateRegistration,
      address,
      entity.email,
      entity.phone,
      entity.taxRegime as TaxRegime,
      entity.municipalRegistration,
      entity.id,
    );

    if (!entity.isActive) {
      company.deactivate();
    }

    return company;
  }
}
