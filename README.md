# WhatsApp Delivery System

Sistema de delivery inteligente com **WhatsApp**, **IA (Groq/Llama)** e **Voz (ElevenLabs)**.

## Funcionalidades

- 🤖 **IA com Groq (Llama)** - Atendimento automático 24h
- 🎙️ **Respostas por Áudio** - ElevenLabs text-to-speech
- 📱 **WhatsApp Integrado** - whatsapp-web.js
- 🍽️ **Cardápio Digital** - Página web responsiva
- ⭐ **Avaliações** - Link automático após pedido
- 💳 **Pagamento** - Link e informações de pagamento
- ⚙️ **Painel Admin** - Configuração completa via web
- 🗂️ **Config server.yml** - Toda configuração em YAML na raiz

## Requisitos

- Node.js 18+
- NPM
- Google Chrome (para whatsapp-web.js)

## Instalação

```bash
npm install
```

## Configuração

Edite o arquivo `server.yml` na raiz do projeto com seus dados:

```yaml
empresa:
  nome: "Sua Empresa"
  telefone: "5511999999999"

groq:
  api_key: "sua-chave-groq"

elevenlabs:
  api_key: "sua-chave-elevenlabs"

admin:
  senha: "1101112"
```

Ou configure tudo pelo **painel admin** em http://localhost:3000/admin

## Uso

```bash
npm run dev
```

Acesse:
- **Site**: http://localhost:3000
- **Cardápio**: http://localhost:3000/menu
- **Admin**: http://localhost:3000/admin (senha: 1101112)

## Estrutura

```
server.yml                  # Configuração principal (raiz)
src/
  app/                      # Páginas Next.js
    page.tsx                # Home
    menu/page.tsx           # Cardápio digital
    admin/page.tsx          # Login admin
    admin/dashboard/page.tsx# Painel admin
    api/                    # API routes
  lib/
    config.ts               # Leitura/escrita server.yml
    ai.ts                   # IA Groq (Llama)
    elevenlabs.ts           # Text-to-Speech
    whatsapp.ts             # Lógica WhatsApp
    whatsapp-bot.ts         # Bot WhatsApp
```
