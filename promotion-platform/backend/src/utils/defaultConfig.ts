import { PrismaClient } from '@prisma/client';

export async function initializeDefaultConfig(prisma: PrismaClient): Promise<void> {
  const defaultConfigs = [
    // Configurações gerais
    { key: 'APP_NAME', value: 'Plataforma de Promoções', type: 'string', category: 'general' },
    { key: 'APP_VERSION', value: '1.0.0', type: 'string', category: 'general' },
    { key: 'ADMIN_EMAIL', value: process.env.DEFAULT_ADMIN_EMAIL || 'admin@exemplo.com', type: 'email', category: 'general' },
    
    // Configurações de scraping
    { key: 'SCRAPING_ENABLED', value: 'true', type: 'boolean', category: 'scraping' },
    { key: 'SCRAPING_INTERVAL_HOURS', value: '2', type: 'number', category: 'scraping' },
    { key: 'MIN_DISCOUNT_PERCENT', value: '20', type: 'number', category: 'scraping' },
    { key: 'MAX_SCRAPING_PAGES', value: '5', type: 'number', category: 'scraping' },
    { key: 'SCRAPING_DELAY_MS', value: '2000', type: 'number', category: 'scraping' },
    { key: 'SCRAPING_TIMEOUT_MS', value: '30000', type: 'number', category: 'scraping' },
    
    // Configurações de WhatsApp
    { key: 'WHATSAPP_ENABLED', value: 'false', type: 'boolean', category: 'whatsapp' },
    { key: 'AUTO_SEND_ENABLED', value: 'false', type: 'boolean', category: 'whatsapp' },
    { key: 'MAX_DAILY_MESSAGES', value: '50', type: 'number', category: 'whatsapp' },
    { key: 'WHATSAPP_SEND_DELAY', value: '2000', type: 'number', category: 'whatsapp' },
    { key: 'WHATSAPP_CONTACTS', value: '', type: 'text', category: 'whatsapp' },
    { key: 'WHATSAPP_SEND_HOURS_START', value: '09:00', type: 'time', category: 'whatsapp' },
    { key: 'WHATSAPP_SEND_HOURS_END', value: '18:00', type: 'time', category: 'whatsapp' },
    
    // Configurações de IA
    { key: 'AI_ENABLED', value: 'false', type: 'boolean', category: 'ai' },
    { key: 'AI_MODEL', value: 'gpt-3.5-turbo', type: 'string', category: 'ai' },
    { key: 'AI_TEMPERATURE', value: '0.8', type: 'number', category: 'ai' },
    { key: 'AI_MAX_TOKENS', value: '150', type: 'number', category: 'ai' },
    { key: 'MIN_RELEVANCE_SCORE', value: '60', type: 'number', category: 'ai' },
    { key: 'AUTO_APPROVE_SCORE', value: '80', type: 'number', category: 'ai' },
    
    // Configurações de segurança
    { key: 'JWT_EXPIRY', value: '24h', type: 'string', category: 'security' },
    { key: 'BCRYPT_ROUNDS', value: '12', type: 'number', category: 'security' },
    { key: 'RATE_LIMIT_WINDOW_MINUTES', value: '15', type: 'number', category: 'security' },
    { key: 'RATE_LIMIT_MAX_REQUESTS', value: '100', type: 'number', category: 'security' },
    
    // Configurações de notificação
    { key: 'EMAIL_NOTIFICATIONS', value: 'false', type: 'boolean', category: 'notifications' },
    { key: 'WEBHOOK_ENABLED', value: 'false', type: 'boolean', category: 'notifications' },
    { key: 'WEBHOOK_URL', value: '', type: 'url', category: 'notifications' },
    
    // Configurações de backup
    { key: 'AUTO_BACKUP_ENABLED', value: 'true', type: 'boolean', category: 'backup' },
    { key: 'BACKUP_RETENTION_DAYS', value: '30', type: 'number', category: 'backup' },
    { key: 'BACKUP_FREQUENCY_HOURS', value: '24', type: 'number', category: 'backup' },
    
    // Configurações de cache
    { key: 'CACHE_ENABLED', value: 'true', type: 'boolean', category: 'cache' },
    { key: 'CACHE_TTL_SECONDS', value: '3600', type: 'number', category: 'cache' },
    { key: 'CACHE_MAX_ITEMS', value: '1000', type: 'number', category: 'cache' },
    
    // Configurações de API externa
    { key: 'EXTERNAL_API_ENABLED', value: 'false', type: 'boolean', category: 'external_apis' },
    { key: 'EXTERNAL_API_TIMEOUT', value: '10000', type: 'number', category: 'external_apis' },
    { key: 'EXTERNAL_API_RETRY_COUNT', value: '3', type: 'number', category: 'external_apis' },
    
    // Configurações de monitoramento
    { key: 'MONITORING_ENABLED', value: 'true', type: 'boolean', category: 'monitoring' },
    { key: 'LOG_LEVEL', value: 'info', type: 'string', category: 'monitoring' },
    { key: 'HEALTH_CHECK_INTERVAL', value: '60', type: 'number', category: 'monitoring' },
    
    // Templates de mensagem
    { key: 'WHATSAPP_TEMPLATE_PROMOTION', value: '🔥 *{title}*\n\n💰 De ~R$ {originalPrice}~ por *R$ {promoPrice}*\n📊 *{discountPercent}% OFF*\n🏪 {store}\n\n👉 {url}\n\n_Oferta por tempo limitado!_', type: 'text', category: 'templates' },
    { key: 'WHATSAPP_TEMPLATE_DAILY_DIGEST', value: '📋 *Resumo do Dia*\n\n🔢 {totalPromotions} novas promoções\n💸 Economia total: R$ {totalSavings}\n🏆 Melhor oferta: {bestOffer}\n\n📱 Acesse: {websiteUrl}', type: 'text', category: 'templates' },
    
    // Configurações de loja/afiliados
    { key: 'AFFILIATE_ENABLED', value: 'false', type: 'boolean', category: 'affiliates' },
    { key: 'DEFAULT_AFFILIATE_TAG', value: '', type: 'string', category: 'affiliates' },
    { key: 'COMMISSION_TRACKING', value: 'false', type: 'boolean', category: 'affiliates' },
    
    // Configurações de categorização
    { key: 'AUTO_CATEGORIZATION', value: 'true', type: 'boolean', category: 'categorization' },
    { key: 'DEFAULT_CATEGORY', value: 'Geral', type: 'string', category: 'categorization' },
    { key: 'CATEGORY_KEYWORDS', value: JSON.stringify({
      'Eletrônicos': ['smartphone', 'notebook', 'tv', 'tablet', 'headphone', 'mouse', 'teclado'],
      'Casa': ['cama', 'mesa', 'cadeira', 'geladeira', 'microondas', 'fogão'],
      'Moda': ['roupa', 'sapato', 'tênis', 'camisa', 'calça', 'vestido'],
      'Beleza': ['perfume', 'maquiagem', 'shampoo', 'creme', 'hidratante'],
      'Esporte': ['bicicleta', 'academia', 'corrida', 'futebol', 'tênis esportivo']
    }), type: 'json', category: 'categorization' }
  ];

  // Inserir configurações que não existem
  for (const config of defaultConfigs) {
    try {
      await prisma.configuration.upsert({
        where: { key: config.key },
        update: {}, // Não atualizar se já existir
        create: config
      });
    } catch (error) {
      console.error(`Erro ao criar configuração ${config.key}:`, error);
    }
  }

  console.log('✅ Configurações padrão inicializadas');
}