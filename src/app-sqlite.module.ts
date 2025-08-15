import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Infrastructure
import { CompanyEntity } from './infrastructure/database/entities/company.entity';
import { CustomerEntity } from './infrastructure/database/entities/customer.entity';
import { ProductEntity } from './infrastructure/database/entities/product.entity';
import { NFeEntity } from './infrastructure/database/entities/nfe.entity';
import { NFSeEntity } from './infrastructure/database/entities/nfse.entity';

// Repositories
import { CompanyRepository } from './domain/repositories/company.repository';
import { CustomerRepository } from './domain/repositories/customer.repository';
import { ProductRepository } from './domain/repositories/product.repository';
import { NFeRepository } from './domain/repositories/nfe.repository';
import { NFSeRepository } from './domain/repositories/nfse.repository';

import { TypeOrmCompanyRepository } from './infrastructure/repositories/typeorm-company.repository';
import { TypeOrmCustomerRepository } from './infrastructure/repositories/typeorm-customer.repository';

// Use Cases
import { CreateCustomerUseCase } from './application/use-cases/create-customer.use-case';

// Controllers
import { CustomerController } from './presentation/controllers/customer.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [CompanyEntity, CustomerEntity, ProductEntity, NFeEntity, NFSeEntity],
      synchronize: true,
      logging: false,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([
      CompanyEntity,
      CustomerEntity,
      ProductEntity,
      NFeEntity,
      NFSeEntity,
    ]),
  ],
  controllers: [AppController, CustomerController],
  providers: [
    AppService,
    // Repositories
    {
      provide: 'CompanyRepository',
      useClass: TypeOrmCompanyRepository,
    },
    {
      provide: 'CustomerRepository',
      useClass: TypeOrmCustomerRepository,
    },
    // Use Cases
    CreateCustomerUseCase,
  ],
})
export class AppSqliteModule {}
