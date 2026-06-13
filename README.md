# WhatsApp Delivery System

Sistema de delivery inteligente com **WhatsApp**, **IA (OpenAI)** e **Voz (ElevenLabs)**.

## Funcionalidades

- 🤖 **IA com OpenAI** - Atendimento automático 24h
- 🎙️ **Respostas por Áudio** - ElevenLabs text-to-speech
- 📱 **WhatsApp Integrado** - whatsapp-web.js
- 🍽️ **Cardápio Digital** - Página web responsiva
- ⭐ **Avaliações** - Link automático após pedido
- 💳 **Pagamento** - Link e informações de pagamento
- ⚙️ **Painel Admin** - Configuração completa via web
- 🗂️ **Config YAML** - Toda configuração em YAML

## Requisitos

- Node.js 18+
- NPM
- Google Chrome (para whatsapp-web.js)

## Instalação

```bash
npm install
```

## Configuração

Edite o arquivo `config/config.yaml` com seus dados:

```yaml
empresa:
  nome: "Sua Empresa"
  telefone: "5511999999999"

openai:
  api_key: "sua-chave-aqui"

elevenlabs:
  api_key: "sua-chave-aqui"

admin:
  senha: "1101112"
```

## Uso

```bash
npm run dev
```

Acesse:
- **Site**: http://localhost:3000
- **Cardápio**: http://localhost:3000/menu
- **Admin**: http://localhost:3000/admin

## Deploy no GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/whatsapp-delivery-system.git
git push -u origin main
```

## Estrutura

```
config/config.yaml          # Configuração principal
src/
  app/                      # Páginas Next.js
    page.tsx                # Home
    menu/page.tsx           # Cardápio digital
    admin/page.tsx          # Login admin
    admin/dashboard/page.tsx# Painel admin
    api/                    # API routes
  lib/
    config.ts               # Leitura/escrita YAML
    ai.ts                   # IA OpenAI
    elevenlabs.ts           # Text-to-Speech
    whatsapp.ts             # Lógica WhatsApp
    whatsapp-bot.ts         # Bot WhatsApp
```
