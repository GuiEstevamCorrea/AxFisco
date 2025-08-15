# AxFisco - Sistema de Emissão de NF-e e NFS-e

Sistema desenvolvido em NestJS seguindo os princípios de Domain-Driven Design (DDD) e Clean Architecture para emissão de Notas Fiscais Eletrônicas (NF-e) e Notas Fiscais de Serviços Eletrônicas (NFS-e).

## 🏗️ Arquitetura

O projeto segue uma arquitetura em camadas baseada em DDD e Clean Architecture:

```
src/
├── domain/                     # Camada de Domínio
│   ├── entities/              # Entidades de negócio
│   ├── value-objects/         # Objetos de valor
│   ├── repositories/          # Interfaces dos repositórios
│   └── services/              # Serviços de domínio
├── application/               # Camada de Aplicação
│   ├── use-cases/            # Casos de uso
│   ├── dtos/                 # Data Transfer Objects
│   └── ports/                # Interfaces/Portas
├── infrastructure/           # Camada de Infraestrutura
│   ├── database/             # Configurações de banco
│   ├── repositories/         # Implementações dos repositórios
│   ├── messaging/            # Mensageria (RabbitMQ)
│   └── external-services/    # Serviços externos (SEFAZ, NFS-e)
└── presentation/             # Camada de Apresentação
    ├── controllers/          # Controllers REST
    └── middlewares/          # Middlewares
```

## 🚀 Tecnologias

- **Framework**: NestJS
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL
- **ORM**: TypeORM
- **Cache**: Redis
- **Mensageria**: RabbitMQ
- **Documentação**: Swagger/OpenAPI
- **Testes**: Jest
- **Containerização**: Docker

## 📋 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- Git

## 🔧 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <repository-url>
cd AxFisco
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 4. Execute com Docker Compose
```bash
# Desenvolvimento
docker-compose -f docker-compose.dev.yml up -d

# Produção
docker-compose up -d
```

### 5. Execute as migrações
```bash
npm run migration:run
```

## 🏃‍♂️ Executando a aplicação

### Desenvolvimento
```bash
# Watch mode
npm run start:dev

# Debug mode
npm run start:debug
```

### Produção
```bash
npm run build
npm run start:prod
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes com watch mode
npm run test:watch

# Testes com coverage
npm run test:cov

# Testes e2e
npm run test:e2e
```

## 📚 API Documentation

Após executar a aplicação, a documentação da API estará disponível em:
- **Swagger UI**: http://localhost:3000/api/docs

## 🌐 Endpoints Principais

### Health Check
- `GET /` - Status da aplicação
- `GET /health` - Health check detalhado

### Empresas
- `POST /api/v1/companies` - Criar empresa
- `GET /api/v1/companies` - Listar empresas
- `GET /api/v1/companies/:id` - Buscar empresa
- `PUT /api/v1/companies/:id` - Atualizar empresa

### Clientes
- `POST /api/v1/customers` - Criar cliente
- `GET /api/v1/customers` - Listar clientes
- `GET /api/v1/customers/:id` - Buscar cliente
- `PUT /api/v1/customers/:id` - Atualizar cliente

### Produtos
- `POST /api/v1/products` - Criar produto
- `GET /api/v1/products` - Listar produtos
- `GET /api/v1/products/:id` - Buscar produto
- `PUT /api/v1/products/:id` - Atualizar produto

### NF-e
- `POST /api/v1/nfe` - Criar NF-e
- `GET /api/v1/nfe` - Listar NF-e
- `GET /api/v1/nfe/:id` - Buscar NF-e
- `POST /api/v1/nfe/:id/authorize` - Autorizar NF-e
- `POST /api/v1/nfe/:id/cancel` - Cancelar NF-e

### NFS-e
- `POST /api/v1/nfse` - Criar NFS-e
- `GET /api/v1/nfse` - Listar NFS-e
- `GET /api/v1/nfse/:id` - Buscar NFS-e
- `POST /api/v1/nfse/:id/authorize` - Autorizar NFS-e
- `POST /api/v1/nfse/:id/cancel` - Cancelar NFS-e

## 🐳 Docker Services

O projeto inclui os seguintes serviços Docker:

- **app**: Aplicação NestJS
- **postgres**: Banco de dados PostgreSQL
- **redis**: Cache Redis
- **rabbitmq**: Message broker RabbitMQ
- **pgadmin**: Interface web para PostgreSQL

### Portas dos serviços:
- **API**: 3000
- **PostgreSQL**: 5432
- **Redis**: 6379
- **RabbitMQ**: 5672 (AMQP), 15672 (Management)
- **PgAdmin**: 5050

## 🗄️ Estrutura do Banco de Dados

### Principais tabelas:
- `companies` - Empresas emitentes
- `customers` - Clientes/destinatários
- `products` - Produtos e serviços
- `nfe_documents` - Notas Fiscais Eletrônicas
- `nfse_documents` - Notas Fiscais de Serviços

## 🔒 Certificados Digitais

Para integração com a SEFAZ, você precisará configurar os certificados digitais:

1. Coloque os certificados na pasta `certificates/`
2. Configure as variáveis de ambiente:
   ```
   SEFAZ_CERTIFICATE_PATH=certificates/certificado.pfx
   SEFAZ_CERTIFICATE_PASSWORD=sua_senha
   ```

## 🎯 Roadmap

- [ ] Implementação completa dos casos de uso
- [ ] Integração com SEFAZ para NF-e
- [ ] Integração com prefeituras para NFS-e
- [ ] Implementação de eventos de domínio
- [ ] Sistema de auditoria
- [ ] Dashboard administrativo
- [ ] API para consultas fiscais
- [ ] Relatórios e analytics

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **AxFisco Team** - *Desenvolvimento inicial*

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato com a equipe de desenvolvimento.
