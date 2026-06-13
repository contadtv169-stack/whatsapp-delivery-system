"use client"

import { useEffect, useState } from "react"
import type { Config, CarrinhoItem } from "@/types"

export default function PedidoPage() {
  const [config, setConfig] = useState<Config | null>(null)
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([])
  const [catAtiva, setCatAtiva] = useState(0)
  const [step, setStep] = useState<"cardapio" | "carrinho" | "checkout" | "confirmado">("cardapio")
  const [form, setForm] = useState({ nome: "", telefone: "", endereco: "", pagamento: "dinheiro", troco: "", obs: "" })
  const [pedidoId, setPedidoId] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/config").then((r) => r.json()).then((d) => { setConfig(d); setLoading(false) })
  }, [])

  function addItem(nome: string, preco: number) {
    setCarrinho((prev) => {
      const exist = prev.find((i) => i.nome === nome)
      if (exist) return prev.map((i) => i.nome === nome ? { ...i, quantidade: i.quantidade + 1 } : i)
      return [...prev, { nome, quantidade: 1, preco }]
    })
  }

  function removeItem(nome: string) {
    setCarrinho((prev) => {
      const exist = prev.find((i) => i.nome === nome)
      if (exist && exist.quantidade <= 1) return prev.filter((i) => i.nome !== nome)
      return prev.map((i) => i.nome === nome ? { ...i, quantidade: i.quantidade - 1 } : i)
    })
  }

  const total = carrinho.reduce((acc, i) => acc + i.preco * i.quantidade, 0)

  async function finalizar() {
    const res = await fetch("/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "criar",
        cliente_nome: form.nome,
        cliente_telefone: form.telefone,
        cliente_endereco: form.endereco,
        itens: carrinho,
        total,
        forma_pagamento: form.pagamento,
        troco: form.troco ? Number(form.troco) : undefined,
        observacao: form.obs,
      }),
    })
    const data = await res.json()
    if (data.success) {
      setPedidoId(data.pedido.id)
      setStep("confirmado")
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p>Carregando...</p></div>
  if (!config) return null
  const { cardapio, empresa } = config

  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="text-center py-6" style={{ backgroundColor: empresa.cor_primaria + "15" }}>
        <h1 className="text-3xl font-bold" style={{ color: empresa.cor_primaria }}>{empresa.nome}</h1>
        <p className="text-gray-500">{empresa.horario_funcionamento}</p>
      </header>

      {step === "cardapio" && (
        <>
          <div className="flex gap-2 overflow-x-auto py-3">
            {cardapio.categorias.map((cat, i) => (
              <button key={i} onClick={() => setCatAtiva(i)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition font-medium ${catAtiva === i ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}>
                {cat.emoji} {cat.nome}
              </button>
            ))}
          </div>

          <div className="grid gap-3">
            {cardapio.categorias[catAtiva]?.itens.map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{item.nome}</h3>
                  <p className="text-sm text-gray-500">{item.descricao}</p>
                  <p className="font-bold mt-1" style={{ color: empresa.cor_primaria }}>
                    {cardapio.moeda} {item.preco.toFixed(2)}
                  </p>
                </div>
                <button onClick={() => addItem(item.nome, item.preco)}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition">
                  + Adicionar
                </button>
              </div>
            ))}
          </div>

          {carrinho.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl p-4 border-t">
              <div className="max-w-4xl mx-auto flex justify-between items-center">
                <span className="font-bold text-lg">{carrinho.length} itens</span>
                <button onClick={() => setStep("carrinho")}
                  className="bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 transition">
                  Ver Carrinho ({cardapio.moeda} {total.toFixed(2)})
                </button>
              </div>
            </div>
          )}
          <div className="h-24" />
        </>
      )}

      {step === "carrinho" && (
        <div className="py-4">
          <h2 className="text-2xl font-bold mb-4">🛒 Carrinho</h2>
          {carrinho.map((item, i) => (
            <div key={i} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm mb-2 border">
              <div>
                <p className="font-semibold">{item.nome}</p>
                <p className="text-sm text-gray-500">{cardapio.moeda} {item.preco.toFixed(2)} cada</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => removeItem(item.nome)} className="w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold">-</button>
                <span className="font-bold">{item.quantidade}</span>
                <button onClick={() => addItem(item.nome, item.preco)} className="w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold">+</button>
              </div>
            </div>
          ))}
          <div className="text-right text-xl font-bold mt-4">Total: {cardapio.moeda} {total.toFixed(2)}</div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep("cardapio")} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold">Adicionar mais</button>
            <button onClick={() => setStep("checkout")} className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition">Finalizar Pedido</button>
          </div>
        </div>
      )}

      {step === "checkout" && (
        <div className="py-4 max-w-lg mx-auto">
          <h2 className="text-2xl font-bold mb-4">📋 Finalizar Pedido</h2>
          <div className="space-y-3">
            <input placeholder="Seu nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl" />
            <input placeholder="Telefone (WhatsApp)" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl" />
            <textarea placeholder="Endereço de entrega" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl" />
            <select value={form.pagamento} onChange={(e) => setForm({ ...form, pagamento: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl">
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao">Cartão</option>
              <option value="pix">PIX</option>
            </select>
            {form.pagamento === "dinheiro" && (
              <input placeholder="Troco para quanto?" value={form.troco} onChange={(e) => setForm({ ...form, troco: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl" type="number" />
            )}
            <textarea placeholder="Observação (opcional)" value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl" />
            <button onClick={finalizar} disabled={!form.nome || !form.telefone || !form.endereco || carrinho.length === 0}
              className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition disabled:opacity-50">
              Confirmar Pedido - {cardapio.moeda} {total.toFixed(2)}
            </button>
          </div>
        </div>
      )}

      {step === "confirmado" && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-3xl font-bold mb-2">Pedido Confirmado!</h2>
          <p className="text-gray-500 mb-2">Nº <strong>{pedidoId}</strong></p>
          <p className="mb-6">Acompanhe pelo WhatsApp</p>
          <button onClick={() => { setStep("cardapio"); setCarrinho([]); setForm({ nome: "", telefone: "", endereco: "", pagamento: "dinheiro", troco: "", obs: "" }) }}
            className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold">
            Novo Pedido
          </button>
        </div>
      )}
    </div>
  )
}
