import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js"
import * as qrcode from "qrcode"
import { EventEmitter } from "events"
import { getConfig } from "./config"
import { processarMensagemWhatsApp } from "./whatsapp"

export const botEvents = new EventEmitter()

let client: Client | null = null
let qrCodeString: string = ""
let status: "desconectado" | "conectando" | "conectado" = "desconectado"
let reconnectAttempts = 0
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

export function getStatus() {
  return { status, qrCode: qrCodeString }
}

function startReconnectTimer() {
  if (reconnectTimer) clearTimeout(reconnectTimer)
  const delay = Math.min(5000 * Math.pow(2, reconnectAttempts), 60000)
  reconnectAttempts++
  console.log(`🔄 Reconectando em ${delay/1000}s... (tentativa ${reconnectAttempts})`)
  reconnectTimer = setTimeout(() => {
    iniciarBot().catch(console.error)
  }, delay)
}

export async function iniciarBot(): Promise<void> {
  if (client) {
    try {
      await client.destroy()
    } catch {}
    client = null
  }

  const config = getConfig()

  client = new Client({
    authStrategy: new LocalAuth({ dataPath: config.whatsapp.session_path }),
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-extensions",
      ],
    },
  })

  client.on("qr", async (qr: string) => {
    status = "conectando"
    qrCodeString = await qrcode.toDataURL(qr)
    botEvents.emit("qr", qrCodeString)
  })

  client.on("ready", () => {
    status = "conectado"
    qrCodeString = ""
    reconnectAttempts = 0
    botEvents.emit("ready")
    console.log("✅ WhatsApp conectado 24h ativo!")
  })

  client.on("disconnected", (reason) => {
    status = "desconectado"
    client = null
    botEvents.emit("disconnected")
    console.log(`⚠️ WhatsApp desconectado: ${reason}`)
    startReconnectTimer()
  })

  client.on("auth_failure", (msg) => {
    console.error(`❌ Falha de autenticação WhatsApp: ${msg}`)
    status = "desconectado"
    client = null
    startReconnectTimer()
  })

  client.on("message", async (msg) => {
    if (msg.from === "status@broadcast" || msg.from.endsWith("@g.us")) return

    const numero = msg.from
    const texto = msg.body

    await processarMensagemWhatsApp(
      numero,
      texto,
      async (textoMsg) => {
        await client!.sendMessage(numero, textoMsg)
      },
      async (buffer) => {
        const media = new MessageMedia("audio/ogg", buffer.toString("base64"))
        await client!.sendMessage(numero, media, { sendAudioAsVoice: true })
      }
    )
  })

  try {
    await client.initialize()
  } catch (err) {
    console.error("Erro ao inicializar WhatsApp:", err)
    client = null
    status = "desconectado"
    startReconnectTimer()
  }
}

export function pararBot(): void {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (client) {
    client.destroy()
    client = null
  }
  status = "desconectado"
  qrCodeString = ""
  reconnectAttempts = 0
  botEvents.emit("disconnected")
  console.log("WhatsApp bot parado")
}
