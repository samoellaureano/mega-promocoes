#!/bin/bash

# Script para corrigir tipagem TypeScript

echo "🔧 Corrigindo tipagem TypeScript..."

# Corrigir imports nos arquivos de rotas
find promotion-platform/backend/src -name "*.ts" -exec sed -i 's/import express from/import express, { Request, Response } from/g' {} \;
find promotion-platform/backend/src -name "*.ts" -exec sed -i 's/import cors from/import cors from/g' {} \;
find promotion-platform/backend/src -name "*.ts" -exec sed -i 's/import bcrypt from/import bcrypt from/g' {} \;
find promotion-platform/backend/src -name "*.ts" -exec sed -i 's/import jwt from/import jwt from/g' {} \;

# Corrigir parâmetros de função
find promotion-platform/backend/src -name "*.ts" -exec sed -i 's/(req, res)/(req: Request, res: Response)/g' {} \;
find promotion-platform/backend/src -name "*.ts" -exec sed -i 's/(req: any, res: any, next: any)/(req: Request, res: Response, next: any)/g' {} \;

echo "✅ Tipagem corrigida!"