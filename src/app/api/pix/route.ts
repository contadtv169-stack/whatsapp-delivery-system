import { NextRequest, NextResponse } from "next/server"
import { criarPix, consultarPix, consultarSaldo } from "@/lib/kryptpay"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, amount, payerName, payerDocument, description, transactionId } = body

  if (action === "create") {
    const pix = await criarPix(
      Number(amount) || 10,
      payerName || "Cliente",
      payerDocument || "00000000000",
      description || "Pedido"
    )
    if (pix) {
      return NextResponse.json({ success: true, data: pix })
    }
    return NextResponse.json({ error: "Erro ao criar PIX" }, { status: 500 })
  }

  if (action === "status") {
    if (!transactionId) {
      return NextResponse.json({ error: "transactionId obrigatório" }, { status: 400 })
    }
    const status = await consultarPix(transactionId)
    return NextResponse.json({ success: true, data: status })
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
}

export async function GET() {
  const saldo = await consultarSaldo()
  return NextResponse.json({ success: true, data: saldo })
}
