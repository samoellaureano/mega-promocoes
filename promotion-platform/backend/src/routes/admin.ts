import express from 'express';
import { PrismaClient } from '@prisma/client';
import { aiService, whatsAppService, scrapingService } from '../server';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware de autenticação admin (simplificado)
const requireAdmin = (req: any, res: any, next: any) => {
  // TODO: Implementar autenticação JWT completa
  next();
};

// Dashboard - Estatísticas gerais
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const [
      totalPromotions,
      approvedPromotions,
      pendingPromotions,
      sentMessagesCount,
      activeTargets
    ] = await Promise.all([
      prisma.promotion.count(),
      prisma.promotion.count({ where: { isApproved: true } }),
      prisma.promotion.count({ where: { isApproved: null } }),
      prisma.sentMessage.count({ where: { delivered: true } }),
      prisma.scrapingTarget.count({ where: { isActive: true } })
    ]);

    // Estatísticas dos últimos 7 dias
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      newPromotions,
      sentMessages,
      deliveryStats
    ] = await Promise.all([
      prisma.promotion.count({
        where: { createdAt: { gte: weekAgo } }
      }),
      prisma.sentMessage.count({
        where: { sentAt: { gte: weekAgo } }
      }),
      whatsAppService.getDeliveryStats(7)
    ]);

    // Top categorias
    const topCategories = await prisma.promotion.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });

    // Promoções com maior desconto
    const topDiscounts = await prisma.promotion.findMany({
      where: { isValid: true },
      select: {
        id: true,
        title: true,
        discountPercent: true,
        store: true,
        createdAt: true
      },
      orderBy: { discountPercent: 'desc' },
      take: 10
    });

    res.json({
      overview: {
        totalPromotions,
        approvedPromotions,
        pendingPromotions,
        sentMessagesCount,
        activeTargets
      },
      weeklyStats: {
        newPromotions,
        sentMessages,
        ...deliveryStats
      },
      topCategories,
      topDiscounts
    });

  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Listar promoções com filtros e paginação
router.get('/promotions', requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      store,
      category,
      minDiscount,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Construir filtros
    const where: any = {};

    if (status === 'approved') where.isApproved = true;
    else if (status === 'pending') where.isApproved = null;
    else if (status === 'rejected') where.isApproved = false;

    if (store) where.store = { contains: store, mode: 'insensitive' };
    if (category) where.category = category;
    if (minDiscount) where.discountPercent = { gte: parseFloat(minDiscount as string) };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { store: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [promotions, total] = await Promise.all([
      prisma.promotion.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          _count: {
            select: { sentMessages: true }
          }
        }
      }),
      prisma.promotion.count({ where })
    ]);

    res.json({
      promotions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Erro ao listar promoções:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Aprovar/Reprovar promoção
router.patch('/promotions/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const promotion = await prisma.promotion.update({
      where: { id: parseInt(id) },
      data: { isApproved }
    });

    res.json(promotion);

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Regenerar descrição com IA
router.post('/promotions/:id/regenerate-text', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await prisma.promotion.findUnique({
      where: { id: parseInt(id) }
    });

    if (!promotion) {
      return res.status(404).json({ error: 'Promoção não encontrada' });
    }

    const generatedText = await aiService.generatePromotionDescription({
      title: promotion.title,
      originalPrice: promotion.originalPrice,
      promoPrice: promotion.promoPrice,
      discountPercent: promotion.discountPercent,
      store: promotion.store,
      category: promotion.category || undefined
    });

    const updated = await prisma.promotion.update({
      where: { id: parseInt(id) },
      data: { generatedText }
    });

    res.json({ generatedText: updated.generatedText });

  } catch (error) {
    console.error('Erro ao regenerar texto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Enviar promoção específica
router.post('/promotions/:id/send', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { contacts } = req.body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ error: 'Lista de contatos inválida' });
    }

    const result = await whatsAppService.sendPromotionToContacts(id, contacts);
    
    res.json(result);

  } catch (error) {
    console.error('Erro ao enviar promoção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Gerenciar targets de scraping
router.get('/scraping-targets', requireAdmin, async (req, res) => {
  try {
    const targets = await scrapingService.getScrapingTargets();
    res.json(targets);
  } catch (error) {
    console.error('Erro ao listar targets:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/scraping-targets', requireAdmin, async (req, res) => {
  try {
    const target = await scrapingService.addScrapingTarget(req.body);
    res.json(target);
  } catch (error) {
    console.error('Erro ao criar target:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/scraping-targets/:id/test', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const results = await scrapingService.testScrapingTarget(id);
    res.json(results);
  } catch (error) {
    console.error('Erro ao testar target:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Ativar/Desativar target
router.patch('/scraping-targets/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const target = await prisma.scrapingTarget.update({
      where: { id: parseInt(id) },
      data: { isActive }
    });

    res.json(target);

  } catch (error) {
    console.error('Erro ao atualizar target:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Executar scraping manual
router.post('/scraping/run', requireAdmin, async (req, res) => {
  try {
    // Executar em background para não travar a resposta
    scrapingService.runAutomaticScraping().catch(console.error);
    
    res.json({ message: 'Scraping iniciado em background' });

  } catch (error) {
    console.error('Erro ao iniciar scraping:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Logs de mensagens enviadas
router.get('/messages', requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      delivered,
      platform = 'whatsapp'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { platform };
    if (delivered !== undefined) where.delivered = delivered === 'true';

    const [messages, total] = await Promise.all([
      prisma.sentMessage.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { sentAt: 'desc' },
        include: {
          promotion: {
            select: {
              id: true,
              title: true,
              store: true
            }
          }
        }
      }),
      prisma.sentMessage.count({ where })
    ]);

    res.json({
      messages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Análise de uma promoção
router.get('/promotions/:id/analysis', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await prisma.promotion.findUnique({
      where: { id: parseInt(id) },
      include: {
        priceHistory: {
          orderBy: { checkedAt: 'desc' },
          take: 10
        },
        sentMessages: {
          select: {
            platform: true,
            delivered: true,
            clicked: true,
            sentAt: true
          }
        }
      }
    });

    if (!promotion) {
      return res.status(404).json({ error: 'Promoção não encontrada' });
    }

    // Análise com IA
    const suspiciousCheck = await aiService.detectSuspiciousPromotion(promotion);
    const suggestions = await aiService.generateImprovementSuggestions(promotion);

    res.json({
      promotion,
      analysis: {
        suspicious: suspiciousCheck,
        suggestions
      }
    });

  } catch (error) {
    console.error('Erro na análise:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;