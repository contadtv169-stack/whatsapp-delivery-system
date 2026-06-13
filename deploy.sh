#!/bin/bash
# ============================================
# WhatsApp Delivery System - Deploy VPS
# ============================================
# Uso: bash deploy.sh
# Requer: Node 18+, npm, git, pm2

set -e

echo "🚀 Iniciando deploy do WhatsApp Delivery System..."

# 1. Variáveis
REPO_URL="https://github.com/contadtv169-stack/whatsapp-delivery-system.git"
APP_DIR="/home/deploy/whatsapp-delivery"
NODE_VERSION="18"

# 2. Instalar dependências do sistema
echo "📦 Instalando dependências do sistema..."
sudo apt update && sudo apt install -y curl git build-essential

# 3. Instalar Node.js
echo "⬇️ Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Instalar PM2 globalmente
echo "⚙️ Instalando PM2..."
sudo npm install -g pm2

# 5. Instalar Chrome para whatsapp-web.js
echo "🌐 Instalando Google Chrome..."
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
sudo apt update && sudo apt install -y google-chrome-stable

# 6. Clonar/Atualizar repositório
if [ -d "$APP_DIR" ]; then
  echo "🔄 Atualizando repositório..."
  cd $APP_DIR
  git pull origin main
else
  echo "📥 Clonando repositório..."
  git clone $REPO_URL $APP_DIR
  cd $APP_DIR
fi

# 7. Instalar dependências npm
echo "📦 Instalando dependências npm..."
npm install --omit=dev

# 8. Build
echo "🔨 Buildando aplicação..."
npm run build

# 9. Configurar PM2
echo "⚙️ Configurando PM2..."
pm2 delete whatsapp-delivery 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy

# 10. Configurar Nginx (opcional)
echo "🔧 Configurando Nginx..."
sudo apt install -y nginx
sudo tee /etc/nginx/sites-available/whatsapp-delivery << 'NGINX'
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    client_max_body_size 50M;
}
NGINX

# 11. Configurar SSL (opcional - requer domínio)
# sudo apt install -y certbot python3-certbot-nginx
# sudo certbot --nginx -d $DOMAIN

echo ""
echo "✅ Deploy concluído!"
echo "📱 Aplicação rodando em: http://0.0.0.0:3000"
echo "🔐 Admin: http://SEU_IP:3000/admin"
echo ""
echo "Comandos úteis:"
echo "  pm2 status              - Ver status"
echo "  pm2 logs whatsapp-delivery - Ver logs"
echo "  pm2 restart whatsapp-delivery - Reiniciar"
