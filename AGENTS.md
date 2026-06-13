# WhatsApp Delivery System - Agent Instructions

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

## Project Structure
- `server.yml` - Main configuration YAML (edit this for settings)
- `src/app/` - Next.js App Router pages
- `src/lib/` - Core logic (config, Groq, WhatsApp, ElevenLabs)
- Admin password: `1101112`

## Key Info
- WhatsApp bot uses whatsapp-web.js with LocalAuth
- Session files stored in `whatsapp-session/` directory
- ElevenLabs for text-to-speech audio responses
- Groq (LLaMA) for AI conversations
- Config is loaded from `server.yml` and cached in memory
- Admin auth uses httpOnly cookies
- Menu page is public, admin requires password
