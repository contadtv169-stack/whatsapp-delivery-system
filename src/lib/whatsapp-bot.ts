import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js"
import * as qrcode from "qrcode"
import { EventEmitter } from "events"
import { getConfig } from "./config"
import { processarMensagemWhatsApp } from "./whatsapp"

export const botEvents = new EventEmitter()

let client: Client | null = null
let qrCodeString: string = ""
let status: "desconectado" | "conectando" | "conectado" = "desconectado"

export function getStatus() {
  return { status, qrCode: qrCodeString }
}

export async function iniciarBot(): Promise<void> {
  if (client) return

  const config = getConfig()

  client = new Client({
    authStrategy: new LocalAuth({ dataPath: config.whatsapp.session_path }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
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
    botEvents.emit("ready")
    console.log("WhatsApp conectado!");
  })

  client.on("disconnected", () => {
    status = "desconectado"
    client = null
    botEvents.emit("disconnected")
    console.log("WhatsApp desconectado");
  })

  client.on("message", async (msg) => {
    if (msg.from === "status@broadcast" || msg.isGroup) return

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
      },
      async (url, legenda) => {
        const media = await MessageMedia.fromUrl(url)
        await client!.sendMessage(numero, media, { caption: legenda })
      }
    )
  })

  client.initialize()
}

export function pararBot(): void {
  if (client) {
    client.destroy()
    client = null
    status = "desconectado"
    qrCodeString = ""
    botEvents.emit("disconnected")
  }
}
