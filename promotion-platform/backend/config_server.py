#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Backend simples para persistência de configurações
MegaPromoções Brasil 2026
"""

import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
from datetime import datetime

class ConfigHandler(BaseHTTPRequestHandler):
    CONFIG_FILE = 'megapromocoes_config.json'
    
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/config':
            self._get_config()
        elif parsed_path.path == '/api/health':
            self._health_check()
        else:
            self.send_error(404, "Endpoint not found")

    def do_POST(self):
        if self.path == '/api/config/save':
            self._save_config()
        else:
            self.send_error(404, "Endpoint not found")

    def _get_config(self):
        """Carregar configurações do arquivo"""
        try:
            if os.path.exists(self.CONFIG_FILE):
                with open(self.CONFIG_FILE, 'r', encoding='utf-8') as f:
                    config_data = json.load(f)
                    
                response = {
                    'success': True,
                    'data': config_data,
                    'message': 'Configurações carregadas do backend'
                }
            else:
                response = {
                    'success': False,
                    'data': None,
                    'message': 'Nenhuma configuração salva no backend'
                }
                
            self._set_headers()
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            self._set_headers()
            error_response = {
                'success': False,
                'error': str(e),
                'message': 'Erro ao carregar configurações'
            }
            self.wfile.write(json.dumps(error_response).encode('utf-8'))

    def _save_config(self):
        """Salvar configurações no arquivo"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            config_data = json.loads(post_data.decode('utf-8'))
            
            # Adicionar metadados
            save_data = {
                'settings': config_data.get('settings', {}),
                'timestamp': datetime.now().isoformat(),
                'version': '2.1.0',
                'platform': 'MegaPromoções Brasil 2026',
                'environment': 'production',
                'backup_count': self._get_backup_count() + 1
            }
            
            # Salvar no arquivo principal
            with open(self.CONFIG_FILE, 'w', encoding='utf-8') as f:
                json.dump(save_data, f, indent=2, ensure_ascii=False)
            
            # Criar backup com timestamp
            backup_name = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(backup_name, 'w', encoding='utf-8') as f:
                json.dump(save_data, f, indent=2, ensure_ascii=False)
                
            response = {
                'success': True,
                'timestamp': save_data['timestamp'],
                'syncId': f"sync_{int(datetime.now().timestamp())}",
                'backup_file': backup_name,
                'message': 'Configurações salvas no backend com sucesso'
            }
            
            self._set_headers()
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            
        except Exception as e:
            self._set_headers()
            error_response = {
                'success': False,
                'error': str(e),
                'message': 'Erro ao salvar configurações no backend'
            }
            self.wfile.write(json.dumps(error_response).encode('utf-8'))

    def _health_check(self):
        """Verificar saúde do backend"""
        health_data = {
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'version': '2.1.0',
            'config_exists': os.path.exists(self.CONFIG_FILE),
            'backup_count': self._get_backup_count()
        }
        
        self._set_headers()
        self.wfile.write(json.dumps(health_data, ensure_ascii=False).encode('utf-8'))

    def _get_backup_count(self):
        """Contar arquivos de backup"""
        return len([f for f in os.listdir('.') if f.startswith('backup_') and f.endswith('.json')])

    def log_message(self, format, *args):
        """Override para log customizado"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] Backend Config: {format % args}")

def start_backend_server(port=3001):
    """Iniciar servidor backend"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, ConfigHandler)
    print(f"🚀 Backend Config Server rodando na porta {port}")
    print(f"📁 Arquivo de config: {ConfigHandler.CONFIG_FILE}")
    httpd.serve_forever()

if __name__ == '__main__':
    try:
        start_backend_server()
    except KeyboardInterrupt:
        print("\n🛑 Backend Config Server interrompido")
    except Exception as e:
        print(f"❌ Erro no servidor: {e}")