import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AIService } from './AIService';

export class ScrapingService {
  private prisma: PrismaClient;
  private aiService: AIService;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.aiService = new AIService();
  }

  // Executar scraping automático de todos os targets ativos
  async runAutomaticScraping(): Promise<void> {
    try {
      const targets = await this.prisma.scrapingTarget.findMany({
        where: { isActive: true }
      });

      console.log(`🔍 Iniciando scraping de ${targets.length} targets...`);

      for (const target of targets) {
        try {
          await this.scrapeTarget(target);
          
          // Atualizar última execução
          await this.prisma.scrapingTarget.update({
            where: { id: target.id },
            data: { lastScrape: new Date() }
          });

          // Aguardar entre targets para evitar sobrecarga
          await new Promise(resolve => setTimeout(resolve, 3000));

        } catch (error) {
          console.error(`❌ Erro no scraping de ${target.name}:`, error);
        }
      }

    } catch (error) {
      console.error('❌ Erro no scraping automático:', error);
    }
  }

  // Fazer scraping de um target específico
  private async scrapeTarget(target: any): Promise<void> {
    try {
      console.log(`🔍 Scraping: ${target.name}`);

      const response = await axios.get(target.baseUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': process.env.SCRAPING_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        }
      });

      const $ = cheerio.load(response.data);
      const selectors = target.selectors;
      const products: any[] = [];

      // Extrair produtos usando seletores configurados
      $(selectors.container).each((index, element) => {
        try {
          const title = $(element).find(selectors.title).text().trim();
          const originalPriceText = $(element).find(selectors.originalPrice).text().trim();
          const promoPriceText = $(element).find(selectors.promoPrice).text().trim();
          const imageUrl = $(element).find(selectors.image).attr('src') || 
                           $(element).find(selectors.image).attr('data-src');
          const productUrl = $(element).find(selectors.link).attr('href');

          if (!title || !promoPriceText) return;

          // Extrair preços
          const originalPrice = this.extractPrice(originalPriceText);
          const promoPrice = this.extractPrice(promoPriceText);

          if (!promoPrice || promoPrice <= 0) return;

          // Calcular desconto
          const discountPercent = originalPrice > promoPrice 
            ? ((originalPrice - promoPrice) / originalPrice) * 100
            : 0;

          // Filtrar apenas promoções com desconto mínimo
          if (discountPercent < 20) return;

          // Construir URL completa se necessário
          const fullProductUrl = productUrl?.startsWith('http') 
            ? productUrl 
            : `${new URL(target.baseUrl).origin}${productUrl}`;

          const fullImageUrl = imageUrl?.startsWith('http') 
            ? imageUrl 
            : imageUrl?.startsWith('//')
            ? `https:${imageUrl}`
            : `${new URL(target.baseUrl).origin}${imageUrl}`;

          products.push({
            title,
            originalPrice: originalPrice || promoPrice * 1.5, // Estimativa se não houver preço original
            promoPrice,
            discountPercent,
            store: target.name,
            imageUrl: fullImageUrl,
            productUrl: fullProductUrl,
            source: target.name.toLowerCase().replace(/\s+/g, '_'),
            sourceId: this.generateProductId(fullProductUrl || title)
          });

        } catch (error) {
          console.error('Erro ao processar produto:', error);
        }
      });

      console.log(`📦 Encontrados ${products.length} produtos em ${target.name}`);

      // Processar e salvar produtos
      await this.processScrapedProducts(products);

      // Atualizar contador do target
      await this.prisma.scrapingTarget.update({
        where: { id: target.id },
        data: { 
          totalItems: { increment: products.length },
          lastScrape: new Date()
        }
      });

    } catch (error) {
      console.error(`❌ Erro no scraping de ${target.name}:`, error);
      throw error;
    }
  }

  // Processar produtos extraídos
  private async processScrapedProducts(products: any[]): Promise<void> {
    for (const product of products) {
      try {
        // Verificar se já existe (evitar duplicatas)
        const existing = await this.prisma.promotion.findUnique({
          where: {
            source_sourceId: {
              source: product.source,
              sourceId: product.sourceId
            }
          }
        });

        if (existing) {
          // Atualizar preços se mudaram
          if (existing.promoPrice !== product.promoPrice) {
            await this.prisma.promotion.update({
              where: { id: existing.id },
              data: {
                originalPrice: product.originalPrice,
                promoPrice: product.promoPrice,
                discountPercent: product.discountPercent,
                lastChecked: new Date()
              }
            });

            // Registrar histórico de preço
            await this.prisma.priceHistory.create({
              data: {
                promotionId: existing.id,
                price: product.promoPrice
              }
            });
          }
          continue;
        }

        // Analisar com IA
        const relevanceScore = await this.aiService.calculateRelevanceScore(product);
        const suspiciousCheck = await this.aiService.detectSuspiciousPromotion(product);
        let generatedText = '';

        // Gerar descrição carismática se a promoção não for suspeita
        if (!suspiciousCheck.isSuspicious && relevanceScore >= 60) {
          try {
            generatedText = await this.aiService.generatePromotionDescription(product);
          } catch (error) {
            console.warn('Erro ao gerar descrição IA:', error);
          }
        }

        // Salvar promoção
        const promotion = await this.prisma.promotion.create({
          data: {
            ...product,
            relevanceScore,
            generatedText,
            isValid: !suspiciousCheck.isSuspicious,
            isApproved: relevanceScore >= 80 && !suspiciousCheck.isSuspicious ? true : null, // Auto-aprovar se score alto
            category: this.detectCategory(product.title)
          }
        });

        // Registrar histórico inicial de preço
        await this.prisma.priceHistory.create({
          data: {
            promotionId: promotion.id,
            price: product.promoPrice
          }
        });

        console.log(`✅ Nova promoção salva: ${product.title} (Score: ${relevanceScore})`);

      } catch (error) {
        console.error('❌ Erro ao processar produto:', error);
      }
    }
  }

  // Extrair preço de texto
  private extractPrice(text: string): number {
    if (!text) return 0;
    
    const cleanText = text.replace(/[^\d,.-]/g, '');
    const match = cleanText.match(/(\d+[,.]?\d*)/);
    
    if (!match) return 0;
    
    return parseFloat(match[1].replace(',', '.'));
  }

  // Gerar ID único para produto
  private generateProductId(url: string): string {
    return Buffer.from(url).toString('base64').slice(0, 20);
  }

  // Detectar categoria baseada no título
  private detectCategory(title: string): string {
    const titleLower = title.toLowerCase();
    
    const categories: { [key: string]: string[] } = {
      'Eletrônicos': ['smartphone', 'notebook', 'tv', 'tablet', 'headphone', 'mouse', 'teclado'],
      'Casa': ['cama', 'mesa', 'cadeira', 'geladeira', 'microondas', 'fogão'],
      'Moda': ['roupa', 'sapato', 'tênis', 'camisa', 'calça', 'vestido'],
      'Beleza': ['perfume', 'maquiagem', 'shampoo', 'creme', 'hidratante'],
      'Esporte': ['bicicleta', 'academia', 'corrida', 'futebol', 'tênis esportivo'],
      'Livros': ['livro', 'revista', 'quadrinho', 'mangá'],
      'Games': ['playstation', 'xbox', 'nintendo', 'game', 'jogo']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => titleLower.includes(keyword))) {
        return category;
      }
    }

    return 'Geral';
  }

  // Adicionar novo target de scraping
  async addScrapingTarget(target: {
    name: string;
    baseUrl: string;
    selectors: {
      container: string;
      title: string;
      originalPrice?: string;
      promoPrice: string;
      image: string;
      link: string;
    };
  }): Promise<any> {
    return await this.prisma.scrapingTarget.create({
      data: {
        name: target.name,
        baseUrl: target.baseUrl,
        selectors: JSON.stringify(target.selectors),
        isActive: true
      }
    });
  }

  // Listar todos os targets
  async getScrapingTargets(): Promise<any[]> {
    return await this.prisma.scrapingTarget.findMany({
      orderBy: { name: 'asc' }
    });
  }

  // Testar scraping de um target
  async testScrapingTarget(targetId: string): Promise<any[]> {
    const target = await this.prisma.scrapingTarget.findUnique({
      where: { id: parseInt(targetId) }
    });

    if (!target) {
      throw new Error('Target não encontrado');
    }

    // Fazer scraping de teste (sem salvar)
    const response = await axios.get(target.baseUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': process.env.SCRAPING_USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const selectors = JSON.parse(target.selectors as string);
    const testResults: any[] = [];

    $(selectors.container).slice(0, 5).each((index, element) => {
      const title = $(element).find(selectors.title).text().trim();
      const originalPriceText = $(element).find(selectors.originalPrice).text().trim();
      const promoPriceText = $(element).find(selectors.promoPrice).text().trim();
      
      testResults.push({
        index,
        title,
        originalPriceText,
        promoPriceText,
        originalPrice: this.extractPrice(originalPriceText),
        promoPrice: this.extractPrice(promoPriceText)
      });
    });

    return testResults;
  }
}