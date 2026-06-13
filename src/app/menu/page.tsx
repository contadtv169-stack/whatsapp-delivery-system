"use client"

import { useEffect, useState } from "react"
import type { Cardapio, Empresa } from "@/types"

export default function MenuPage() {
  const [cardapio, setCardapio] = useState<Cardapio | null>(null)
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [categoriaAtiva, setCategoriaAtiva] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        setCardapio(data.cardapio)
        setEmpresa(data.empresa)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl">Carregando cardápio...</div>
    </div>
  )

  if (!cardapio || !empresa) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl text-red-500">Erro ao carregar cardápio</div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-4">
      <header className="text-center py-8" style={{ backgroundColor: empresa.cor_primaria + "15" }}>
        <h1 className="text-4xl font-bold" style={{ color: empresa.cor_primaria }}>
          {empresa.nome}
        </h1>
        <p className="text-gray-500 mt-2">{empresa.descricao}</p>
        <p className="text-sm text-gray-400 mt-1">⏰ {empresa.horario_funcionamento}</p>
      </header>

      <nav className="flex gap-2 overflow-x-auto py-4 mb-6">
        {cardapio.categorias.map((cat, i) => (
          <button
            key={i}
            onClick={() => setCategoriaAtiva(i)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition font-medium ${
              categoriaAtiva === i
                ? "text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            style={categoriaAtiva === i ? { backgroundColor: empresa.cor_primaria } : {}}
          >
            {cat.emoji} {cat.nome}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cardapio.categorias[categoriaAtiva]?.itens.map((item, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{item.nome}</h3>
                <p className="text-gray-500 text-sm mt-1">{item.descricao}</p>
              </div>
              <span className="text-lg font-bold" style={{ color: empresa.cor_primaria }}>
                {cardapio.moeda} {item.preco.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <footer className="text-center py-8 text-gray-400 text-sm">
        <p>📱 Peça pelo WhatsApp</p>
        <p className="mt-1">{empresa.telefone}</p>
      </footer>
    </div>
  )
}
