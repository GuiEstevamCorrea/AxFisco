import { DataSource } from 'typeorm';
import { CompanyEntity } from './entities/company.entity';
import { CustomerEntity } from './entities/customer.entity';
import { ProductEntity } from './entities/product.entity';
import { NFeEntity } from './entities/nfe.entity';
import { NFSeEntity } from './entities/nfse.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || 'axfisco',
  password: process.env.DATABASE_PASSWORD || 'axfisco123',
  database: process.env.DATABASE_NAME || 'axfisco_db',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [
    CompanyEntity,
    CustomerEntity,
    ProductEntity,
    NFeEntity,
    NFSeEntity,
  ],
  migrations: ['src/infrastructure/database/migrations/*.ts'],
  subscribers: ['src/infrastructure/database/subscribers/*.ts'],
});
