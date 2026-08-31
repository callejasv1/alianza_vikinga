#!/bin/bash
# =====================================================
# Script de deploy automático a GitHub Pages
# Alianza Vikinga — App de Musicalización
# =====================================================
# 
# INSTRUCCIONES:
# 1. Crea el repositorio en GitHub:
#    https://github.com/new
#    Nombre sugerido: alianza-vikinga
#    Dejar en PUBLIC (requerido para GitHub Pages gratis)
#
# 2. Edita la variable GITHUB_USER abajo con tu usuario
#
# 3. Ejecuta este script:
#    chmod +x deploy.sh
#    ./deploy.sh

# ─── CONFIGURA ESTO ───────────────────────────────────
GITHUB_USER="callejasv1"        # ← Tu usuario de GitHub
REPO_NAME="alianza-vikinga"     # ← Nombre del repositorio
# ──────────────────────────────────────────────────────

set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
REMOTE_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

echo ""
echo "⚔️  Alianza Vikinga — Deploy a GitHub Pages"
echo "=============================================="
echo "  Usuario: $GITHUB_USER"
echo "  Repo:    $REPO_NAME"
echo "  URL:     https://${GITHUB_USER}.github.io/${REPO_NAME}/"
echo ""

# Init git si no existe
if [ ! -d "$APP_DIR/.git" ]; then
  echo "📦 Inicializando repositorio git..."
  git -C "$APP_DIR" init
  git -C "$APP_DIR" checkout -b main
fi

# Agregar remote
if git -C "$APP_DIR" remote | grep -q "origin"; then
  git -C "$APP_DIR" remote set-url origin "$REMOTE_URL"
  echo "🔗 Remote actualizado: $REMOTE_URL"
else
  git -C "$APP_DIR" remote add origin "$REMOTE_URL"
  echo "🔗 Remote agregado: $REMOTE_URL"
fi

# Stage all
echo "📋 Agregando archivos..."
git -C "$APP_DIR" add -A

# Commit
echo "💾 Creando commit..."
git -C "$APP_DIR" commit -m "⚔️ Alianza Vikinga - App de Musicalización v1.0" --allow-empty

# Push
echo "🚀 Haciendo push a GitHub..."
git -C "$APP_DIR" push -u origin main --force

echo ""
echo "✅ ¡Deploy completado!"
echo ""
echo "Próximo paso:"
echo "  1. Ve a https://github.com/${GITHUB_USER}/${REPO_NAME}/settings/pages"
echo "  2. En 'Source' selecciona: Deploy from a branch"
echo "  3. Branch: main | Folder: / (root)"
echo "  4. Clic en Save"
echo ""
echo "🌐 Tu app estará disponible en ~1 minuto en:"
echo "   https://${GITHUB_USER}.github.io/${REPO_NAME}/"
echo ""
