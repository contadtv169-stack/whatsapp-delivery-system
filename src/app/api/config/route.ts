import { NextRequest, NextResponse } from "next/server"
import { getConfig, saveConfig } from "@/lib/config"
import type { Config } from "@/types"

const ADMIN_PASSWORD = "1101112"

function checkAuth(request: NextRequest): boolean {
  const auth = request.cookies.get("admin_auth")?.value
  return auth === ADMIN_PASSWORD
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  if (action === "load") {
    const authenticated = checkAuth(request)
    if (!authenticated) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }
    const config = getConfig()
    return NextResponse.json(config)
  }

  // Public config (no auth needed for menu page)
  const config = getConfig()
  return NextResponse.json({
    empresa: config.empresa,
    cardapio: config.cardapio,
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (body.action === "login") {
    if (body.senha === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true })
      response.cookies.set("admin_auth", ADMIN_PASSWORD, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 2,
        path: "/",
      })
      return response
    }
    return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })
  }

  if (body.action === "save") {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    const configData = body.config as Partial<Config>
    saveConfig(configData)
    return NextResponse.json({ message: "Configuração salva com sucesso!" })
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
}
