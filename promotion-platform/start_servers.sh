#!/bin/bash

echo "🚀 Iniciando MegaPromoções Brasil 2026"
echo "======================================"

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 não encontrado. Por favor, instale o Python 3.6+"
    exit 1
fi

# Ir para o diretório do projeto
cd "$(dirname "$0")"

echo "📁 Diretório atual: $(pwd)"

# Criar diretório backend se não existir
mkdir -p backend

# Verificar se o arquivo do backend existe
if [ ! -f "backend/config_server.py" ]; then
    echo "❌ Arquivo backend/config_server.py não encontrado"
    exit 1
fi

echo "🌐 Iniciando servidor frontend na porta 8080..."
echo "🔧 Iniciando servidor backend na porta 3001..."
echo ""
echo "URLs disponíveis:"
echo "  Frontend: http://localhost:8080"
echo "  Admin:    http://localhost:8080/admin-login.html"
echo "  Backend:  http://localhost:3001/api/health"
echo ""

# Função para encerrar processos ao receber Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Encerrando servidores..."
    kill $FRONTEND_PID $BACKEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT

# Iniciar servidor frontend em background
cd frontend
python3 -m http.server 8080 &
FRONTEND_PID=$!
cd ..

# Iniciar servidor backend em background
cd backend
python3 config_server.py &
BACKEND_PID=$!
cd ..

echo "✅ Servidores iniciados!"
echo "   Frontend PID: $FRONTEND_PID"
echo "   Backend PID: $BACKEND_PID"
echo ""
echo "💡 Pressione Ctrl+C para encerrar ambos os servidores"
echo ""

# Aguardar até Ctrl+C
wait