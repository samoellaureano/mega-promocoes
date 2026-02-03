#!/bin/bash

# Script de inicialização da Plataforma de Promoções PromoFire

echo "🚀 Inicializando PromoFire - Plataforma de Promoções"
echo "=================================================="

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js 18+ primeiro."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt "18" ]; then
    echo "❌ Node.js versão 18+ é necessário. Versão atual: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) encontrado"

# Verificar se o PostgreSQL está rodando (opcional)
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL encontrado"
else
    echo "⚠️  PostgreSQL não encontrado. Certifique-se de que está instalado e rodando."
fi

echo ""
echo "📦 Instalando dependências do Backend..."
cd backend

# Copiar arquivo de configuração
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Arquivo .env criado. CONFIGURE suas variáveis de ambiente!"
else
    echo "✅ Arquivo .env já existe"
fi

# Instalar dependências do backend
npm install

echo ""
echo "🗄️  Configurando banco de dados..."

# Executar migrações se o banco estiver configurado
if grep -q "postgresql://" .env 2>/dev/null; then
    echo "📊 Executando migrações do banco..."
    npx prisma migrate dev --name init
    npx prisma generate
    echo "✅ Banco de dados configurado"
else
    echo "⚠️  Configure DATABASE_URL no arquivo .env antes de executar as migrações"
fi

echo ""
echo "📦 Instalando dependências do Frontend..."
cd ../frontend
npm install

echo ""
echo "🎉 Instalação concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure o arquivo backend/.env com suas credenciais"
echo "2. Execute 'npm run dev' na pasta backend"
echo "3. Execute 'npm run dev' na pasta frontend (em outro terminal)"
echo "4. Acesse http://localhost:3000 para a interface pública"
echo "5. Acesse http://localhost:3000/admin para o painel administrativo"
echo ""
echo "🔧 Configurações importantes:"
echo "- DATABASE_URL: String de conexão PostgreSQL"
echo "- TWILIO_*: Credenciais para WhatsApp"
echo "- OPENAI_API_KEY: Chave da API OpenAI para IA"
echo ""
echo "📖 Leia o README.md para instruções detalhadas"
echo ""
echo "🔥 PromoFire está pronto para capturar as melhores ofertas! 💰"