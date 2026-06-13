#!/bin/bash
# ============================================
# WhatsApp Delivery - Setup VPS 24/7
# ============================================
# Rode como root: bash setup-vps.sh
# Requer: Ubuntu 20.04+ ou Debian 11+

set -e

echo "=========================================="
echo " WhatsApp Delivery System - Setup VPS 24/7"
echo "=========================================="

# 1. System update
echo "[1/8] Atualizando sistema..."
apt update && apt upgrade -y

# 2. Install dependencies
echo "[2/8] Instalando dependências..."
apt install -y curl git wget gnupg ca-certificates \
  fonts-liberation libappindicator3-1 libasound2 \
  libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 \
  libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 \
  libxcomposite1 libxdamage1 libxrandr2 xdg-utils \
  build-essential nginx

# 3. Install Node.js 20
echo "[3/8] Instalando Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 4. Install Chrome
echo "[4/8] Instalando Google Chrome..."
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg
echo "deb [signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list
apt update && apt install -y google-chrome-stable

# 5. Install PM2
echo "[5/8] Instalando PM2..."
npm install -g pm2

# 6. Clone project
echo "[6/8] Clonando projeto..."
cd /opt
if [ -d "whatsapp-delivery" ]; then
  cd whatsapp-delivery && git pull
else
  git clone https://github.com/contadtv169-stack/whatsapp-delivery-system.git whatsapp-delivery
  cd whatsapp-delivery
fi

# 7. Install deps and build
echo "[7/8] Instalando dependências e buildando..."
npm install
npm run build
npm prune --omit=dev

# 8. Start with PM2 (24/7)
echo "[8/8] Iniciando serviço 24/7..."
pm2 delete whatsapp-delivery 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

echo ""
echo "=========================================="
echo " ✅ Setup concluído!"
echo "=========================================="
echo ""
echo " 🌐 Acessar: http://$(curl -s ifconfig.me):3000"
echo " 🔐 Admin:   http://$(curl -s ifconfig.me):3000/admin"
echo ""
echo " 📋 Comandos úteis:"
echo "    pm2 status              - Status dos serviços"
echo "    pm2 logs whatsapp-delivery - Ver logs"
echo "    pm2 restart whatsapp-delivery - Reiniciar"
echo "    pm2 stop whatsapp-delivery  - Parar"
echo ""
echo " 🩺 Health check: http://$(curl -s ifconfig.me):3000/api/health"
echo ""
