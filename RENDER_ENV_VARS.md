# 🚀 Variáveis de Ambiente para o Render

Configure estas variáveis na aba **Environment** do seu service no Render:

## ⚙️ Configuração Básica

```bash
# Ambiente de produção
NODE_ENV=production

# Porta (o Render define automaticamente, mas pode especificar)
PORT=10000
```

## 🗄️ Banco de Dados MongoDB

```bash
# Substitua pela sua connection string do MongoDB Atlas
# Formato: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/promotion_platform?retryWrites=true&w=majority
DATABASE_URL=mongodb+srv://SEU_USUARIO:SUA_SENHA@cluster0.xxxxx.mongodb.net/promotion_platform?retryWrites=true&w=majority
```

## 🔐 Segurança e Autenticação

```bash
# JWT - Chaves já geradas e seguras
JWT_SECRET=a6d136d9286533cfbadffeedad8ef6704a82dc248ed994cf0c4cc7c7649b53ad

# Criptografia - Chave já gerada e segura
ENCRYPTION_KEY=3f7c85d0b4a9583d2c1e47a8f6b95d3c8e2a0f91c7e4d8b6a5c3e9f2d7b1a4c6
```

## 📱 WhatsApp (Twilio)

```bash
# Obtenha estes valores no dashboard do Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

## 🤖 OpenAI (IA para geração de textos)

```bash
# Obtenha no dashboard da OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🛡️ Rate Limiting

```bash
# Janela de tempo para rate limiting (minutos)
RATE_LIMIT_WINDOW=15

# Máximo de requests por janela
RATE_LIMIT_MAX_REQUESTS=100
```

## 🕷️ Web Scraping

```bash
# Delay entre requests de scraping (milissegundos)
SCRAPING_DELAY=2000

# Timeout para requests (milissegundos)
SCRAPING_TIMEOUT=30000

# User Agent para requests
SCRAPING_USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36
```

## 👤 Admin Padrão

```bash
# Email do admin padrão
DEFAULT_ADMIN_EMAIL=admin@megapromocoes.com

# Senha do admin padrão (mude após primeiro login)
DEFAULT_ADMIN_PASSWORD=MegaPromocoes2026!
```

---

## 📋 Checklist de Configuração

### 1. **MongoDB Atlas** (Obrigatório)
- [ ] Criar conta no [MongoDB Atlas](https://www.mongodb.com/atlas)
- [ ] Criar cluster gratuito (M0 Sandbox)
- [ ] Criar usuário do banco
- [ ] Adicionar `0.0.0.0/0` no Network Access
- [ ] Copiar connection string e configurar `DATABASE_URL`

### 2. **Twilio WhatsApp** (Opcional - para enviar mensagens)
- [ ] Criar conta no [Twilio](https://www.twilio.com)
- [ ] Configurar WhatsApp Business API
- [ ] Obter `TWILIO_ACCOUNT_SID` e `TWILIO_AUTH_TOKEN`
- [ ] Configurar número WhatsApp (`TWILIO_WHATSAPP_FROM`)

### 3. **OpenAI** (Opcional - para IA)
- [ ] Criar conta na [OpenAI](https://platform.openai.com)
- [ ] Gerar API Key
- [ ] Configurar `OPENAI_API_KEY`

### 4. **Configuração no Render**
- [ ] Copiar e colar todas as variáveis acima na aba Environment
- [ ] Verificar se `DATABASE_URL` está correto
- [ ] Salvar e fazer novo deploy

---

## 🔗 Links Úteis

- **MongoDB Atlas**: https://www.mongodb.com/atlas
- **Twilio Console**: https://console.twilio.com
- **OpenAI Platform**: https://platform.openai.com
- **Render Dashboard**: https://dashboard.render.com

---

## ⚠️ Importante

1. **Nunca commitar essas variáveis no código**
2. **DATABASE_URL é obrigatório** - sem ele o app não inicia
3. **JWT_SECRET e ENCRYPTION_KEY** já estão configurados com valores seguros
4. **DEFAULT_ADMIN_PASSWORD** - mude após primeiro login por segurança

---

## 🚀 Ordem de Configuração Recomendada

1. Configure **MongoDB Atlas** primeiro
2. Adicione `DATABASE_URL` no Render
3. Adicione as variáveis de **segurança** (JWT_SECRET, ENCRYPTION_KEY)
4. Configure **admin padrão**
5. Faça deploy e teste o login
6. Configure **Twilio** e **OpenAI** conforme necessário