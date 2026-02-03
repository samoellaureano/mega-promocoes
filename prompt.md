# 🚀 Plataforma Inteligente de Captura e Divulgação de Promoções

## 🎯 Objetivo do Projeto
Criar uma plataforma própria inspirada em sites de curadoria de ofertas (ex.: Desconto no Preço), focada em:
- Captura automatizada e inteligente de promoções
- Validação de descontos reais
- Curadoria automática e/ou manual
- Disparo automático de promoções em canais de divulgação no WhatsApp
- Interface web moderna para consulta, filtros e gestão

Stack principal:
- **Backend:** Node.js
- **Frontend:** Next.js
- **IA:** classificação e enriquecimento de promoções

---

## 🧩 Funcionalidades Consolidadas

### 🔎 Captura de Promoções
- Scraping automatizado de marketplaces e lojas online
- Integração com APIs públicas (quando disponíveis)
- Coleta de:
  - Título do produto
  - Preço original
  - Preço promocional
  - Percentual de desconto
  - Link do produto (afiliado)
  - Imagem
  - Loja/origem
- Execução periódica via agendador (cron)

### 🧠 Inteligência de Promoções
- Validação de desconto mínimo (ex.: >= 20%)
- Detecção de promoções duplicadas
- Comparação com histórico de preços
- Classificação de relevância (score 0–100)
- Identificação de possível “promoção falsa”

### 📣 Disparo Automático (WhatsApp)
- Envio automático de promoções aprovadas
- Templates padronizados de mensagem
- Integração com API de WhatsApp (Twilio, Gupshup ou similar)
- Controle de:
  - Horários de envio
  - Limite diário de mensagens
  - Grupos/canais de destino

### 🖥️ Interface Web (Next.js)
- Página inicial com promoções em destaque
- Busca inteligente
- Filtros:
  - Categoria
  - Loja
  - Percentual mínimo de desconto
- Ordenação por maior desconto / relevância
- Página de detalhes da promoção

### 🛠️ Painel Administrativo
- Dashboard com métricas
- Lista de promoções capturadas
- Aprovação/reprovação manual
- Logs de envio
- Estatísticas de cliques

---

## 🏗️ Arquitetura e Tecnologias

### Backend (Node.js)
- Node.js + TypeScript
- Express ou Fastify
- Prisma ORM
- PostgreSQL ou MySQL
- Axios (requisições HTTP)
- Cheerio / Playwright (scraping)
- node-cron (agendamentos)

### Frontend (Next.js)
- Next.js 14+
- App Router
- React Server Components
- Tailwind CSS
- Fetch / Axios

### Integrações Externas
- WhatsApp API (Twilio / Gupshup)
- APIs de marketplaces (quando disponíveis)

### IA / Automação
- Classificação de ofertas
- Geração de descrições atrativas
- Score de relevância

---

## 📦 Estrutura de Dados (Exemplo)

```ts
Promotion {
  id: string
  title: string
  description: string
  originalPrice: number
  promoPrice: number
  discountPercent: number
  store: string
  category: string
  imageUrl: string
  productUrl: string
  relevanceScore: number
  isValid: boolean
  createdAt: Date
}
```

---

## 🤖 PROMPT ÚNICO – Desenvolvimento Assistido por IA

Use o prompt abaixo para gerar código, arquitetura e automações do projeto:

```
Você é um arquiteto de software e desenvolvedor sênior.
Crie uma plataforma completa de captura e divulgação inteligente de promoções usando Node.js no backend e Next.js no frontend.

Requisitos principais:

1) Backend (Node.js + TypeScript)
- API REST
- Rota para captura automática de promoções via scraping e APIs
- Armazenar promoções em banco PostgreSQL usando Prisma
- Validar promoções com desconto mínimo de 20%
- Evitar duplicidade
- Classificar promoções usando IA (score de relevância 0–100)

2) Scraping
- Usar Axios + Cheerio ou Playwright
- Extrair título, preços, desconto, imagem e link
- Executar via cron job

3) IA
- Avaliar se a promoção é real ou falsa
- Gerar score de relevância
- Sugerir texto curto e atrativo para WhatsApp

4) WhatsApp
- Integração com API (Twilio ou Gupshup)
- Enviar mensagens automáticas com template:
  "🔥 Promoção: {titulo}\n💰 De {preço original} por {preço promo}\n👉 {link}"

5) Frontend (Next.js)
- Página inicial com promoções
- Busca com filtros (categoria, loja, desconto mínimo)
- Ordenação por maior desconto
- Página de detalhes da promoção

6) Painel Admin
- Listar promoções capturadas
- Aprovar ou reprovar promoções
- Ver métricas de envio

Entregue:
- Estrutura de pastas
- Principais arquivos de código
- Exemplos de rotas
- Boas práticas de segurança e escalabilidade
```

---

## ⚠️ Considerações Importantes
- Conformidade com LGPD
- Evitar spam no WhatsApp
- Usar links de afiliado corretamente
- Manter transparência com usuários

---

## ✅ Resultado Esperado
Uma plataforma escalável, automatizada e inteligente para captura de promoções e divulgação em canais de WhatsApp, pronta para monetização via afiliados.
