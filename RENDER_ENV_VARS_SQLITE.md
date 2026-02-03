# 🚀 Variáveis de Ambiente - SQLite (100% Gratuito)

## 📋 CONFIGURAÇÃO OBRIGATÓRIA (SQLite)

```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=file:./production.db
JWT_SECRET=a6d136d9286533cfbadffeedad8ef6704a82dc248ed994cf0c4cc7c7649b53ad
ENCRYPTION_KEY=3f7c85d0b4a9583d2c1e47a8f6b95d3c8e2a0f91c7e4d8b6a5c3e9f2d7b1a4c6
DEFAULT_ADMIN_EMAIL=admin@megapromocoes.com
DEFAULT_ADMIN_PASSWORD=MegaPromocoes2026!
```

## 📋 CONFIGURAÇÃO OPCIONAL

```bash
# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# IA (OpenAI)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Rate Limiting & Scraping
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
SCRAPING_DELAY=2000
SCRAPING_TIMEOUT=30000
SCRAPING_USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
```

## 🎯 Configuração do Render (SQLite)

### **Build Command:**
```bash
cd backend && npm install && npm run build && npx prisma generate && npx prisma migrate deploy
```

### **Start Command:**
```bash
cd backend && npm start
```

### **Root Directory:**
```
promotion-platform
```

## ✅ Vantagens SQLite em Produção

- 🆓 **100% Gratuito** (sem custos externos)
- ⚡ **Muito rápido** para reads
- 🔒 **Dados ficam no servidor** (mais privacidade)
- 🛠️ **Zero configuração** externa
- 📁 **Backup simples** (apenas um arquivo)

## ⚠️ Limitações SQLite

- 📊 **Até ~1M registros** recomendado
- 🔀 **Writes sequenciais** (não paralelos)
- 🌐 **Um servidor apenas** (não distribuído)

**Para uma plataforma de promoções inicial, SQLite é perfeito!**