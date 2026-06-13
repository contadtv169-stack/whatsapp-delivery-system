import { NextResponse } from "next/server"
import { getStatus } from "@/lib/whatsapp-bot"
import { getConfig } from "@/lib/config"

export async function GET() {
  const config = getConfig()
  const bot = getStatus()

  return NextResponse.json({
    status: "online",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    whatsapp: bot.status,
    empresa: config.empresa.nome,
    horario: config.empresa.horario_funcionamento,
    memoria: process.memoryUsage().rss,
  })
}
