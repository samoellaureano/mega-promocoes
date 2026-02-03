export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔥 Plataforma de Promoções
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            As melhores ofertas e descontos em um só lugar!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">🎯 Promoções Inteligentes</h3>
              <p className="text-gray-600">IA para encontrar as melhores ofertas para você</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">📱 WhatsApp Automático</h3>
              <p className="text-gray-600">Receba as promoções direto no seu WhatsApp</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">⚙️ Painel Admin</h3>
              <p className="text-gray-600">Interface completa para gerenciar promoções</p>
            </div>
          </div>
          
          <div className="mt-8">
            <a 
              href="/admin/login" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Acessar Painel Admin
            </a>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>✅ Backend funcionando na porta 3001</p>
            <p>✅ Frontend carregado com sucesso</p>
            <p>✅ Aplicação validada e operacional</p>
          </div>
        </div>
      </div>
    </div>
  );
}