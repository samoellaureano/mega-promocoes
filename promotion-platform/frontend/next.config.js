/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'images.unsplash.com',
      'via.placeholder.com',
      // Adicionar domínios de imagens das lojas
      'm.media-amazon.com',
      'http2.mlstatic.com',
      'ae01.alicdn.com',
      'cf.shopee.com.br',
      'images-americanas.b2w.io'
    ],
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  }
};

module.exports = nextConfig;