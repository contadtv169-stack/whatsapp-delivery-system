import { getConfig } from "./config"
import { gerarRespostaIA, getMensagemCardapio, getMensagemAvaliacao, getMensagemPagamento, getMensagemBemVindo } from "./ai"
import { textToSpeech } from "./elevenlabs"
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions"

interface ClienteSessao {
  numero: string
  historico: ChatCompletionMessageParam[]
  etapa: "saudacao" | "cardapio" | "pedido" | "pagamento" | "avaliacao"
  ultimaAtividade: Date
  pedidoAtual: { nome: string; quantidade: number }[]
}

const sessoes = new Map<string, ClienteSessao>()

function getSession(numero: string): ClienteSessao {
  if (!sessoes.has(numero)) {
    sessoes.set(numero, {
      numero,
      historico: [],
      etapa: "saudacao",
      ultimaAtividade: new Date(),
      pedidoAtual: [],
    })
  }
  return sessoes.get(numero)!
}

export async function processarMensagemWhatsApp(
  numero: string,
  mensagem: string,
  enviarTexto: (texto: string) => Promise<void>,
  enviarAudio: (buffer: Buffer) => Promise<void>,
  _enviarImagem?: (url: string, legenda?: string) => Promise<void>
): Promise<void> {
  const config = getConfig()
  const sessao = getSession(numero)
  sessao.ultimaAtividade = new Date()

  const msgLower = mensagem.toLowerCase().trim()

  // Comandos especiais
  if (msgLower === "cardápio" || msgLower === "cardapio" || msgLower === "menu" || msgLower === "1" || msgLower === "1️⃣") {
    sessao.etapa = "cardapio"
    const cardapioMsg = getMensagemCardapio()
    sessao.historico.push({ role: "assistant", content: cardapioMsg })
    await enviarTexto(cardapioMsg)
    return
  }

  if (msgLower === "pagamento" || msgLower === "formas de pagamento" || msgLower === "3" || msgLower === "3️⃣") {
    const pagMsg = getMensagemPagamento()
    await enviarTexto(pagMsg)
    return
  }

  if (msgLower === "avaliar" || msgLower === "avaliação" || msgLower === "avaliacao" || msgLower === "4" || msgLower === "4️⃣" || msgLower === "5" || msgLower === "5️⃣") {
    const avalMsg = getMensagemAvaliacao()
    if (avalMsg) {
      await enviarTexto(avalMsg)
      await enviarTexto("🌟 Obrigado pelo feedback!")
    } else {
      await enviarTexto("Avaliações desativadas no momento.")
    }
    return
  }

  if (msgLower === "falar com atendente" || msgLower === "atendente" || msgLower === "2" || msgLower === "2️⃣") {
    await enviarTexto(`🧑‍💻 *Atendente*\n\nUm atendente humano será notificado. Aguarde um momento, por favor!\n\nEnquanto isso, você pode ver nosso *cardápio* digitando *cardápio*.`)
    return
  }

  if (msgLower === "olá" || msgLower === "ola" || msgLower === "oi" || msgLower === "bom dia" || msgLower === "boa tarde" || msgLower === "boa noite" || msgLower === "iniciar" || msgLower === "começar") {
    sessao.etapa = "saudacao"
    sessao.historico = []
    sessao.pedidoAtual = []
    const bemVindo = getMensagemBemVindo()
    sessao.historico.push({ role: "assistant", content: bemVindo })
    await enviarTexto(bemVindo)
    return
  }

  // IA responde
  sessao.historico.push({ role: "user", content: mensagem })
  const resposta = await gerarRespostaIA(mensagem, sessao.historico)
  sessao.historico.push({ role: "assistant", content: resposta })

  // Tenta enviar como áudio se tiver ElevenLabs configurado
  if (config.elevenlabs.api_key) {
    const audioBuffer = await textToSpeech(resposta.replace(/\*+/g, ""))
    if (audioBuffer) {
      try {
        await enviarAudio(audioBuffer)
      } catch {
        await enviarTexto(resposta)
      }
      return
    }
  }

  await enviarTexto(resposta)

  // Se falou sobre finalizar pedido, envia avaliação
  if (resposta.toLowerCase().includes("avalia") || resposta.toLowerCase().includes("obrigado") && resposta.toLowerCase().includes("pedido")) {
    const avalMsg = getMensagemAvaliacao()
    if (avalMsg) {
      setTimeout(() => enviarTexto(avalMsg), 2000)
    }
  }
}

// Limpa sessões inativas a cada 30 min
setInterval(() => {
  const agora = new Date()
  for (const [num, sessao] of sessoes.entries()) {
    const diffMin = (agora.getTime() - sessao.ultimaAtividade.getTime()) / 60000
    if (diffMin > 60) {
      sessoes.delete(num)
    }
  }
}, 30 * 60 * 1000)
