import OpenAI from 'openai';

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Gerar descrição carismática e engraçada para promoção
  async generatePromotionDescription(promotion: {
    title: string;
    originalPrice: number;
    promoPrice: number;
    discountPercent: number;
    store: string;
    category?: string;
  }): Promise<string> {
    try {
      const prompt = `
        Você é um copywriter especializado em criar textos carismáticos e divertidos para promoções no WhatsApp.
        
        Crie uma mensagem promocional CURTA (máximo 3 linhas) usando:
        - Produto: ${promotion.title}
        - Preço original: R$ ${promotion.originalPrice.toFixed(2)}
        - Preço promocional: R$ ${promotion.promoPrice.toFixed(2)}
        - Desconto: ${promotion.discountPercent.toFixed(0)}%
        - Loja: ${promotion.store}
        - Categoria: ${promotion.category || 'Geral'}
        
        INSTRUÇÕES:
        1. Use emojis relevantes
        2. Crie trocadilhos ou jogos de palavras quando possível
        3. Seja carismático e engraçado, mas não exagere
        4. Inclua call-to-action persuasivo
        5. Use linguagem jovem e descontraída
        6. NÃO inclua o link (será adicionado depois)
        7. NÃO repita os preços exatos (use "De X por Y" ou similar)
        
        Exemplos de estilo:
        - "🔥 Queima total! Notebook que vai fazer seu chefe pensar que você virou gênio da informática!"
        - "💸 Promoção tão boa que até minha sogra aprovou!"
        - "⚡ Desconto tão grande que nem o PIX consegue processar tanta economia!"
        
        Crie apenas a mensagem, sem aspas ou formatação extra:
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.8,
      });

      const generatedText = response.choices[0]?.message?.content?.trim();
      
      if (!generatedText) {
        throw new Error('IA não conseguiu gerar descrição');
      }

      return generatedText;

    } catch (error) {
      console.error('Erro ao gerar descrição com IA:', error);
      
      // Fallback para descrição manual
      return this.generateFallbackDescription(promotion);
    }
  }

  // Descrição de fallback quando a IA falha
  private generateFallbackDescription(promotion: {
    title: string;
    originalPrice: number;
    promoPrice: number;
    discountPercent: number;
    store: string;
  }): string {
    const emojis = ['🔥', '💥', '⚡', '💸', '🎯', '🚀'];
    const phrases = [
      'Promoção imperdível!',
      'Oferta relâmpago!',
      'Desconto bomba!',
      'Oportunidade única!',
      'Preço de liquidação!',
    ];

    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    return `${randomEmoji} ${randomPhrase}\n${promotion.title}\n${promotion.discountPercent.toFixed(0)}% OFF na ${promotion.store}!`;
  }

  // Calcular score de relevância da promoção
  async calculateRelevanceScore(promotion: {
    title: string;
    originalPrice: number;
    promoPrice: number;
    discountPercent: number;
    store: string;
    category?: string;
  }): Promise<number> {
    let score = 0;

    // Score baseado no desconto (0-40 pontos)
    if (promotion.discountPercent >= 70) score += 40;
    else if (promotion.discountPercent >= 50) score += 30;
    else if (promotion.discountPercent >= 30) score += 20;
    else if (promotion.discountPercent >= 20) score += 10;

    // Score baseado no preço (0-20 pontos)
    if (promotion.promoPrice <= 50) score += 20;
    else if (promotion.promoPrice <= 200) score += 15;
    else if (promotion.promoPrice <= 500) score += 10;
    else if (promotion.promoPrice <= 1000) score += 5;

    // Score baseado na loja (0-15 pontos)
    const popularStores = ['Amazon', 'Magazine Luiza', 'Americanas', 'Casas Bahia', 'Shopee', 'AliExpress'];
    if (popularStores.some(store => promotion.store.toLowerCase().includes(store.toLowerCase()))) {
      score += 15;
    } else {
      score += 5;
    }

    // Score baseado na categoria (0-15 pontos)
    const popularCategories = ['Eletrônicos', 'Casa', 'Moda', 'Beleza', 'Esporte'];
    if (promotion.category && popularCategories.includes(promotion.category)) {
      score += 15;
    } else {
      score += 5;
    }

    // Score baseado no título (0-10 pontos) - palavras-chave
    const keywords = ['iphone', 'notebook', 'tv', 'smartphone', 'tablet', 'headphone', 'nike', 'adidas'];
    const titleLower = promotion.title.toLowerCase();
    if (keywords.some(keyword => titleLower.includes(keyword))) {
      score += 10;
    }

    return Math.min(score, 100); // Máximo 100 pontos
  }

  // Detectar se a promoção é suspeita/falsa
  async detectSuspiciousPromotion(promotion: {
    title: string;
    originalPrice: number;
    promoPrice: number;
    discountPercent: number;
  }): Promise<{ isSuspicious: boolean; reasons: string[] }> {
    const reasons: string[] = [];
    let isSuspicious = false;

    // Desconto muito alto (>90%)
    if (promotion.discountPercent > 90) {
      reasons.push('Desconto muito alto (>90%)');
      isSuspicious = true;
    }

    // Preços muito baixos para produtos caros
    const expensiveKeywords = ['iphone', 'macbook', 'notebook gamer', 'tv 65', 'playstation'];
    const titleLower = promotion.title.toLowerCase();
    
    if (expensiveKeywords.some(keyword => titleLower.includes(keyword)) && promotion.promoPrice < 500) {
      reasons.push('Preço muito baixo para produto caro');
      isSuspicious = true;
    }

    // Preço original muito inflacionado
    if (promotion.originalPrice > promotion.promoPrice * 10) {
      reasons.push('Preço original muito inflacionado');
      isSuspicious = true;
    }

    // Centavos suspeitos (ex: R$ 0,01, R$ 1,99 para produtos caros)
    if (promotion.promoPrice < 10 && promotion.originalPrice > 100) {
      reasons.push('Preço promocional muito baixo comparado ao original');
      isSuspicious = true;
    }

    return { isSuspicious, reasons };
  }

  // Gerar sugestões de melhoria para a promoção
  async generateImprovementSuggestions(promotion: {
    title: string;
    description?: string;
    relevanceScore: number;
  }): Promise<string[]> {
    const suggestions: string[] = [];

    if (promotion.relevanceScore < 50) {
      suggestions.push('💡 Considere aguardar por um desconto maior');
      suggestions.push('💡 Verifique se é uma loja confiável');
    }

    if (!promotion.title.includes('marca') && promotion.title.length > 50) {
      suggestions.push('💡 Título muito longo, considere resumir');
    }

    if (!promotion.description) {
      suggestions.push('💡 Adicione uma descrição detalhada do produto');
    }

    return suggestions;
  }
}