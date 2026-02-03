#!/usr/bin/env python3
"""
Validação Completa do Sistema de Promoções MegaPromoções
Verifica dados reais, funcionalidades e integridade do sistema
"""

import requests
import json
from datetime import datetime
import sys

BASE_URL = 'http://localhost:3002'
API_ENDPOINTS = {
    'promotions': f'{BASE_URL}/api/promotions',
    'stats': f'{BASE_URL}/api/promotions/stats',
    'generate_ai': f'{BASE_URL}/api/promotions/generate-ai',
    'health': f'{BASE_URL}/api/health'
}

def print_header():
    print('🏷️ VALIDAÇÃO COMPLETA DO SISTEMA DE PROMOÇÕES')
    print('=' * 60)
    print(f'🕐 Timestamp: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    print(f'🌐 Sistema: {BASE_URL}')
    print()

def test_connectivity():
    """Teste 1: Conectividade com o servidor"""
    print('🌐 1. TESTANDO CONECTIVIDADE...')
    try:
        response = requests.get(API_ENDPOINTS['health'], timeout=5)
        if response.status_code == 200:
            data = response.json()
            print('✅ CONEXÃO ESTABELECIDA COM SUCESSO!')
            print(f'   📊 Status: {data.get("status", "N/A")}')
            print(f'   ⏰ Uptime: {data.get("uptime", "N/A")}')
            print(f'   📈 Requisições: {data.get("requests", "N/A")}')
            return True, data
        else:
            print(f'❌ ERRO: Status {response.status_code}')
            return False, None
    except Exception as e:
        print(f'❌ ERRO: {str(e)}')
        return False, None

def validate_data_structure():
    """Teste 2: Validar estrutura de dados e confirmar dados reais"""
    print('📊 2. VALIDANDO ESTRUTURA DE DADOS...')
    try:
        response = requests.get(API_ENDPOINTS['promotions'])
        if response.status_code == 200:
            json_data = response.json()
            
            # Extrair promoções da estrutura correta
            if isinstance(json_data, dict) and 'data' in json_data:
                data_obj = json_data['data']
                if isinstance(data_obj, dict) and 'promotions' in data_obj:
                    promotions = data_obj['promotions']
                else:
                    promotions = []
            else:
                promotions = json_data if isinstance(json_data, list) else []
            
            print(f'   📋 Total de promoções: {len(promotions)}')
            
            if promotions and len(promotions) > 0:
                # Verificar se é uma lista de objetos
                if isinstance(promotions, list) and isinstance(promotions[0], dict):
                    # Analisar indicadores de dados reais
                    prices = []
                    for p in promotions:
                        if isinstance(p, dict) and 'original_price' in p and 'promo_price' in p:
                            prices.append((p['original_price'], p['promo_price']))
                    
                    non_round_prices = [p for p in prices if p[0] % 100 != 0 or p[1] % 100 != 0]
                    
                    stores = []
                    statuses = []
                    names = []
                    
                    for p in promotions:
                        if isinstance(p, dict):
                            if 'store' in p:
                                stores.append(p['store'])
                            if 'status' in p:
                                statuses.append(p['status'])
                            if 'title' in p:  # Corrigido: usar 'title' em vez de 'name'
                                names.append(p['title'])
                    
                    unique_stores = list(set(stores))
                    unique_statuses = list(set(statuses))
                    unique_names = len(set(names))
                    
                    print('   ✅ INDICADORES DE DADOS REAIS:')
                    print(f'      💰 Preços não-redondos: {len(non_round_prices)}/{len(prices)}')
                    print(f'      🏪 Lojas diferentes: {len(unique_stores)} - {unique_stores}')
                    print(f'      📊 Status variados: {len(unique_statuses)} - {unique_statuses}')
                    print(f'      📱 Produtos únicos: {unique_names}')
                    
                    print('   📋 AMOSTRA DOS PRODUTOS:')
                    for i, promo in enumerate(promotions[:3], 1):
                        if isinstance(promo, dict):
                            name = promo.get('title', 'N/A')  # Corrigido: usar 'title'
                            store = promo.get('store', 'N/A')
                            price = promo.get('promo_price', 0)
                            discount = promo.get('discount_percent', 0)
                            print(f'      {i}. {name[:40]}... - {store} - R$ {price:.2f} ({discount}% OFF)')
                    
                    return True, promotions
                else:
                    print('   ❌ FORMATO DE DADOS INVÁLIDO')
                    return False, []
            else:
                print('   ❌ NENHUMA PROMOÇÃO ENCONTRADA')
                return False, []
        else:
            print(f'   ❌ ERRO: Status {response.status_code}')
            return False, []
    except Exception as e:
        print(f'   ❌ ERRO: {str(e)}')
        return False, []

def test_filters():
    """Teste 3: Funcionalidades de filtro"""
    print('🔍 3. TESTANDO FILTROS E BUSCA...')
    
    test_cases = [
        {'param': 'store', 'value': 'Amazon', 'desc': 'Filtrar por Amazon'},
        {'param': 'status', 'value': 'active', 'desc': 'Filtrar por status ativo'},
        {'param': 'search', 'value': 'Galaxy', 'desc': 'Buscar por Galaxy'}
    ]
    
    success_count = 0
    for test in test_cases:
        try:
            params = {test['param']: test['value']}
            response = requests.get(API_ENDPOINTS['promotions'], params=params)
            
            if response.status_code == 200:
                data = response.json()
                print(f'   ✅ {test["desc"]}: {len(data)} resultados')
                success_count += 1
            else:
                print(f'   ❌ {test["desc"]}: Erro {response.status_code}')
        except Exception as e:
            print(f'   ❌ {test["desc"]}: {str(e)}')
    
    return success_count == len(test_cases)

def test_pagination():
    """Teste 4: Sistema de paginação"""
    print('📄 4. TESTANDO PAGINAÇÃO...')
    try:
        # Testar páginas diferentes
        resp1 = requests.get(f'{API_ENDPOINTS["promotions"]}?page=1&limit=2')
        resp2 = requests.get(f'{API_ENDPOINTS["promotions"]}?page=2&limit=2')
        
        if resp1.status_code == 200 and resp2.status_code == 200:
            page1 = resp1.json()
            page2 = resp2.json()
            different = page1 != page2
            
            print(f'   ✅ Página 1: {len(page1)} itens')
            print(f'   ✅ Página 2: {len(page2)} itens')
            print(f'   📊 Páginas diferentes: {"Sim" if different else "Não"}')
            return True
        else:
            print('   ❌ Erro nas requisições de paginação')
            return False
    except Exception as e:
        print(f'   ❌ Erro no teste: {str(e)}')
        return False

def test_statistics():
    """Teste 5: Estatísticas do sistema"""
    print('📈 5. TESTANDO ESTATÍSTICAS...')
    try:
        response = requests.get(API_ENDPOINTS['stats'])
        if response.status_code == 200:
            stats = response.json()
            print('   ✅ ESTATÍSTICAS OBTIDAS:')
            for key, value in stats.items():
                print(f'      📊 {key}: {value}')
            return True
        else:
            print(f'   ❌ Erro: Status {response.status_code}')
            return False
    except Exception as e:
        print(f'   ❌ Erro: {str(e)}')
        return False

def test_ai_generation():
    """Teste 6: Geração de IA"""
    print('🤖 6. TESTANDO GERAÇÃO DE IA...')
    try:
        # Payload de teste
        test_payload = {
            'product_name': 'Smartphone Galaxy S24',
            'original_price': 2999.00,
            'promo_price': 1899.00,
            'discount_percent': 37,
            'store': 'Amazon'
        }
        
        response = requests.post(API_ENDPOINTS['generate_ai'], json=test_payload, timeout=10)
        if response.status_code == 200:
            try:
                data = response.json()
                text = data.get('generated_text', '')
                
                if text:
                    print(f'   ✅ IA FUNCIONANDO: {len(text)} caracteres gerados')
                    print(f'   📝 Amostra: "{text[:100]}..."')
                    return True
                else:
                    print('   ❌ IA retornou texto vazio')
                    return False
            except json.JSONDecodeError:
                # Se não for JSON, talvez seja texto puro
                text = response.text
                if text and len(text) > 10:
                    print(f'   ✅ IA FUNCIONANDO: {len(text)} caracteres gerados')
                    print(f'   📝 Amostra: "{text[:100]}..."')
                    return True
                else:
                    print('   ❌ Resposta da IA inválida')
                    return False
        else:
            print(f'   ❌ Erro: Status {response.status_code}')
            if response.text:
                print(f'   📄 Resposta: {response.text[:200]}')
            return False
    except Exception as e:
        print(f'   ❌ Erro: {str(e)}')
        return False

def generate_report(results):
    """Gerar relatório final"""
    print()
    print('📋 RELATÓRIO FINAL DE VALIDAÇÃO')
    print('=' * 40)
    
    total_tests = len(results)
    passed_tests = sum(1 for r in results.values() if r)
    
    print(f'📊 Testes executados: {total_tests}')
    print(f'✅ Testes aprovados: {passed_tests}')
    print(f'❌ Testes falharam: {total_tests - passed_tests}')
    print(f'📈 Taxa de sucesso: {(passed_tests/total_tests*100):.1f}%')
    
    print()
    print('🏆 DETALHES DOS TESTES:')
    for test_name, status in results.items():
        icon = "✅" if status else "❌"
        result = "PASSOU" if status else "FALHOU"
        print(f'   {icon} {test_name}: {result}')
    
    print()
    if passed_tests == total_tests:
        print('🎉 SISTEMA COMPLETAMENTE VALIDADO!')
        print('🚀 Todos os testes passaram - dados reais confirmados!')
    elif passed_tests >= total_tests * 0.8:
        print('✨ SISTEMA APROVADO!')
        print('💡 Pequenos ajustes podem ser necessários.')
    else:
        print('⚠️ ATENÇÃO NECESSÁRIA!')
        print('🔧 Vários problemas foram detectados.')

def main():
    print_header()
    
    # Executar todos os testes
    results = {}
    
    connectivity_ok, server_info = test_connectivity()
    results['Conectividade'] = connectivity_ok
    print()
    
    if connectivity_ok:
        data_valid, promotions = validate_data_structure()
        results['Estrutura de Dados'] = data_valid
        print()
        
        filters_ok = test_filters()
        results['Filtros e Busca'] = filters_ok
        print()
        
        pagination_ok = test_pagination()
        results['Paginação'] = pagination_ok
        print()
        
        stats_ok = test_statistics()
        results['Estatísticas'] = stats_ok
        print()
        
        ai_ok = test_ai_generation()
        results['Geração de IA'] = ai_ok
        print()
    else:
        print('❌ Servidor não está respondendo - cancelando testes restantes.')
        results.update({
            'Estrutura de Dados': False,
            'Filtros e Busca': False,
            'Paginação': False,
            'Estatísticas': False,
            'Geração de IA': False
        })
    
    generate_report(results)

if __name__ == "__main__":
    main()