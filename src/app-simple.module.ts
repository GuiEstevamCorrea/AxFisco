import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Repositories
import { InMemoryCustomerRepository } from './infrastructure/repositories/in-memory-customer.repository';

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
  ],
  controllers: [AppController, CustomerController],
  providers: [
    AppService,
    // Repositories
    {
      provide: 'CustomerRepository',
      useClass: InMemoryCustomerRepository,
    },
    // Use Cases
    CreateCustomerUseCase,
  ],
})
export class AppModule {}
