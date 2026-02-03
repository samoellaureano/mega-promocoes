import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Listar promoções públicas (aprovadas)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      store,
      minDiscount,
      search,
      sortBy = 'relevanceScore',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isApproved: true,
      isValid: true
    };

    if (category && category !== 'all') where.category = category;
    if (store) where.store = { contains: store, mode: 'insensitive' };
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
        select: {
          id: true,
          title: true,
          originalPrice: true,
          promoPrice: true,
          discountPercent: true,
          store: true,
          category: true,
          imageUrl: true,
          productUrl: true,
          generatedText: true,
          relevanceScore: true,
          createdAt: true
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

// Obter promoção específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const promotion = await prisma.promotion.findFirst({
      where: {
        id: parseInt(id),
        isApproved: true,
        isValid: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        originalPrice: true,
        promoPrice: true,
        discountPercent: true,
        store: true,
        category: true,
        imageUrl: true,
        productUrl: true,
        generatedText: true,
        relevanceScore: true,
        createdAt: true,
        priceHistory: {
          orderBy: { checkedAt: 'desc' },
          take: 10,
          select: {
            price: true,
            checkedAt: true
          }
        }
      }
    });

    if (!promotion) {
      return res.status(404).json({ error: 'Promoção não encontrada' });
    }

    res.json(promotion);

  } catch (error) {
    console.error('Erro ao obter promoção:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Registrar clique em promoção
router.post('/:id/click', async (req, res) => {
  try {
    const { id } = req.params;
    const { messageId } = req.body;

    // Registrar clique se veio de mensagem do WhatsApp
    if (messageId) {
      await prisma.sentMessage.updateMany({
        where: {
          promotionId: parseInt(id),
          id: messageId
        },
        data: {
          clicked: true
        }
      });
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Erro ao registrar clique:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter categorias disponíveis
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await prisma.promotion.groupBy({
      by: ['category'],
      where: {
        isApproved: true,
        isValid: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    res.json(categories);

  } catch (error) {
    console.error('Erro ao obter categorias:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter lojas disponíveis
router.get('/meta/stores', async (req, res) => {
  try {
    const stores = await prisma.promotion.groupBy({
      by: ['store'],
      where: {
        isApproved: true,
        isValid: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 20
    });

    res.json(stores);

  } catch (error) {
    console.error('Erro ao obter lojas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;