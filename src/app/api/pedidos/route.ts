import { NextRequest, NextResponse } from "next/server"
import { criarPedido, listarPedidos, atualizarStatus, deletarPedido } from "@/lib/pedidos"
import type { Pedido } from "@/types"

function checkAuth(request: NextRequest): boolean {
  return request.cookies.get("admin_auth")?.value === "1101112"
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  if (action === "listar") {
    if (!checkAuth(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    const status = searchParams.get("status") as Pedido["status"] | null
    const pedidos = listarPedidos(status || undefined)
    return NextResponse.json(pedidos)
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (body.action === "criar") {
    const pedido = criarPedido({
      cliente_nome: body.cliente_nome,
      cliente_telefone: body.cliente_telefone,
      cliente_endereco: body.cliente_endereco,
      itens: body.itens,
      total: body.total,
      forma_pagamento: body.forma_pagamento,
      troco: body.troco,
      observacao: body.observacao || "",
      origem: "web",
    })
    return NextResponse.json({ success: true, pedido })
  }

  if (body.action === "status") {
    if (!checkAuth(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    const pedido = atualizarStatus(body.id, body.status)
    if (pedido) return NextResponse.json({ success: true, pedido })
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 })
  }

  if (body.action === "deletar") {
    if (!checkAuth(request)) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    deletarPedido(body.id)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
}
