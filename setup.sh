#!/bin/bash

# Script para configuração inicial do projeto AxFisco

echo "🚀 Configurando projeto AxFisco..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
    echo "✅ Arquivo .env criado. Configure as variáveis conforme necessário."
else
    echo "✅ Arquivo .env já existe."
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Iniciar containers Docker
echo "🐳 Iniciando containers Docker..."
docker-compose -f docker-compose.dev.yml up -d

# Aguardar containers estarem prontos
echo "⏳ Aguardando containers estarem prontos..."
sleep 30

# Executar migrações
echo "🗄️ Executando migrações do banco de dados..."
npm run migration:run

echo "✅ Configuração concluída!"
echo ""
echo "🌐 Serviços disponíveis:"
echo "  - API: http://localhost:3000"
echo "  - Swagger: http://localhost:3000/api/docs"
echo "  - PgAdmin: http://localhost:5050"
echo "  - RabbitMQ Management: http://localhost:15672"
echo ""
echo "🚀 Para iniciar o desenvolvimento:"
echo "  npm run start:dev"
