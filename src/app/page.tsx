import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-bold mb-4">🍕 WhatsApp Delivery</h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistema inteligente de delivery com WhatsApp + IA + Áudio
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="font-semibold text-lg mb-2">IA com Voz</h3>
            <p className="text-gray-500 text-sm">Respostas por áudio usando ElevenLabs</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="text-4xl mb-3">📱</div>
            <h3 className="font-semibold text-lg mb-2">WhatsApp Integrado</h3>
            <p className="text-gray-500 text-sm">Atendimento 24 horas automático</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="text-4xl mb-3">🍽️</div>
            <h3 className="font-semibold text-lg mb-2">Cardápio Digital</h3>
            <p className="text-gray-500 text-sm">Cardápio online para seus clientes</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="font-semibold text-lg mb-2">Avaliações</h3>
            <p className="text-gray-500 text-sm">Links de avaliação e pagamento</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/menu"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition"
          >
            Ver Cardápio
          </Link>
          <Link
            href="/admin"
            className="bg-gray-800 hover:bg-gray-900 text-white font-semibold px-8 py-3 rounded-xl transition"
          >
            Painel Admin
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-400">
          ⏰ Funcionamento 24 horas por dia
        </p>
      </div>
    </div>
  )
}
