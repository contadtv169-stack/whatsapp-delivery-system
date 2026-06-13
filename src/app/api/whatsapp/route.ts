import { NextRequest, NextResponse } from "next/server"
import { iniciarBot, pararBot, getStatus } from "@/lib/whatsapp-bot"

export async function GET() {
  const status = getStatus()
  return NextResponse.json(status)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (body.action === "start") {
    iniciarBot().catch(console.error)
    return NextResponse.json({ message: "WhatsApp iniciando..." })
  }

  if (body.action === "stop") {
    pararBot()
    return NextResponse.json({ message: "WhatsApp parado." })
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
}
