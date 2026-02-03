@echo off
echo 🚀 Iniciando MegaPromoções Brasil 2026
echo ======================================

REM Verificar se Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python não encontrado. Por favor, instale o Python 3.6+
    pause
    exit /b 1
)

REM Ir para o diretório do script
cd /d "%~dp0"

echo 📁 Diretório atual: %cd%

REM Criar diretório backend se não existir
if not exist "backend" mkdir backend

REM Verificar se o arquivo do backend existe
if not exist "backend\config_server.py" (
    echo ❌ Arquivo backend\config_server.py não encontrado
    pause
    exit /b 1
)

echo.
echo 🌐 Iniciando servidor frontend na porta 8080...
echo 🔧 Iniciando servidor backend na porta 3001...
echo.
echo URLs disponíveis:
echo   Frontend: http://localhost:8080
echo   Admin:    http://localhost:8080/admin-login.html
echo   Backend:  http://localhost:3001/api/health
echo.

REM Iniciar servidor frontend
start /min "Frontend Server" cmd /c "cd frontend && python -m http.server 8080"

REM Aguardar um pouco
timeout /t 2 /nobreak >nul

REM Iniciar servidor backend
start /min "Backend Server" cmd /c "cd backend && python config_server.py"

echo ✅ Servidores iniciados em janelas separadas!
echo.
echo 💡 Para encerrar: feche as janelas dos servidores
echo 📁 Arquivo de configuração: backend\megapromocoes_config.json
echo.
echo 🌐 Abrindo navegador...

REM Aguardar servidores iniciarem
timeout /t 3 /nobreak >nul

REM Abrir navegador
start http://localhost:8080/admin-settings.html

pause