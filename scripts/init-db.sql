-- Script de inicialização do banco de dados AxFisco

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Comentários das tabelas principais
COMMENT ON DATABASE axfisco_db IS 'Banco de dados do sistema AxFisco para emissão de NF-e e NFS-e';

-- Criar schema específico se necessário
-- CREATE SCHEMA IF NOT EXISTS axfisco;

-- Função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Índices que serão criados após as tabelas
-- Estes comandos podem ser executados após a criação das tabelas pelo TypeORM

-- Para companies
-- CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON companies(cnpj);
-- CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active);

-- Para customers  
-- CREATE INDEX IF NOT EXISTS idx_customers_document ON customers(document);
-- CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
-- CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active);

-- Para products
-- CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
-- CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- Para nfe_documents
-- CREATE INDEX IF NOT EXISTS idx_nfe_access_key ON nfe_documents(access_key);
-- CREATE INDEX IF NOT EXISTS idx_nfe_status ON nfe_documents(status);
-- CREATE INDEX IF NOT EXISTS idx_nfe_company ON nfe_documents(company_id);
-- CREATE INDEX IF NOT EXISTS idx_nfe_customer ON nfe_documents(customer_id);
-- CREATE INDEX IF NOT EXISTS idx_nfe_issue_date ON nfe_documents(issue_date);

-- Para nfse_documents
-- CREATE INDEX IF NOT EXISTS idx_nfse_number ON nfse_documents(number);
-- CREATE INDEX IF NOT EXISTS idx_nfse_rps ON nfse_documents(rps_number, rps_series);
-- CREATE INDEX IF NOT EXISTS idx_nfse_status ON nfse_documents(status);
-- CREATE INDEX IF NOT EXISTS idx_nfse_company ON nfse_documents(company_id);
-- CREATE INDEX IF NOT EXISTS idx_nfse_customer ON nfse_documents(customer_id);
-- CREATE INDEX IF NOT EXISTS idx_nfse_competence_date ON nfse_documents(competence_date);
