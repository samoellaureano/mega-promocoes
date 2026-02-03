import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
import path from 'path';

// Importar rotas
import authRoutes from './routes/auth';
import promotionRoutes from './routes/promotions';
import adminRoutes from './routes/admin';
import configRoutes from './routes/config';
import whatsappRoutes from './routes/whatsapp';

// Importar serviços
import { ScrapingService } from './services/ScrapingService';
import { WhatsAppService } from './services/WhatsAppService';
import { AIService } from './services/AIService';
import { initializeDefaultConfig } from './utils/defaultConfig';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend (produção)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/.next/static')));
  app.use(express.static(path.join(__dirname, '../../frontend/out')));
}

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/config', configRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Servir frontend (SPA) para todas as outras rotas
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/out/index.html'));
  });
}

// Serviços globais
let scrapingService: ScrapingService;
let whatsAppService: WhatsAppService;
let aiService: AIService;

// Inicialização
async function initializeServices() {
  try {
    console.log('🔄 Inicializando serviços...');
    
    // Conectar ao banco
    await prisma.$connect();
    console.log('✅ Banco de dados conectado');
    
    // Inicializar configurações padrão
    await initializeDefaultConfig(prisma);
    console.log('✅ Configurações inicializadas');
    
    // Inicializar serviços
    scrapingService = new ScrapingService(prisma);
    whatsAppService = new WhatsAppService(prisma);
    aiService = new AIService();
    
    console.log('✅ Serviços inicializados');
    
    // Agendar scraping automático (a cada 2 horas)
    cron.schedule('0 */2 * * *', async () => {
      console.log('🔍 Iniciando scraping automático...');
      await scrapingService.runAutomaticScraping();
    });
    
    // Agendar envio de promoções (a cada 30 minutos)
    cron.schedule('*/30 * * * *', async () => {
      console.log('📤 Verificando promoções para envio...');
      await whatsAppService.sendPendingPromotions();
    });
    
    console.log('⏰ Agendadores configurados');
    
  } catch (error) {
    console.error('❌ Erro na inicialização:', error);
    process.exit(1);
  }
}

// Middleware de erro
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Iniciar servidor
async function startServer() {
  await initializeServices();
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

// Exportar para uso em outros módulos
export { prisma, scrapingService, whatsAppService, aiService };

startServer().catch(console.error);