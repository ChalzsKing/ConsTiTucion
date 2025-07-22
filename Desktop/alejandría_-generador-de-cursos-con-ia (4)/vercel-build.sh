#!/bin/bash
set -e

echo "--- Starting Vercel Build Script ---"

# 1. Crear el directorio de salida
echo "[1/3] Creating public directory..."
mkdir public

# 2. Copiar todos los archivos necesarios
echo "[2/3] Copying project files..."
cp index.html public/
cp index.tsx public/
cp App.tsx public/
cp types.ts public/
cp metadata.json public/
cp -r components public/
cp -r hooks public/
cp -r services public/
echo "Files copied."

# 3. Inyectar las variables de entorno
echo "[3/3] Injecting environment variables..."
# Reemplaza los marcadores de posición con los valores reales de las variables de Vercel
sed -i "s|process.env.API_KEY|'$API_KEY'|g" public/services/geminiService.ts
sed -i "s|process.env.VERCEL_PUBLIC_GOOGLE_CLIENT_ID|'$VERCEL_PUBLIC_GOOGLE_CLIENT_ID'|g" public/index.tsx
sed -i "s|process.env.VERCEL_PUBLIC_GOOGLE_CLIENT_ID|'$VERCEL_PUBLIC_GOOGLE_CLIENT_ID'|g" public/components/LoginScreen.tsx
sed -i "s|process.env.VERCEL_PUBLIC_GOOGLE_CLIENT_ID|'$VERCEL_PUBLIC_GOOGLE_CLIENT_ID'|g" public/components/Sidebar.tsx
echo "--- Build process completed. ---"