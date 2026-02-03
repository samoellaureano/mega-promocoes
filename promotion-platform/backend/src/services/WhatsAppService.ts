import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';

export class WhatsAppService {
  private prisma: PrismaClient;
  private twilioClient: any;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.initializeTwilio();
  }

  private async initializeTwilio() {
    try {
      const accountSid = await this.getConfig('TWILIO_ACCOUNT_SID');
      const authToken = await this.getConfig('TWILIO_AUTH_TOKEN');
      
      if (accountSid && authToken) {
        this.twilioClient = twilio(accountSid, authToken);
      }
    } catch (error) {
      console.error('Erro ao inicializar Twilio:', error);
    }
  }

  private async getConfig(key: string): Promise<string | null> {
    const config = await this.prisma.configuration.findUnique({
      where: { key }
    });
    return config?.value || null;
  }

  // Enviar mensagem individual
  async sendWhatsAppMessage(
    to: string, 
    message: string, 
    promotionId?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.twilioClient) {
        throw new Error('Twilio não configurado');
      }

      const from = await this.getConfig('TWILIO_WHATSAPP_FROM') || 'whatsapp:+14155238886';
      
      const response = await this.twilioClient.messages.create({
        from,
        to: `whatsapp:${to}`,
        body: message
      });

      // Salvar registro da mensagem enviada
      if (promotionId) {
        await this.prisma.sentMessage.create({
          data: {
            promotionId,
            platform: 'whatsapp',
            recipient: to,
            message,
            delivered: true
          }
        });
      }

      return { 
        success: true, 
        messageId: response.sid 
      };

    } catch (error: any) {
      console.error('Erro ao enviar WhatsApp:', error);
      
      // Salvar erro no banco
      if (promotionId) {
        await this.prisma.sentMessage.create({
          data: {
            promotionId,
            platform: 'whatsapp',
            recipient: to,
            message,
            delivered: false
          }
        });
      }

      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Enviar promoção para múltiplos contatos
  async sendPromotionToContacts(promotionId: string, contacts: string[]): Promise<{
    sent: number;
    failed: number;
    errors: string[];
  }> {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId }
    });

    if (!promotion) {
      throw new Error('Promoção não encontrada');
    }

    // Montar mensagem da promoção
    const message = this.formatPromotionMessage(promotion);
    
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    // Controle de rate limiting
    const delay = parseInt(await this.getConfig('WHATSAPP_SEND_DELAY') || '2000');

    for (const contact of contacts) {
      try {
        const result = await this.sendWhatsAppMessage(contact, message, promotionId);
        
        if (result.success) {
          sent++;
        } else {
          failed++;
          errors.push(`${contact}: ${result.error}`);
        }

        // Aguardar entre envios para evitar rate limiting
        if (contacts.indexOf(contact) < contacts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

      } catch (error: any) {
        failed++;
        errors.push(`${contact}: ${error.message}`);
      }
    }

    return { sent, failed, errors };
  }

  // Formatar mensagem da promoção
  private formatPromotionMessage(promotion: any): string {
    const emoji = this.getRandomEmoji();
    
    let message = '';
    
    // Usar texto gerado pela IA se disponível
    if (promotion.generatedText) {
      message = `${emoji} ${promotion.generatedText}\n\n`;
    } else {
      // Fallback para template padrão
      message = `${emoji} *${promotion.title}*\n\n`;
      message += `💰 De ~R$ ${promotion.originalPrice.toFixed(2)}~ por *R$ ${promotion.promoPrice.toFixed(2)}*\n`;
      message += `📊 *${promotion.discountPercent.toFixed(0)}% OFF*\n`;
      message += `🏪 ${promotion.store}\n\n`;
    }
    
    message += `👉 ${promotion.productUrl}\n\n`;
    message += `_Oferta por tempo limitado!_`;

    return message;
  }

  private getRandomEmoji(): string {
    const emojis = ['🔥', '💥', '⚡', '🎯', '💸', '🚀', '💎', '🎉'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  }

  // Enviar promoções pendentes automaticamente
  async sendPendingPromotions(): Promise<void> {
    try {
      // Buscar configurações de envio
      const isAutoSendEnabled = (await this.getConfig('AUTO_SEND_ENABLED')) === 'true';
      const maxDailyMessages = parseInt(await this.getConfig('MAX_DAILY_MESSAGES') || '50');
      const minRelevanceScore = parseInt(await this.getConfig('MIN_RELEVANCE_SCORE') || '60');
      const whatsappContacts = await this.getConfig('WHATSAPP_CONTACTS');

      if (!isAutoSendEnabled || !whatsappContacts) {
        return;
      }

      const contacts = whatsappContacts.split(',').map(c => c.trim());

      // Verificar quantas mensagens já foram enviadas hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const messagesCount = await this.prisma.sentMessage.count({
        where: {
          sentAt: {
            gte: today
          },
          delivered: true
        }
      });

      if (messagesCount >= maxDailyMessages) {
        console.log('❌ Limite diário de mensagens atingido');
        return;
      }

      // Buscar promoções aprovadas e não enviadas
      const promotions = await this.prisma.promotion.findMany({
        where: {
          isApproved: true,
          isValid: true,
          relevanceScore: {
            gte: minRelevanceScore
          },
          sentMessages: {
            none: {}
          }
        },
        orderBy: {
          relevanceScore: 'desc'
        },
        take: maxDailyMessages - messagesCount
      });

      console.log(`📤 Enviando ${promotions.length} promoções...`);

      for (const promotion of promotions) {
        try {
          const result = await this.sendPromotionToContacts(promotion.id, contacts);
          console.log(`✅ Promoção ${promotion.id}: ${result.sent} enviadas, ${result.failed} falharam`);
          
          // Aguardar entre promoções
          await new Promise(resolve => setTimeout(resolve, 5000));
          
        } catch (error) {
          console.error(`❌ Erro ao enviar promoção ${promotion.id}:`, error);
        }
      }

    } catch (error) {
      console.error('❌ Erro no envio automático:', error);
    }
  }

  // Obter estatísticas de envio
  async getDeliveryStats(days: number = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await this.prisma.sentMessage.groupBy({
      by: ['delivered'],
      where: {
        sentAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      }
    });

    const clickStats = await this.prisma.sentMessage.groupBy({
      by: ['clicked'],
      where: {
        sentAt: {
          gte: startDate
        },
        delivered: true
      },
      _count: {
        id: true
      }
    });

    return {
      totalSent: stats.reduce((acc, stat) => acc + stat._count.id, 0),
      delivered: stats.find(s => s.delivered)?._count.id || 0,
      failed: stats.find(s => !s.delivered)?._count.id || 0,
      clicked: clickStats.find(s => s.clicked)?._count.id || 0,
      clickRate: clickStats.length > 0 ? 
        ((clickStats.find(s => s.clicked)?._count.id || 0) / 
         clickStats.reduce((acc, stat) => acc + stat._count.id, 0)) * 100 : 0
    };
  }
}