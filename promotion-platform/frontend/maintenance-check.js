// Sistema de verificação de modo manutenção
(function() {
    'use strict';
    
    // Verificar se estamos na página de login admin (permitida durante manutenção)
    const currentPage = window.location.pathname.split('/').pop();
    const adminPages = ['admin-login.html', 'admin-dashboard.html', 'admin-settings.html', 'admin-promotions.html', 
                       'admin-ia-generator.html', 'admin-whatsapp.html', 'admin-scraping.html', 
                       'admin-analytics.html', 'admin-logs.html'];
    
    const isAdminPage = adminPages.includes(currentPage);
    
    // Verificar modo manutenção
    const maintenanceMode = localStorage.getItem('maintenanceMode') === 'true';
    
    if (maintenanceMode && !isAdminPage) {
        // Bloquear acesso para usuários comuns
        document.addEventListener('DOMContentLoaded', function() {
            // Salvar conteúdo original
            const originalContent = document.body.innerHTML;
            
            // Mostrar página de manutenção
            document.body.innerHTML = `
                <div class="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center p-4">
                    <div class="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
                        <div class="mb-6">
                            <div class="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                                <span class="text-4xl">🚧</span>
                            </div>
                            <h1 class="text-2xl font-bold text-gray-900 mb-2">Sistema em Manutenção</h1>
                            <p class="text-gray-600">
                                Estamos realizando melhorias no sistema. 
                                Voltaremos em breve!
                            </p>
                        </div>
                        
                        <div class="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 class="font-semibold text-gray-900 mb-2">🔥 MegaPromoções Brasil 2026</h3>
                            <p class="text-sm text-gray-600">
                                • Atualizando base de dados<br>
                                • Melhorando performance<br>
                                • Novas funcionalidades em breve
                            </p>
                        </div>
                        
                        <div class="text-sm text-gray-500 mb-4">
                            <p>Tempo estimado: <span class="font-semibold text-orange-600">30 minutos</span></p>
                            <p>Última atualização: <span id="maintenanceTime">${new Date().toLocaleString('pt-BR')}</span></p>
                        </div>
                        
                        <div class="flex flex-col space-y-3">
                            <button onclick="location.reload()" class="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                                🔄 Verificar Novamente
                            </button>
                            
                            <a href="mailto:contato@megapromocoes.com.br" class="text-orange-600 hover:text-orange-700 text-sm">
                                📧 Entrar em contato
                            </a>
                        </div>
                        
                        <!-- Admin Access -->
                        <div class="mt-8 pt-4 border-t border-gray-200">
                            <a href="admin-login.html" class="text-xs text-gray-400 hover:text-gray-600">
                                Acesso Administrativo
                            </a>
                        </div>
                    </div>
                    
                    <!-- Auto-refresh a cada 30 segundos -->
                    <script>
                        setTimeout(function() {
                            const maintenanceMode = localStorage.getItem('maintenanceMode') === 'true';
                            if (!maintenanceMode) {
                                location.reload();
                            }
                        }, 30000);
                        
                        // Atualizar timestamp a cada minuto
                        setInterval(function() {
                            document.getElementById('maintenanceTime').textContent = new Date().toLocaleString('pt-BR');
                        }, 60000);
                    </script>
                </div>
            `;
        });
    }
})();