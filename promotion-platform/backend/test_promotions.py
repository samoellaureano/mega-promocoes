#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
🧪 Teste de Validação do Sistema de Promoções
Verificar se todos os endpoints estão funcionando corretamente
"""

import requests
import json
import time
from datetime import datetime

def test_promotions_system():
    """Executar suite completa de testes"""
    base_url = "http://localhost:3002/api"
    results = {
        "timestamp": datetime.now().isoformat(),
        "tests": [],
        "summary": {"passed": 0, "failed": 0, "total": 0}
    }
    
    print("🧪 Iniciando Validação do Sistema de Promoções")
    print("=" * 60)
    
    # Teste 1: Health Check
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        
        results["tests"].append({"name": "Health Check", "status": "✅ PASSOU", "details": f"Uptime: {data.get('uptime', 'N/A')}"})
        results["summary"]["passed"] += 1
        print("✅ Health Check: PASSOU")
        
    except Exception as e:
        results["tests"].append({"name": "Health Check", "status": "❌ FALHOU", "error": str(e)})
        results["summary"]["failed"] += 1
        print(f"❌ Health Check: FALHOU - {e}")
    
    # Teste 2: Listar Promoções
    try:
        response = requests.get(f"{base_url}/promotions?page=1&limit=10", timeout=5)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "promotions" in data["data"]
        assert len(data["data"]["promotions"]) > 0
        
        promo_count = len(data["data"]["promotions"])
        total_count = data["data"]["pagination"]["total"]
        
        results["tests"].append({
            "name": "Listar Promoções", 
            "status": "✅ PASSOU", 
            "details": f"Carregadas {promo_count} de {total_count} promoções"
        })
        results["summary"]["passed"] += 1
        print(f"✅ Listar Promoções: PASSOU ({promo_count} promoções encontradas)")
        
    except Exception as e:
        results["tests"].append({"name": "Listar Promoções", "status": "❌ FALHOU", "error": str(e)})
        results["summary"]["failed"] += 1
        print(f"❌ Listar Promoções: FALHOU - {e}")
    
    # Teste 3: Estatísticas
    try:
        response = requests.get(f"{base_url}/promotions/stats", timeout=5)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert "totalPromotions" in data["data"]
        assert data["data"]["totalPromotions"] > 0
        
        stats = data["data"]
        results["tests"].append({
            "name": "Estatísticas", 
            "status": "✅ PASSOU", 
            "details": f"Total: {stats['totalPromotions']}, Ativas: {stats['activePromotions']}, Desconto médio: {stats['averageDiscount']}%"
        })
        results["summary"]["passed"] += 1
        print(f"✅ Estatísticas: PASSOU (Total: {stats['totalPromotions']}, Ativas: {stats['activePromotions']})")
        
    except Exception as e:
        results["tests"].append({"name": "Estatísticas", "status": "❌ FALHOU", "error": str(e)})
        results["summary"]["failed"] += 1
        print(f"❌ Estatísticas: FALHOU - {e}")
    
    # Teste 4: Geração IA
    try:
        payload = {"promotionId": "promo_001"}
        response = requests.post(f"{base_url}/promotions/generate-ai", json=payload, timeout=5)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        assert len(data["data"]["generatedText"]) > 0
        
        ai_text = data["data"]["generatedText"]
        results["tests"].append({
            "name": "Geração IA", 
            "status": "✅ PASSOU", 
            "details": f"Texto gerado: '{ai_text[:50]}...'"
        })
        results["summary"]["passed"] += 1
        print(f"✅ Geração IA: PASSOU (Texto: '{ai_text[:30]}...')")
        
    except Exception as e:
        results["tests"].append({"name": "Geração IA", "status": "❌ FALHOU", "error": str(e)})
        results["summary"]["failed"] += 1
        print(f"❌ Geração IA: FALHOU - {e}")
    
    # Teste 5: Filtros
    try:
        response = requests.get(f"{base_url}/promotions?store=amazon&category=eletrônicos", timeout=5)
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == True
        
        promotions = data["data"]["promotions"]
        amazon_promos = [p for p in promotions if "amazon" in p.get("store", "").lower()]
        
        results["tests"].append({
            "name": "Sistema de Filtros", 
            "status": "✅ PASSOU", 
            "details": f"Encontradas {len(amazon_promos)} promoções da Amazon"
        })
        results["summary"]["passed"] += 1
        print(f"✅ Sistema de Filtros: PASSOU ({len(amazon_promos)} promoções filtradas)")
        
    except Exception as e:
        results["tests"].append({"name": "Sistema de Filtros", "status": "❌ FALHOU", "error": str(e)})
        results["summary"]["failed"] += 1
        print(f"❌ Sistema de Filtros: FALHOU - {e}")
    
    # Teste 6: Validação de Dados
    try:
        response = requests.get(f"{base_url}/promotions?page=1&limit=5", timeout=5)
        data = response.json()
        promotions = data["data"]["promotions"]
        
        validation_errors = []
        
        for promo in promotions:
            # Verificar campos obrigatórios
            required_fields = ["id", "title", "originalPrice", "promoPrice", "discountPercent", "store"]
            for field in required_fields:
                if field not in promo:
                    validation_errors.append(f"Campo '{field}' ausente em {promo.get('id', 'produto desconhecido')}")
            
            # Verificar lógica de preços
            if promo.get("promoPrice", 0) > promo.get("originalPrice", 0):
                validation_errors.append(f"Preço promocional maior que original em {promo.get('title', 'produto')}")
            
            # Verificar desconto
            expected_discount = round((1 - promo.get("promoPrice", 1) / promo.get("originalPrice", 1)) * 100)
            actual_discount = promo.get("discountPercent", 0)
            if abs(expected_discount - actual_discount) > 1:  # Tolerância de 1%
                validation_errors.append(f"Desconto incorreto em {promo.get('title')}: esperado ~{expected_discount}%, obtido {actual_discount}%")
        
        if len(validation_errors) == 0:
            results["tests"].append({
                "name": "Validação de Dados", 
                "status": "✅ PASSOU", 
                "details": f"Todos os {len(promotions)} produtos validados com sucesso"
            })
            results["summary"]["passed"] += 1
            print(f"✅ Validação de Dados: PASSOU ({len(promotions)} produtos validados)")
        else:
            raise Exception(f"Encontrados {len(validation_errors)} erros: {validation_errors[:3]}")
        
    except Exception as e:
        results["tests"].append({"name": "Validação de Dados", "status": "❌ FALHOU", "error": str(e)})
        results["summary"]["failed"] += 1
        print(f"❌ Validação de Dados: FALHOU - {e}")
    
    # Calcular totais
    results["summary"]["total"] = results["summary"]["passed"] + results["summary"]["failed"]
    success_rate = (results["summary"]["passed"] / results["summary"]["total"]) * 100 if results["summary"]["total"] > 0 else 0
    
    print("\n" + "=" * 60)
    print(f"🏁 RESUMO DOS TESTES")
    print(f"✅ Passou: {results['summary']['passed']}")
    print(f"❌ Falhou: {results['summary']['failed']}")
    print(f"📊 Taxa de Sucesso: {success_rate:.1f}%")
    print("=" * 60)
    
    # Salvar relatório
    report_file = f"test_report_promotions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    try:
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"📄 Relatório salvo em: {report_file}")
    except Exception as e:
        print(f"⚠️ Erro ao salvar relatório: {e}")
    
    return results

if __name__ == "__main__":
    try:
        test_promotions_system()
    except KeyboardInterrupt:
        print("\n🛑 Testes interrompidos pelo usuário")
    except Exception as e:
        print(f"\n💥 Erro crítico: {e}")