#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Servidor Backend para Gerenciamento de Promoções
Fornece dados reais para a página admin-promotions.html
"""

import json
import os
import time
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import random

class PromotionsHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.data_file = os.path.join(os.path.dirname(__file__), 'megapromocoes_promotions.json')
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        """Manipular requisições GET"""
        parsed_url = urlparse(self.path)
        
        # Configurar CORS
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        
        if parsed_url.path == '/api/promotions':
            self._handle_get_promotions(parsed_url)
        elif parsed_url.path == '/api/promotions/stats':
            self._handle_get_stats()
        elif parsed_url.path == '/api/health':
            self._handle_health()
        else:
            self._send_error(404, 'Endpoint não encontrado')
    
    def do_POST(self):
        """Manipular requisições POST"""
        parsed_url = urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
        
        # Configurar CORS
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        
        if parsed_url.path == '/api/promotions/create':
            self._handle_create_promotion(post_data)
        elif parsed_url.path == '/api/promotions/update':
            self._handle_update_promotion(post_data)
        elif parsed_url.path == '/api/promotions/delete':
            self._handle_delete_promotion(post_data)
        elif parsed_url.path == '/api/promotions/generate-ai':
            self._handle_generate_ai(post_data)
        else:
            self._send_error(404, 'Endpoint não encontrado')
    
    def do_OPTIONS(self):
        """Manipular requisições OPTIONS para CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def _load_promotions(self):
        """Carregar promoções do arquivo JSON"""
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            else:
                # Criar dados iniciais se arquivo não existir
                return self._create_initial_data()
        except Exception as e:
            print(f"⚠️  Erro ao carregar promoções: {e}")
            return self._create_initial_data()
    
    def _save_promotions(self, data):
        """Salvar promoções no arquivo JSON"""
        try:
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"❌ Erro ao salvar promoções: {e}")
            return False
    
    def _create_initial_data(self):
        """Criar dados iniciais de exemplo"""
        initial_data = {
            "promotions": [
                {
                    "id": "promo_001",
                    "title": "Smartphone Galaxy S24 128GB",
                    "description": "Smartphone Samsung Galaxy S24 com 128GB, tela 6.2\" Dynamic AMOLED",
                    "category": "Eletrônicos",
                    "store": "Amazon",
                    "originalPrice": 2999.00,
                    "promoPrice": 1899.00,
                    "discountPercent": 37,
                    "imageUrl": "https://via.placeholder.com/300x300?text=Galaxy+S24",
                    "productUrl": "https://amazon.com.br/samsung-galaxy-s24",
                    "status": "active",
                    "aiGenerated": False,
                    "aiText": "",
                    "expiresAt": (datetime.now() + timedelta(days=3)).isoformat(),
                    "createdAt": datetime.now().isoformat(),
                    "updatedAt": datetime.now().isoformat()
                },
                {
                    "id": "promo_002", 
                    "title": "Notebook Gamer RTX 4060 16GB RAM",
                    "description": "Notebook Gamer com GeForce RTX 4060, 16GB RAM, SSD 512GB",
                    "category": "Eletrônicos",
                    "store": "Mercado Livre",
                    "originalPrice": 4999.00,
                    "promoPrice": 2999.00,
                    "discountPercent": 40,
                    "imageUrl": "https://via.placeholder.com/300x300?text=Notebook+RTX",
                    "productUrl": "https://mercadolivre.com.br/notebook-gamer-rtx",
                    "status": "active",
                    "aiGenerated": True,
                    "aiText": "🎮 MEGA OFERTA GAMER! 🔥 Notebook com RTX 4060 que vai fazer você dominar todos os games! Performance de outro mundo por um preço que não vai voltar! 🚀",
                    "expiresAt": (datetime.now() + timedelta(days=1)).isoformat(),
                    "createdAt": (datetime.now() - timedelta(days=1)).isoformat(),
                    "updatedAt": datetime.now().isoformat()
                },
                {
                    "id": "promo_003",
                    "title": "Smart TV 55\" 4K UHD",
                    "description": "Smart TV LED 55\" 4K UHD com HDR e Sistema Android TV",
                    "category": "Eletrônicos",
                    "store": "Americanas",
                    "originalPrice": 2499.00,
                    "promoPrice": 1799.00,
                    "discountPercent": 28,
                    "imageUrl": "https://via.placeholder.com/300x300?text=Smart+TV+55",
                    "productUrl": "https://americanas.com.br/smart-tv-55-4k",
                    "status": "expiring_soon",
                    "aiGenerated": False,
                    "aiText": "",
                    "expiresAt": (datetime.now() + timedelta(hours=2)).isoformat(),
                    "createdAt": (datetime.now() - timedelta(days=2)).isoformat(),
                    "updatedAt": datetime.now().isoformat()
                },
                {
                    "id": "promo_004",
                    "title": "AirPods Pro 2ª Geração",
                    "description": "Apple AirPods Pro com Cancelamento Ativo de Ruído",
                    "category": "Eletrônicos", 
                    "store": "Amazon",
                    "originalPrice": 1299.00,
                    "promoPrice": 899.00,
                    "discountPercent": 31,
                    "imageUrl": "https://via.placeholder.com/300x300?text=AirPods+Pro",
                    "productUrl": "https://amazon.com.br/airpods-pro-2",
                    "status": "active",
                    "aiGenerated": True,
                    "aiText": "🎵 MÚSICA PERFEITA! 🍎 AirPods Pro que vão transformar seu mundo sonoro! Cancelamento de ruído que é pura magia! Aproveite antes que acabe! ⚡",
                    "expiresAt": (datetime.now() + timedelta(days=5)).isoformat(),
                    "createdAt": (datetime.now() - timedelta(hours=3)).isoformat(),
                    "updatedAt": datetime.now().isoformat()
                },
                {
                    "id": "promo_005",
                    "title": "Cafeteira Nespresso Essenza Mini",
                    "description": "Cafeteira Nespresso Essenza Mini com 14 Cápsulas",
                    "category": "Casa",
                    "store": "Magazine Luiza",
                    "originalPrice": 399.00,
                    "promoPrice": 249.00,
                    "discountPercent": 38,
                    "imageUrl": "https://via.placeholder.com/300x300?text=Nespresso+Mini",
                    "productUrl": "https://magazineluiza.com.br/cafeteira-nespresso",
                    "status": "inactive",
                    "aiGenerated": False,
                    "aiText": "",
                    "expiresAt": (datetime.now() - timedelta(hours=1)).isoformat(),
                    "createdAt": (datetime.now() - timedelta(days=3)).isoformat(),
                    "updatedAt": (datetime.now() - timedelta(hours=1)).isoformat()
                }
            ],
            "stats": {
                "totalPromotions": 5,
                "activePromotions": 3,
                "expiredPromotions": 1,
                "expiringPromotions": 1,
                "averageDiscount": 34.8,
                "topStores": ["Amazon", "Mercado Livre", "Americanas"],
                "topCategories": ["Eletrônicos", "Casa"]
            },
            "lastUpdated": datetime.now().isoformat()
        }
        
        # Salvar dados iniciais
        self._save_promotions(initial_data)
        return initial_data
    
    def _handle_get_promotions(self, parsed_url):
        """Manipular busca de promoções com filtros"""
        try:
            data = self._load_promotions()
            promotions = data.get('promotions', [])
            
            # Aplicar filtros da query string
            query_params = parse_qs(parsed_url.query)
            
            # Filtro por status
            if 'status' in query_params:
                status_filter = query_params['status'][0]
                if status_filter != 'all':
                    promotions = [p for p in promotions if p.get('status') == status_filter]
            
            # Filtro por loja
            if 'store' in query_params:
                store_filter = query_params['store'][0].lower()
                if store_filter != 'all':
                    promotions = [p for p in promotions if store_filter in p.get('store', '').lower()]
            
            # Filtro por categoria
            if 'category' in query_params:
                cat_filter = query_params['category'][0].lower()
                if cat_filter != 'all':
                    promotions = [p for p in promotions if cat_filter in p.get('category', '').lower()]
            
            # Filtro por busca
            if 'search' in query_params:
                search_term = query_params['search'][0].lower()
                promotions = [p for p in promotions if search_term in p.get('title', '').lower()]
            
            # Paginação
            page = int(query_params.get('page', [1])[0])
            limit = int(query_params.get('limit', [10])[0])
            
            start_idx = (page - 1) * limit
            end_idx = start_idx + limit
            paginated_promotions = promotions[start_idx:end_idx]
            
            response = {
                "success": True,
                "data": {
                    "promotions": paginated_promotions,
                    "pagination": {
                        "page": page,
                        "limit": limit,
                        "total": len(promotions),
                        "pages": max(1, (len(promotions) + limit - 1) // limit)
                    }
                },
                "timestamp": datetime.now().isoformat()
            }
            
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            self._send_error(500, f'Erro ao buscar promoções: {str(e)}')
    
    def _handle_get_stats(self):
        """Manipular estatísticas das promoções"""
        try:
            data = self._load_promotions()
            stats = data.get('stats', {})
            
            # Atualizar estatísticas em tempo real
            promotions = data.get('promotions', [])
            
            updated_stats = {
                "totalPromotions": len(promotions),
                "activePromotions": len([p for p in promotions if p.get('status') == 'active']),
                "expiredPromotions": len([p for p in promotions if p.get('status') == 'inactive']),
                "expiringPromotions": len([p for p in promotions if p.get('status') == 'expiring_soon']),
                "averageDiscount": round(sum(p.get('discountPercent', 0) for p in promotions) / len(promotions) if promotions else 0, 1),
                "totalSavings": sum(p.get('originalPrice', 0) - p.get('promoPrice', 0) for p in promotions),
                "topStores": list(set(p.get('store') for p in promotions if p.get('store'))),
                "topCategories": list(set(p.get('category') for p in promotions if p.get('category')))
            }
            
            response = {
                "success": True,
                "data": updated_stats,
                "timestamp": datetime.now().isoformat()
            }
            
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            self._send_error(500, f'Erro ao buscar estatísticas: {str(e)}')
    
    def _handle_generate_ai(self, post_data):
        """Simular geração de texto com IA"""
        try:
            request_data = json.loads(post_data)
            promotion_id = request_data.get('promotionId')
            
            if not promotion_id:
                self._send_error(400, 'ID da promoção é obrigatório')
                return
            
            # Textos de IA simulados
            ai_texts = [
                "🔥 OFERTA IMPERDÍVEL! Esta promoção vai fazer seu bolso agradecer e sua alegria explodir! Corre que é por tempo limitado! ⚡",
                "💥 PREÇO QUEBRADO! Oportunidade única que não vai se repetir tão cedo! Garante já o seu antes que esgote! 🚀", 
                "🎯 MEGA DESCONTO! Produto top de linha com preço que você nunca viu igual! Aproveita agora e economiza muito! 💰",
                "⚡ FLASH SALE! Oferta relâmpago que vai durar pouco tempo! Quem pegar primeiro leva essa maravilha! 🔥",
                "🚨 ALERTA DE ECONOMIA! Desconto gigante neste produto incrível! Sua chance de ouro chegou! ✨"
            ]
            
            generated_text = random.choice(ai_texts)
            
            response = {
                "success": True,
                "data": {
                    "promotionId": promotion_id,
                    "generatedText": generated_text,
                    "timestamp": datetime.now().isoformat()
                },
                "message": "Texto gerado com sucesso pela IA!"
            }
            
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            self._send_error(500, f'Erro ao gerar texto com IA: {str(e)}')
    
    def _handle_health(self):
        """Verificação de saúde da API"""
        uptime_seconds = int(time.time() - start_time)
        uptime_hours = uptime_seconds // 3600
        uptime_minutes = (uptime_seconds % 3600) // 60
        
        response = {
            "status": "healthy",
            "service": "Promotions API",
            "uptime": f"{uptime_hours}h {uptime_minutes}m",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        }
        
        self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
    
    def _send_error(self, status_code, message):
        """Enviar resposta de erro"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        error_response = {
            "success": False,
            "error": message,
            "timestamp": datetime.now().isoformat()
        }
        
        self.wfile.write(json.dumps(error_response, ensure_ascii=False).encode('utf-8'))

def run_server():
    """Executar servidor de promoções"""
    global start_time
    start_time = time.time()
    
    server_address = ('', 3002)  # Porta 3002 para não conflitar com configurações (3001)
    httpd = HTTPServer(server_address, PromotionsHandler)
    
    print("🚀 Backend Promotions Server rodando na porta 3002")
    print("📊 Arquivo de promoções: megapromocoes_promotions.json")
    print("🌐 Endpoints disponíveis:")
    print("   GET  /api/promotions - Listar promoções")
    print("   GET  /api/promotions/stats - Estatísticas")
    print("   POST /api/promotions/generate-ai - Gerar texto IA")
    print("   GET  /api/health - Status do servidor")
    print("-" * 50)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("🛑 Backend Promotions Server interrompido")
        httpd.shutdown()

if __name__ == '__main__':
    run_server()