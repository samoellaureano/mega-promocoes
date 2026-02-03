import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware de autenticação admin (simplificado)
const requireAdmin = (req: any, res: any, next: any) => {
  // TODO: Implementar autenticação JWT completa
  next();
};

// Criptografia para valores sensíveis
const encrypt = (text: string): string => {
  const key = process.env.ENCRYPTION_KEY || 'default_key_change_in_production_32';
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const decrypt = (encryptedText: string): string => {
  const key = process.env.ENCRYPTION_KEY || 'default_key_change_in_production_32';
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Listar todas as configurações por categoria
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { category } = req.query;
    
    const where = category ? { category: category as string } : {};
    
    const configs = await prisma.configuration.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    });

    // Descriptografar valores sensíveis para exibição
    const processedConfigs = configs.map(config => ({
      ...config,
      value: config.encrypted ? '••••••••' : config.value,
      actualValue: config.encrypted ? decrypt(config.value) : config.value
    }));

    res.json(processedConfigs);

  } catch (error) {
    console.error('Erro ao listar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter configuração específica
router.get('/:key', requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    
    const config = await prisma.configuration.findUnique({
      where: { key }
    });

    if (!config) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    res.json({
      ...config,
      value: config.encrypted ? decrypt(config.value) : config.value
    });

  } catch (error) {
    console.error('Erro ao obter configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar ou atualizar configuração
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { key, value, type = 'string', category = 'general', encrypted = false } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key e value são obrigatórios' });
    }

    const finalValue = encrypted ? encrypt(value) : value;

    const config = await prisma.configuration.upsert({
      where: { key },
      update: {
        value: finalValue,
        type,
        category,
        encrypted,
        updatedAt: new Date()
      },
      create: {
        key,
        value: finalValue,
        type,
        category,
        encrypted
      }
    });

    res.json({
      ...config,
      value: encrypted ? '••••••••' : config.value
    });

  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar configuração específica
router.patch('/:key', requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { value, type, category, encrypted } = req.body;

    const existing = await prisma.configuration.findUnique({
      where: { key }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    const updateData: any = { updatedAt: new Date() };
    
    if (value !== undefined) {
      updateData.value = (encrypted ?? existing.encrypted) ? encrypt(value) : value;
    }
    if (type) updateData.type = type;
    if (category) updateData.category = category;
    if (encrypted !== undefined) updateData.encrypted = encrypted;

    const config = await prisma.configuration.update({
      where: { key },
      data: updateData
    });

    res.json({
      ...config,
      value: config.encrypted ? '••••••••' : config.value
    });

  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar configuração
router.delete('/:key', requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;

    await prisma.configuration.delete({
      where: { key }
    });

    res.json({ message: 'Configuração removida com sucesso' });

  } catch (error) {
    console.error('Erro ao deletar configuração:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Obter configurações agrupadas por categoria
router.get('/grouped/categories', requireAdmin, async (req, res) => {
  try {
    const configs = await prisma.configuration.findMany({
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    });

    const grouped = configs.reduce((acc: any, config) => {
      if (!acc[config.category]) {
        acc[config.category] = [];
      }
      
      acc[config.category].push({
        ...config,
        value: config.encrypted ? '••••••••' : config.value,
        actualValue: config.encrypted ? decrypt(config.value) : config.value
      });
      
      return acc;
    }, {});

    res.json(grouped);

  } catch (error) {
    console.error('Erro ao agrupar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Testar conexões (WhatsApp, OpenAI, etc.)
router.post('/test-connections', requireAdmin, async (req, res) => {
  try {
    const results: any = {};

    // Testar Twilio/WhatsApp
    try {
      const accountSid = await prisma.configuration.findUnique({ where: { key: 'TWILIO_ACCOUNT_SID' } });
      const authToken = await prisma.configuration.findUnique({ where: { key: 'TWILIO_AUTH_TOKEN' } });
      
      if (accountSid && authToken) {
        const twilio = require('twilio')(
          accountSid.encrypted ? decrypt(accountSid.value) : accountSid.value,
          authToken.encrypted ? decrypt(authToken.value) : authToken.value
        );
        
        const account = await twilio.api.accounts(accountSid.value).fetch();
        results.whatsapp = {
          status: 'connected',
          accountName: account.friendlyName,
          accountStatus: account.status
        };
      } else {
        results.whatsapp = { status: 'not_configured' };
      }
    } catch (error) {
      results.whatsapp = { status: 'error', error: error.message };
    }

    // Testar OpenAI
    try {
      const openaiKey = await prisma.configuration.findUnique({ where: { key: 'OPENAI_API_KEY' } });
      
      if (openaiKey) {
        const OpenAI = require('openai');
        const openai = new OpenAI({
          apiKey: openaiKey.encrypted ? decrypt(openaiKey.value) : openaiKey.value
        });
        
        await openai.models.list();
        results.openai = { status: 'connected' };
      } else {
        results.openai = { status: 'not_configured' };
      }
    } catch (error) {
      results.openai = { status: 'error', error: error.message };
    }

    // Testar Database
    try {
      await prisma.$queryRaw`SELECT 1`;
      results.database = { status: 'connected' };
    } catch (error) {
      results.database = { status: 'error', error: error.message };
    }

    res.json(results);

  } catch (error) {
    console.error('Erro ao testar conexões:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Importar configurações de arquivo
router.post('/import', requireAdmin, async (req, res) => {
  try {
    const { configurations } = req.body;

    if (!Array.isArray(configurations)) {
      return res.status(400).json({ error: 'Formato inválido' });
    }

    const imported: any[] = [];
    const errors: any[] = [];

    for (const config of configurations) {
      try {
        const { key, value, type, category, encrypted } = config;
        
        if (!key || value === undefined) {
          errors.push({ config, error: 'Key e value obrigatórios' });
          continue;
        }

        const finalValue = encrypted ? encrypt(value) : value;

        const saved = await prisma.configuration.upsert({
          where: { key },
          update: {
            value: finalValue,
            type: type || 'string',
            category: category || 'general',
            encrypted: encrypted || false,
            updatedAt: new Date()
          },
          create: {
            key,
            value: finalValue,
            type: type || 'string',
            category: category || 'general',
            encrypted: encrypted || false
          }
        });

        imported.push(saved);

      } catch (error) {
        errors.push({ config, error: error.message });
      }
    }

    res.json({
      imported: imported.length,
      errors: errors.length,
      details: { imported, errors }
    });

  } catch (error) {
    console.error('Erro ao importar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Exportar configurações
router.get('/export/all', requireAdmin, async (req, res) => {
  try {
    const { includeValues = false } = req.query;
    
    const configs = await prisma.configuration.findMany({
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    });

    const exported = configs.map(config => ({
      key: config.key,
      value: includeValues === 'true' 
        ? (config.encrypted ? decrypt(config.value) : config.value)
        : (config.encrypted ? '••••••••' : config.value),
      type: config.type,
      category: config.category,
      encrypted: config.encrypted
    }));

    res.json(exported);

  } catch (error) {
    console.error('Erro ao exportar configurações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;