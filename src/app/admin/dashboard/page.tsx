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
                  <div key={ii} className="grid grid-cols-3 gap-3 mb-2 items-center">
                    <input
                      value={item.nome}
                      onChange={(e) => {
                        const c = { ...config }
                        c.cardapio.categorias[ci].itens[ii].nome = e.target.value
                        setConfig(c)
                      }}
                      className="px-2 py-1 border rounded"
                      placeholder="Nome"
                    />
                    <input
                      value={item.descricao}
                      onChange={(e) => {
                        const c = { ...config }
                        c.cardapio.categorias[ci].itens[ii].descricao = e.target.value
                        setConfig(c)
                      }}
                      className="px-2 py-1 border rounded"
                      placeholder="Descrição"
                    />
                    <input
                      type="number"
                      value={item.preco}
                      onChange={(e) => {
                        const c = { ...config }
                        c.cardapio.categorias[ci].itens[ii].preco = Number(e.target.value)
                        setConfig(c)
                      }}
                      className="px-2 py-1 border rounded"
                      placeholder="Preço"
                    />
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

function getNested(obj: unknown, path: string): unknown {
  return path.split(".").reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key]
    return undefined
  }, obj)
}
