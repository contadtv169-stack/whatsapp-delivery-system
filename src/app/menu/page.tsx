"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Cardapio, Empresa } from "@/types"

export default function MenuPage() {
  const [cardapio, setCardapio] = useState<Cardapio | null>(null)
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [categoriaAtiva, setCategoriaAtiva] = useState(0)
  const [itemAberto, setItemAberto] = useState<number | null>(null)
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

  function getYoutubeId(url: string) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
    return match ? match[1] : null
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen"><div className="text-xl">Carregando cardápio...</div></div>
  )

  if (!cardapio || !empresa) return (
    <div className="flex items-center justify-center min-h-screen"><div className="text-xl text-red-500">Erro ao carregar cardápio</div></div>
  )

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      <header className="text-center py-6" style={{ backgroundColor: empresa.cor_primaria + "15" }}>
        {empresa.logo && <Image src={empresa.logo} alt={empresa.nome} width={80} height={80} className="mx-auto mb-2 rounded-full" />}
        <h1 className="text-3xl font-bold" style={{ color: empresa.cor_primaria }}>{empresa.nome}</h1>
        <p className="text-gray-500">{empresa.descricao}</p>
        <p className="text-sm text-gray-400">⏰ {empresa.horario_funcionamento}</p>
        <a href={`https://wa.me/${empresa.telefone}`} target="_blank"
          className="inline-block mt-2 bg-green-500 text-white px-4 py-1 rounded-full text-sm">
          📱 {empresa.telefone}
        </a>
      </header>

      <nav className="flex gap-2 overflow-x-auto py-4 mb-4">
        {cardapio.categorias.map((cat, i) => (
          <button key={i} onClick={() => { setCategoriaAtiva(i); setItemAberto(null) }}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition font-medium ${
              categoriaAtiva === i ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            style={categoriaAtiva === i ? { backgroundColor: empresa.cor_primaria } : {}}>
            {cat.emoji} {cat.nome}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cardapio.categorias[categoriaAtiva]?.itens.map((item, i) => (
          <div key={i}
            className={`bg-white rounded-xl shadow-sm border transition overflow-hidden ${
              itemAberto === i ? "shadow-md" : "border-gray-100 hover:shadow-md"
            }`}>
            {item.imagem && (
              <div className="relative h-40 w-full bg-gray-100">
                <Image src={item.imagem} alt={item.nome} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-start cursor-pointer" onClick={() => setItemAberto(itemAberto === i ? null : i)}>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.nome}</h3>
                  <p className="text-gray-500 text-sm mt-1">{item.descricao}</p>
                </div>
                <span className="text-lg font-bold ml-2 whitespace-nowrap" style={{ color: empresa.cor_primaria }}>
                  {cardapio.moeda} {item.preco.toFixed(2)}
                </span>
              </div>

              {itemAberto === i && item.video && (
                <div className="mt-3">
                  {getYoutubeId(item.video) ? (
                    <iframe className="w-full h-48 rounded-lg" src={`https://www.youtube.com/embed/${getYoutubeId(item.video)}`}
                      allowFullScreen title="Vídeo do item" />
                  ) : (
                    <video controls className="w-full h-48 rounded-lg">
                      <source src={item.video} type="video/mp4" />
                    </video>
                  )}
                </div>
              )}

              {itemAberto === i && (
                <a href={`https://wa.me/${empresa.telefone}?text=Quero%20${encodeURIComponent(item.nome)}`} target="_blank"
                  className="mt-3 block text-center bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition">
                  Pedir pelo WhatsApp
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <footer className="text-center py-8 text-gray-400 text-sm">
        <p>📱 Peça pelo WhatsApp: <strong>{empresa.telefone}</strong></p>
      </footer>

      {/* Bottom Menu Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-50 md:hidden">
        <div className="flex justify-around py-2">
          <Link href="/" className="flex flex-col items-center text-gray-500 text-xs">
            <span className="text-xl">🏠</span> Início
          </Link>
          <Link href="/menu" className="flex flex-col items-center text-orange-500 text-xs">
            <span className="text-xl">🍽️</span> Cardápio
          </Link>
          <Link href="/pedido" className="flex flex-col items-center text-gray-500 text-xs">
            <span className="text-xl">🛒</span> Pedir
          </Link>
          <a href={`https://wa.me/${empresa.telefone}`} target="_blank" className="flex flex-col items-center text-gray-500 text-xs">
            <span className="text-xl">💬</span> WhatsApp
          </a>
        </div>
      </nav>
    </div>
  )
}
