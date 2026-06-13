"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { Config } from "@/types"

type Categoria = Config["cardapio"]["categorias"][number]
type ItemCardapio = Categoria["itens"][number]

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("config")
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [whatsappStatus, setWhatsappStatus] = useState<{ status: string; qrCode?: string } | null>(null)
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetch("/api/config?action=load")
      .then((r) => r.json())
      .then((d) => { if (d.authenticated === false) router.push("/admin"); else setConfig(d) })
      .finally(() => setLoading(false))
  }, [router])

  async function startBot() {
    await fetch("/api/whatsapp", { method: "POST", body: JSON.stringify({ action: "start" }) })
    setMsg("WhatsApp iniciando... Escaneie o QR Code abaixo.")
  }

  async function stopBot() {
    await fetch("/api/whatsapp", { method: "POST", body: JSON.stringify({ action: "stop" }) })
    setMsg("WhatsApp desconectado.")
  }

  async function checkStatus() {
    const r = await fetch("/api/whatsapp")
    const d = await r.json()
    setWhatsappStatus(d)
  }

  useEffect(() => {
    const interval = setInterval(checkStatus, 3000)
    return () => clearInterval(interval)
  }, [])

  async function saveConfig() {
    setSaving(true)
    const r = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", config }),
    })
    const d = await r.json()
    setMsg(d.message || "Configuração salva!")
    setSaving(false)
  }

  function updateNested(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
    const keys = path.split(".")
    const current = { ...obj }
    let ref = current as Record<string, unknown>
    for (let i = 0; i < keys.length - 1; i++) {
      ref[keys[i]] = { ...(ref[keys[i]] as Record<string, unknown>) }
      ref = ref[keys[i]] as Record<string, unknown>
    }
    ref[keys[keys.length - 1]] = value
    return current
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen text-xl">Carregando...</div>
  if (!config) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">⚙️ Painel Admin</h1>
        <button onClick={() => router.push("/")} className="text-sm text-gray-300 hover:text-white">← Site</button>
      </header>

      {msg && (
        <div className="bg-blue-50 text-blue-700 p-3 text-center text-sm">{msg}</div>
      )}

      <div className="max-w-6xl mx-auto p-4">
        <nav className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: "config", label: "Configurações" },
            { id: "whatsapp", label: "WhatsApp" },
            { id: "cardapio", label: "Cardápio" },
            { id: "groq", label: "Groq & Voz" },
            { id: "empresa", label: "Empresa" },
            { id: "avaliacoes", label: "Avaliações" },
            { id: "pagamento", label: "Pagamento" },
            { id: "pedidos", label: "Pedidos" },
            { id: "callcenter", label: "Call Center" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition ${
                activeTab === tab.id ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === "whatsapp" && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">📱 WhatsApp</h2>
            <div className="flex gap-3 mb-4">
              <button onClick={startBot} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">Iniciar</button>
              <button onClick={stopBot} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg">Parar</button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>Status: <strong>{whatsappStatus?.status || "desconectado"}</strong></p>
              {whatsappStatus?.qrCode && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Escaneie o QR Code com o WhatsApp:</p>
                  <Image src={whatsappStatus.qrCode} alt="QR Code" width={192} height={192} className="w-48 h-48" />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "empresa" && (
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold mb-4">🏢 Empresa</h2>
            {([
              ["empresa.nome", "Nome da Empresa", config.empresa.nome] as const,
              ["empresa.descricao", "Descrição", config.empresa.descricao],
              ["empresa.telefone", "Telefone", config.empresa.telefone],
              ["empresa.endereco", "Endereço", config.empresa.endereco],
              ["empresa.horario_funcionamento", "Horário", config.empresa.horario_funcionamento],
              ["empresa.cor_primaria", "Cor Primária", config.empresa.cor_primaria],
              ["empresa.cor_secundaria", "Cor Secundária", config.empresa.cor_secundaria],
            ] as [string, string, string][]).map(([path, label]) => (
              <div key={path}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  value={getNested(config, path) as string || ""}
                  onChange={(e) => setConfig(updateNested(config as unknown as Record<string, unknown>, path, e.target.value) as unknown as Config)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === "groq" && (
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold mb-4">🧠 Groq & 🎙️ Voz</h2>
            <h3 className="font-semibold text-gray-700 mt-4">Groq (IA)</h3>
            {([
              ["groq.api_key", "API Key Groq", config.groq.api_key],
              ["groq.model", "Modelo (ex: llama-3.3-70b-versatile)", config.groq.model],
              ["groq.temperatura", "Temperatura", String(config.groq.temperatura)],
              ["groq.max_tokens", "Max Tokens", String(config.groq.max_tokens)],
            ] as [string, string, string][]).map(([path, label]) => (
              <div key={path}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type={path.includes("api_key") ? "password" : "text"}
                  value={getNested(config, path) as string || ""}
                  onChange={(e) => setConfig(updateNested(config as unknown as Record<string, unknown>, path, path.includes("temperatura") || path.includes("max_tokens") ? Number(e.target.value) : e.target.value) as unknown as Config)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prompt do Sistema</label>
              <textarea
                value={config.groq.prompt_sistema || ""}
                onChange={(e) => setConfig(updateNested(config as unknown as Record<string, unknown>, "groq.prompt_sistema", e.target.value) as unknown as Config)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg h-32"
              />
            </div>
            <h3 className="font-semibold text-gray-700 mt-4">ElevenLabs</h3>
            {([
              ["elevenlabs.api_key", "API Key ElevenLabs", config.elevenlabs.api_key],
              ["elevenlabs.voice_id", "Voice ID", config.elevenlabs.voice_id],
              ["elevenlabs.model", "Modelo", config.elevenlabs.model],
              ["elevenlabs.stability", "Estabilidade", String(config.elevenlabs.stability)],
              ["elevenlabs.similarity_boost", "Similaridade", String(config.elevenlabs.similarity_boost)],
            ] as [string, string, string][]).map(([path, label]) => (
              <div key={path}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type={path.includes("api_key") ? "password" : "text"}
                  value={getNested(config, path) as string || ""}
                  onChange={(e) => setConfig(updateNested(config as unknown as Record<string, unknown>, path, path.includes("stability") || path.includes("similarity") ? Number(e.target.value) : e.target.value) as unknown as Config)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === "cardapio" && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">🍽️ Cardápio</h2>
            {config.cardapio.categorias.map((cat: Categoria, ci: number) => (
              <div key={ci} className="mb-6 p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">
                  {cat.emoji} {cat.nome}
                </h3>
                  {cat.itens.map((item: ItemCardapio, ii: number) => (
                  <div key={ii} className="border border-gray-100 rounded-lg p-3 mb-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                      <input value={item.nome}
                        onChange={(e) => { const c = { ...config }; c.cardapio.categorias[ci].itens[ii].nome = e.target.value; setConfig(c) }}
                        className="px-2 py-1 border rounded" placeholder="Nome" />
                      <input value={item.descricao}
                        onChange={(e) => { const c = { ...config }; c.cardapio.categorias[ci].itens[ii].descricao = e.target.value; setConfig(c) }}
                        className="px-2 py-1 border rounded" placeholder="Descrição" />
                      <input type="number" value={item.preco}
                        onChange={(e) => { const c = { ...config }; c.cardapio.categorias[ci].itens[ii].preco = Number(e.target.value); setConfig(c) }}
                        className="px-2 py-1 border rounded" placeholder="Preço" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input value={item.imagem || ""}
                        onChange={(e) => { const c = { ...config }; c.cardapio.categorias[ci].itens[ii].imagem = e.target.value; setConfig(c) }}
                        className="px-2 py-1 border rounded text-sm" placeholder="URL da Imagem" />
                      <input value={item.video || ""}
                        onChange={(e) => { const c = { ...config }; c.cardapio.categorias[ci].itens[ii].video = e.target.value; setConfig(c) }}
                        className="px-2 py-1 border rounded text-sm" placeholder="URL do Vídeo (YouTube)" />
                    </div>
                    {item.imagem && <img src={item.imagem} alt={item.nome} className="h-16 w-16 object-cover rounded mt-2" />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === "avaliacoes" && (
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold mb-4">⭐ Avaliações e Pagamento</h2>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.avaliacoes.ativar || false}
                onChange={(e) => setConfig({ ...config, avaliacoes: { ...config.avaliacoes, ativar: e.target.checked } })}
                className="w-5 h-5"
              />
              <span>Ativar Avaliações</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link de Avaliação</label>
              <input
                value={config.avaliacoes.link || ""}
                onChange={(e) => setConfig({ ...config, avaliacoes: { ...config.avaliacoes, link: e.target.value } })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem de Avaliação</label>
              <textarea
                value={config.avaliacoes.mensagem || ""}
                onChange={(e) => setConfig({ ...config, avaliacoes: { ...config.avaliacoes, mensagem: e.target.value } })}
                className="w-full px-3 py-2 border rounded-lg h-24"
              />
            </div>
            <hr className="my-4" />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.pagamento.ativar || false}
                onChange={(e) => setConfig({ ...config, pagamento: { ...config.pagamento, ativar: e.target.checked } })}
                className="w-5 h-5"
              />
              <span>Ativar Pagamento</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link de Pagamento</label>
              <input
                value={config.pagamento.link_manual || ""}
                onChange={(e) => setConfig({ ...config, pagamento: { ...config.pagamento, link_manual: e.target.value } })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        )}

        {activeTab === "pagamento" && (
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold mb-4">💳 Pagamento - Krypt Pay (PIX)</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700 mb-4">
              Integração com Krypt Pay para cobranças PIX automáticas.
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base URL</label>
              <input
                value={config.pagamento.kryptpay.base_url || ""}
                onChange={(e) => setConfig({ ...config, pagamento: { ...config.pagamento, kryptpay: { ...config.pagamento.kryptpay, base_url: e.target.value } } })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client ID (ci)</label>
              <input
                value={config.pagamento.kryptpay.ci || ""}
                onChange={(e) => setConfig({ ...config, pagamento: { ...config.pagamento, kryptpay: { ...config.pagamento.kryptpay, ci: e.target.value } } })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Secret (cs)</label>
              <input
                type="password"
                value={config.pagamento.kryptpay.cs || ""}
                onChange={(e) => setConfig({ ...config, pagamento: { ...config.pagamento, kryptpay: { ...config.pagamento.kryptpay, cs: e.target.value } } })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 mt-4">
              <p className="font-medium mb-2">📋 Testar integração:</p>
              <button
                onClick={async () => {
                  const r = await fetch("/api/pix", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "create", amount: 1, payerName: "Teste", payerDocument: "00000000000", description: "Teste integração" }),
                  })
                  const d = await r.json()
                  if (d.success) {
                    setMsg(`✅ PIX criado! Copia e cola: ${d.data.copyPaste.substring(0, 30)}...`)
                  } else {
                    setMsg("❌ Erro ao criar PIX. Verifique as credenciais.")
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
              >
                Criar PIX de Teste (R$ 1,00)
              </button>
            </div>
          </div>
        )}

        {activeTab === "pedidos" && <PedidosTab />}

        {activeTab === "callcenter" && (
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold mb-4">📞 Call Center (SIP)</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700 mb-4">
              Configure os dados SIP para transferir chamadas para atendentes humanos.
              Quando o robô da IA identificar que precisa de humano, ele transfere a ligação.
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={config.call_center?.ativo || false}
                onChange={(e) => setConfig({ ...config, call_center: { ...config.call_center, ativo: e.target.checked } })}
                className="w-5 h-5" />
              <span>Call Center Ativo</span>
            </label>
            {[
              ["call_center.sip_server", "Servidor SIP"],
              ["call_center.sip_user", "Usuário SIP"],
              ["call_center.sip_pass", "Senha SIP"],
              ["call_center.sip_port", "Porta SIP", "text"],
              ["call_center.horario_inicio", "Horário Início (ex: 08:00)"],
              ["call_center.horario_fim", "Horário Fim (ex: 22:00)"],
            ].map(([path, label, type]) => (
              <div key={path}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type={path.includes("pass") ? "password" : type === "text" ? "text" : "text"}
                  value={getNested(config, path) as string || ""}
                  onChange={(e) => setConfig(updateNested(config as unknown as Record<string, unknown>, path, e.target.value) as unknown as Config)}
                  className="w-full px-3 py-2 border rounded-lg" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem de Transferência</label>
              <textarea value={config.call_center?.mensagem_transferencia || ""}
                onChange={(e) => setConfig({ ...config, call_center: { ...config.call_center, mensagem_transferencia: e.target.value } })}
                className="w-full px-3 py-2 border rounded-lg h-24" />
            </div>
          </div>
        )}

        {activeTab === "config" && (
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold mb-4">⚙️ Configuração Geral</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ["empresa.nome", "Empresa"],
                ["whatsapp.session_path", "Sessão WhatsApp Path"],
              ].map(([path, label]) => (
                <div key={path}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    value={getNested(config, path) as string || ""}
                    onChange={(e) => setConfig(updateNested(config as unknown as Record<string, unknown>, path, e.target.value) as unknown as Config)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem de Boas-Vindas</label>
              <textarea
                value={config.whatsapp.mensagem_bem_vindo || ""}
                onChange={(e) => setConfig(updateNested(config as unknown as Record<string, unknown>, "whatsapp.mensagem_bem_vindo", e.target.value) as unknown as Config)}
                className="w-full px-3 py-2 border rounded-lg h-32"
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={saveConfig}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition disabled:opacity-50"
          >
            {saving ? "Salvando..." : "💾 Salvar Configuração"}
          </button>
        </div>
      </div>
    </div>
  )
}

function PedidosTab() {
  const [pedidos, setPedidos] = useState<import("@/types").Pedido[]>([])
  const [filtro, setFiltro] = useState<string>("todos")
  const [loading, setLoading] = useState(true)

  function carregar() {
    setLoading(true)
    const url = filtro === "todos" ? "/api/pedidos?action=listar" : `/api/pedidos?action=listar&status=${filtro}`
    fetch(url).then((r) => r.json()).then(setPedidos).finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [filtro])

  async function mudarStatus(id: string, status: string) {
    await fetch("/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "status", id, status }),
    })
    carregar()
  }

  const cores: Record<string, string> = {
    novo: "bg-yellow-100 text-yellow-800",
    confirmado: "bg-blue-100 text-blue-800",
    preparando: "bg-purple-100 text-purple-800",
    saiu_entrega: "bg-orange-100 text-orange-800",
    entregue: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800",
  }

  if (loading) return <div className="text-center py-8">Carregando pedidos...</div>

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">📦 Pedidos ({pedidos.length})</h2>
        <div className="flex gap-2">
          {["todos", "novo", "confirmado", "preparando", "saiu_entrega", "entregue"].map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-3 py-1 rounded-lg text-sm ${filtro === f ? "bg-gray-900 text-white" : "bg-gray-100"}`}>
              {f === "todos" ? "Todos" : f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {pedidos.length === 0 && <p className="text-gray-400 text-center py-8">Nenhum pedido</p>}

      {pedidos.map((p) => (
        <div key={p.id} className="border rounded-lg p-4 mb-3">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="font-bold">{p.cliente_nome}</span>
              <span className="text-gray-500 ml-2 text-sm">{p.cliente_telefone}</span>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${cores[p.status] || ""}`}>{p.status}</span>
          </div>
          <div className="text-sm text-gray-600 mb-2">{p.cliente_endereco}</div>
          <div className="text-sm space-y-1 mb-2">
            {p.itens.map((item, i) => (
              <div key={i} className="flex justify-between">
                <span>{item.quantidade}x {item.nome}</span>
                <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold border-t pt-2 mb-2">
            <span>Total</span>
            <span>R$ {p.total.toFixed(2)}</span>
          </div>
          <div className="text-xs text-gray-400 mb-3">{p.forma_pagamento} | {new Date(p.criado_em).toLocaleString("pt-BR")}</div>
          <div className="flex gap-2">
            {p.status === "novo" && <button onClick={() => mudarStatus(p.id, "confirmado")} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Confirmar</button>}
            {p.status === "confirmado" && <button onClick={() => mudarStatus(p.id, "preparando")} className="bg-purple-600 text-white px-3 py-1 rounded text-sm">Preparando</button>}
            {p.status === "preparando" && <button onClick={() => mudarStatus(p.id, "saiu_entrega")} className="bg-orange-600 text-white px-3 py-1 rounded text-sm">Saiu p/ Entrega</button>}
            {p.status === "saiu_entrega" && <button onClick={() => mudarStatus(p.id, "entregue")} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Entregue</button>}
            {p.status !== "entregue" && p.status !== "cancelado" && (
              <button onClick={() => mudarStatus(p.id, "cancelado")} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Cancelar</button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function getNested(obj: unknown, path: string): unknown {
  return path.split(".").reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key]
    return undefined
  }, obj)
}
