import express from 'express';
import { PrismaClient } from '@prisma/client';
import { whatsAppService } from '../server';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware de autenticação admin (simplificado)
const requireAdmin = (req: any, res: any, next: any) => {
  // TODO: Implementar autenticação JWT completa
  next();
};

// Webhook para status de mensagens do Twilio
router.post('/webhook', async (req, res) => {
  try {
    const { MessageSid, MessageStatus, From, To, Body } = req.body;

    console.log('Webhook WhatsApp:', { MessageSid, MessageStatus, From, To });

    // Atualizar status da mensagem no banco
    if (MessageSid && MessageStatus) {
      await prisma.sentMessage.updateMany({
        where: {
          // Buscar por recipient e período recente
          recipient: To?.replace('whatsapp:', ''),
          sentAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // últimas 24h
          }
        },
        data: {
          delivered: ['delivered', 'read'].includes(MessageStatus)
        }
      });
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Testar envio de mensagem
router.post('/test', requireAdmin, async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ error: 'Destinatário e mensagem são obrigatórios' });
    }

    const result = await whatsAppService.sendWhatsAppMessage(to, message);
    
    res.json(result);

  } catch (error) {
    console.error('Erro ao enviar teste:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Enviar mensagem personalizada
router.post('/send', requireAdmin, async (req, res) => {
  try {
    const { contacts, message } = req.body;

    if (!Array.isArray(contacts) || !message) {
      return res.status(400).json({ error: 'Contatos e mensagem são obrigatórios' });
    }

    const results = [];
    
    for (const contact of contacts) {
      const result = await whatsAppService.sendWhatsAppMessage(contact, message);
      results.push({ contact, ...result });
      
      // Delay entre envios
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    res.json({
      total: contacts.length,
      successful,
      failed,
      details: results
    });

  } catch (error) {
    console.error('Erro ao enviar mensagens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter estatísticas de delivery
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const stats = await whatsAppService.getDeliveryStats(parseInt(days as string));
    
    res.json(stats);

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Testar configuração do WhatsApp
router.get('/test-config', requireAdmin, async (req, res) => {
  try {
    // Verificar se as configurações necessárias existem
    const [accountSid, authToken, fromNumber] = await Promise.all([
      prisma.configuration.findUnique({ where: { key: 'TWILIO_ACCOUNT_SID' } }),
      prisma.configuration.findUnique({ where: { key: 'TWILIO_AUTH_TOKEN' } }),
      prisma.configuration.findUnique({ where: { key: 'TWILIO_WHATSAPP_FROM' } })
    ]);

    const config = {
      hasAccountSid: !!accountSid?.value,
      hasAuthToken: !!authToken?.value,
      fromNumber: fromNumber?.value || 'Não configurado',
      isConfigured: !!(accountSid?.value && authToken?.value)
    };

    res.json(config);

  } catch (error) {
    console.error('Erro ao testar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;