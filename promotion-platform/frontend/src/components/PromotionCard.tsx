'use client';

import Image from 'next/image';
import { ExternalLink, Clock, Star, Flame } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '@/lib/api';

interface Promotion {
  id: string;
  title: string;
  originalPrice: number;
  promoPrice: number;
  discountPercent: number;
  store: string;
  category: string;
  imageUrl: string;
  productUrl: string;
  generatedText: string;
  relevanceScore: number;
  createdAt: string;
}

interface PromotionCardProps {
  promotion: Promotion;
}

export function PromotionCard({ promotion }: PromotionCardProps) {
  const handleClick = async () => {
    // Registrar clique
    try {
      await api.post(`/promotions/${promotion.id}/click`);
    } catch (error) {
      console.error('Erro ao registrar clique:', error);
    }
    
    // Abrir link em nova aba
    window.open(promotion.productUrl, '_blank');
  };

  const timeAgo = formatDistanceToNow(new Date(promotion.createdAt), {
    addSuffix: true,
    locale: ptBR
  });

  const isHighDiscount = promotion.discountPercent >= 50;
  const isExcellentScore = promotion.relevanceScore >= 80;

  return (
    <div className="promotion-card group" onClick={handleClick}>
      {/* Badges */}
      <div className="relative">
        <div className="discount-badge animate-bounce-in">
          <Flame className="h-3 w-3 inline mr-1" />
          {promotion.discountPercent.toFixed(0)}% OFF
        </div>
        
        {isExcellentScore && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center z-10">
            <Star className="h-3 w-3 mr-1" />
            TOP
          </div>
        )}
      </div>

      {/* Imagem */}
      <div className="relative h-48 overflow-hidden">
        {promotion.imageUrl ? (
          <Image
            src={promotion.imageUrl}
            alt={promotion.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-sm">Sem imagem</div>
            </div>
          </div>
        )}
        
        <div className="store-badge">
          {promotion.store}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        {/* Título */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {promotion.title}
        </h3>

        {/* Texto gerado pela IA */}
        {promotion.generatedText && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg mb-3 border border-blue-100">
            <p className="text-sm text-gray-700 font-medium italic">
              {promotion.generatedText}
            </p>
          </div>
        )}

        {/* Preços */}
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 line-through">
              R$ {promotion.originalPrice.toFixed(2)}
            </span>
            <span className="text-xl font-bold text-success-600">
              R$ {promotion.promoPrice.toFixed(2)}
            </span>
          </div>
          
          <div className="text-sm text-gray-600 mt-1">
            Economia: <span className="font-semibold text-success-600">
              R$ {(promotion.originalPrice - promotion.promoPrice).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Metadados */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {timeAgo}
          </div>
          
          {promotion.category && (
            <span className="badge badge-primary">
              {promotion.category}
            </span>
          )}
        </div>

        {/* Indicador de qualidade */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(promotion.relevanceScore / 20)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-sm text-gray-600 ml-2">
              {promotion.relevanceScore.toFixed(0)}/100
            </span>
          </div>
          
          {isHighDiscount && (
            <span className="text-xs bg-fire-gradient text-white px-2 py-1 rounded-full font-bold">
              MEGA OFERTA
            </span>
          )}
        </div>

        {/* Botão de ação */}
        <button className="w-full btn btn-primary group-hover:bg-primary-700 transition-all duration-200">
          <ExternalLink className="h-4 w-4 mr-2" />
          Ver Oferta
        </button>
      </div>
    </div>
  );
}