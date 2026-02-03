import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const prisma = new PrismaClient();

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '24h' }
    );

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      } 
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar primeiro usuário admin
router.post('/setup', async (req: Request, res: Response) => {
  try {
    const userCount = await prisma.user.count();
    
    if (userCount > 0) {
      return res.status(400).json({ error: 'Sistema já foi configurado' });
    }

    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN'
      }
    });

    res.json({ message: 'Admin criado com sucesso', userId: user.id });

  } catch (error) {
    console.error('Erro no setup:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;