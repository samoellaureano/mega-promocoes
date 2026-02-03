# 🚀 Plataforma Inteligente de Promoções - PromoFire

Uma plataforma completa para captura, curadoria e divulgação automática de promoções com integração WhatsApp e IA.

## 🏗️ Arquitetura

- **Backend**: Node.js + TypeScript + Express + Prisma + PostgreSQL
- **Frontend**: Next.js 14 + React + TailwindCSS + TypeScript
- **IA**: OpenAI GPT para geração de textos carismáticos
- **WhatsApp**: Integração via Twilio
- **Scraping**: Cheerio + Playwright para captura automática
- **Database**: PostgreSQL com Prisma ORM

## 📁 Estrutura do Projeto

```
promotion-platform/
├── backend/
│   ├── src/
│   │   ├── routes/          # Rotas da API
│   │   ├── services/        # Lógica de negócio
│   │   ├── utils/           # Utilitários
│   │   └── server.ts        # Servidor principal
│   ├── prisma/
│   │   └── schema.prisma    # Schema do banco
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Páginas Next.js
│   │   ├── components/      # Componentes React
│   │   ├── contexts/        # Context API
│   │   └── lib/            # Bibliotecas
│   └── package.json
└── README.md
```

## 🚀 Instalação e Configuração

### 1. Pré-requisitos

- Node.js 18+ 
- PostgreSQL 12+
- npm ou yarn

### 2. Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Editar .env com suas configurações:
# - DATABASE_URL (PostgreSQL)
# - JWT_SECRET
# - TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN (WhatsApp)
# - OPENAI_API_KEY (IA)

# Executar migrações do banco
npx prisma migrate dev
npx prisma generate

# Iniciar servidor de desenvolvimento
npm run dev
```

### 3. Frontend

```bash
cd frontend

# Instalar dependências  
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

### 4. Configuração do Banco de Dados

Crie um banco PostgreSQL e configure a URL no arquivo `.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/promotion_platform"
```

## 🔧 Configurações Importantes

### 1. WhatsApp (Twilio)

1. Crie uma conta no [Twilio](https://www.twilio.com/)
2. Configure um número do WhatsApp Business
3. Adicione as credenciais no painel admin em Configurações

### 2. OpenAI

1. Obtenha uma API Key do [OpenAI](https://platform.openai.com/)
2. Configure no painel admin para habilitar geração automática de textos

### 3. Scraping Targets

Configure targets de scraping no painel admin com seletores CSS:

```json
{
  "container": ".product-item",
  "title": ".product-title",
  "originalPrice": ".original-price", 
  "promoPrice": ".promo-price",
  "image": ".product-image img",
  "link": "a.product-link"
}
```

## 🎯 Funcionalidades Principais

### 🔍 Captura Automática
- Scraping de múltiplas lojas online
- Execução via cron jobs (a cada 2 horas)
- Validação de descontos mínimos
- Detecção de duplicatas

### 🧠 Inteligência Artificial
- Geração de textos carismáticos e engraçados
- Cálculo de score de relevância (0-100)
- Detecção de promoções suspeitas/falsas
- Categorização automática

### 📱 WhatsApp Automático
- Envio automático para listas de contatos
- Templates personalizáveis
- Controle de horários e limites
- Estatísticas de entrega e cliques

### 🖥️ Painel Administrativo
- Dashboard com métricas em tempo real
- Aprovação/reprovação de promoções
- Configurações dinâmicas
- Gerenciamento de scraping targets
- Relatórios de performance

### 🌐 Interface Pública
- Página inicial com promoções em destaque
- Filtros por categoria, loja, desconto
- Sistema de busca inteligente
- Design responsivo e moderno

## 📊 Recursos do Painel Admin

### Dashboard
- Estatísticas gerais da plataforma
- Gráficos de categorias e performance
- Top promoções por desconto
- Status de entregas WhatsApp

### Gerenciamento de Promoções
- Lista com filtros avançados
- Aprovação em massa
- Regeneração de textos com IA
- Análise de suspeitas

### Configurações
- Integração WhatsApp (Twilio)
- Configuração OpenAI
- Templates de mensagens
- Horários de envio
- Limites diários

### Scraping
- Gerenciar targets de coleta
- Testar seletores CSS
- Executar scraping manual
- Monitorar performance

## 🚦 Como Usar

### 1. Primeiro Acesso
1. Execute o backend e frontend
2. Acesse `http://localhost:3000/admin/login`
3. Crie o primeiro usuário admin
4. Configure as integrações necessárias

### 2. Configurar Scraping
1. Acesse **Admin > Scraping**
2. Adicione targets das lojas desejadas
3. Configure seletores CSS para cada elemento
4. Teste os seletores antes de ativar

### 3. Configurar WhatsApp
1. Acesse **Admin > Configurações**
2. Configure credenciais do Twilio
3. Defina números de destino
4. Configurar horários e limites

### 4. Ativar IA
1. Configure API Key da OpenAI
2. Ajuste parâmetros de geração
3. Teste a geração de textos

## 📈 Fluxo de Funcionamento

1. **Scraping** coleta promoções automaticamente
2. **IA** analisa, pontua e gera textos carismáticos
3. **Sistema** filtra apenas promoções válidas (>20% desconto)
4. **Admin** pode aprovar/reprovar manualmente
5. **WhatsApp** envia promoções aprovadas automaticamente
6. **Usuários** acessam site público para navegar

## 🔐 Segurança

- Autenticação JWT
- Rate limiting nas APIs
- Criptografia de dados sensíveis
- Validação de entrada
- Sanitização de dados de scraping

## 📱 Responsividade

- Design mobile-first
- Interface otimizada para todos os dispositivos
- Painel admin responsivo
- Performance otimizada

## 🎨 Design e UX

- Interface moderna com gradientes
- Animações suaves
- Feedback visual para todas as ações
- Tema consistente em toda aplicação
- Emojis e elementos visuais atraentes

## 🔄 Manutenção

### Backup
- Configure backup automático do banco
- Exporte configurações regularmente
- Monitore logs de erro

### Monitoramento
- Dashboard com métricas em tempo real
- Alertas para falhas de scraping
- Estatísticas de performance do WhatsApp

## 🆘 Suporte

Para problemas ou dúvidas:

1. Verifique logs do backend (`console.log`)
2. Teste conexões no painel de configurações
3. Monitore dashboard para detectar problemas
4. Verifique limites de API (Twilio/OpenAI)

## 📄 Licença

Este projeto é privado e proprietário. Todos os direitos reservados.

---

**Desenvolvido com ❤️ para maximizar suas economias!** 🔥💰