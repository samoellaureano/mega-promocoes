import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rota básica da API
app.get('/api', (req, res) => {
  res.json({ message: 'PromoFire API funcionando!', version: '1.0.0' });
});

// Rota para listar promoções (mockada)
app.get('/api/promotions', (req, res) => {
  res.json({
    promotions: [
      {
        id: '1',
        title: 'Notebook Gamer - Oferta Imperdível!',
        originalPrice: 2500.00,
        promoPrice: 1999.99,
        discountPercent: 20,
        store: 'TechStore',
        category: 'Eletrônicos',
        imageUrl: 'https://via.placeholder.com/300x200',
        productUrl: 'https://exemplo.com',
        generatedText: '🔥 Queima total! Notebook que vai fazer seu chefe pensar que você virou gênio da informática!',
        relevanceScore: 85,
        createdAt: new Date().toISOString()
      }
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
      pages: 1
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});

export default app;