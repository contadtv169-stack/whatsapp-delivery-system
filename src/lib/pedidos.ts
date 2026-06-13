import fs from "fs"
import path from "path"
import type { Pedido } from "@/types"

const PEDIDOS_PATH = path.join(process.cwd(), "data", "pedidos.json")

function ensureFile() {
  const dir = path.dirname(PEDIDOS_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(PEDIDOS_PATH)) fs.writeFileSync(PEDIDOS_PATH, "[]", "utf-8")
}

function readPedidos(): Pedido[] {
  ensureFile()
  const raw = fs.readFileSync(PEDIDOS_PATH, "utf-8")
  return JSON.parse(raw)
}

function writePedidos(pedidos: Pedido[]) {
  ensureFile()
  fs.writeFileSync(PEDIDOS_PATH, JSON.stringify(pedidos, null, 2), "utf-8")
}

export function criarPedido(data: Omit<Pedido, "id" | "criado_em" | "status">): Pedido {
  const pedidos = readPedidos()
  const pedido: Pedido = {
    ...data,
    id: `PED-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: "novo",
    criado_em: new Date().toISOString(),
  }
  pedidos.unshift(pedido)
  writePedidos(pedidos)
  return pedido
}

export function listarPedidos(status?: Pedido["status"]): Pedido[] {
  const pedidos = readPedidos()
  if (status) return pedidos.filter((p) => p.status === status)
  return pedidos
}

export function buscarPedido(id: string): Pedido | undefined {
  return readPedidos().find((p) => p.id === id)
}

export function atualizarStatus(id: string, status: Pedido["status"]): Pedido | null {
  const pedidos = readPedidos()
  const idx = pedidos.findIndex((p) => p.id === id)
  if (idx === -1) return null
  pedidos[idx].status = status
  writePedidos(pedidos)
  return pedidos[idx]
}

export function deletarPedido(id: string): boolean {
  const pedidos = readPedidos()
  const idx = pedidos.findIndex((p) => p.id === id)
  if (idx === -1) return false
  pedidos.splice(idx, 1)
  writePedidos(pedidos)
  return true
}
