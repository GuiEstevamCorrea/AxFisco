export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME || 'axfisco',
    password: process.env.DATABASE_PASSWORD || 'axfisco123',
    name: process.env.DATABASE_NAME || 'axfisco_db',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672',
  },
  sefaz: {
    environment: process.env.SEFAZ_ENVIRONMENT || 'homologacao',
    certificatePath: process.env.SEFAZ_CERTIFICATE_PATH,
    certificatePassword: process.env.SEFAZ_CERTIFICATE_PASSWORD,
  },
  nfse: {
    environment: process.env.NFSE_ENVIRONMENT || 'homologacao',
    municipalCode: process.env.MUNICIPAL_CODE || '3550308', // São Paulo
  },
});
