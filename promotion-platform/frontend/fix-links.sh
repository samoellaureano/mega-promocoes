#!/bin/bash

# Script para corrigir links de navegação em todas as páginas admin

files=(
  "admin-promotions.html"
  "admin-ia-generator.html"
  "admin-whatsapp.html"
  "admin-scraping.html"
  "admin-settings.html"
  "admin-analytics.html"
  "admin-logs.html"
)

cd /mnt/c/PROJETOS_PESSOAIS/DP/promotion-platform/frontend

for file in "${files[@]}"; do
  echo "Corrigindo $file..."
  
  # Corrigir links do menu
  sed -i 's|href="/admin/dashboard"|href="admin-dashboard.html"|g' "$file"
  sed -i 's|href="/admin/promotions"|href="admin-promotions.html"|g' "$file"
  sed -i 's|href="/admin/ia-generator"|href="admin-ia-generator.html"|g' "$file"
  sed -i 's|href="/admin/whatsapp"|href="admin-whatsapp.html"|g' "$file"
  sed -i 's|href="/admin/scraping"|href="admin-scraping.html"|g' "$file"
  sed -i 's|href="/admin/settings"|href="admin-settings.html"|g' "$file"
  sed -i 's|href="/admin/analytics"|href="admin-analytics.html"|g' "$file"
  sed -i 's|href="/admin/logs"|href="admin-logs.html"|g' "$file"
  sed -i 's|href="/"|href="index.html"|g' "$file"
  sed -i 's|href="/admin"|href="admin-login.html"|g' "$file"
  
  echo "$file corrigido!"
done

echo "Todos os arquivos foram corrigidos!"