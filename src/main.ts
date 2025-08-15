import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AxFisco API')
    .setDescription('Sistema de emissão de NF-e e NFS-e seguindo DDD e Clean Architecture')
    .setVersion('1.0.0')
    .addTag('health', 'Health check endpoints')
    .addTag('companies', 'Empresas')
    .addTag('customers', 'Clientes')
    .addTag('products', 'Produtos e Serviços')
    .addTag('nfe', 'Notas Fiscais Eletrônicas')
    .addTag('nfse', 'Notas Fiscais de Serviços Eletrônicas')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 AxFisco API is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
