import OpenAI from "openai"
import { getConfig, formatPrompt } from "./config"
import type { Categoria } from "@/types"

let openai: OpenAI | null = null

function getOpenAI(): OpenAI | null {
  const config = getConfig()
  if (!config.ia.api_key) return null
  if (!openai) {
    openai = new OpenAI({ apiKey: config.ia.api_key })
  }
  return openai
}

function montarCardapioTexto(): string {
  const config = getConfig()
  let texto = "CARDÁPIO:\n\n"
  for (const cat of config.cardapio.categorias) {
    texto += `${cat.emoji} ${cat.nome}:\n`
    for (const item of cat.itens) {
      texto += `  • ${item.nome} - ${config.cardapio.moeda} ${item.preco.toFixed(2)}\n`
      texto += `    ${item.descricao}\n`
    }
    texto += "\n"
  }
  return texto
}

function formatarCardapioParaMensagem(): string {
  const config = getConfig()
  let msg = `🍽️ *CARDÁPIO - ${config.empresa.nome}*\n\n`
  for (const cat of config.cardapio.categorias) {
    msg += `${cat.emoji} *${cat.nome}*\n`
    for (const item of cat.itens) {
      msg += `▫️ ${item.nome} - ${config.cardapio.moeda} ${item.preco.toFixed(2)}\n`
    }
    msg += "\n"
  }
  msg += "Digite o nome do item para mais detalhes ou *finalizar* para pedir."
  return msg
}

export async function gerarRespostaIA(mensagem: string, historico: {role: string, content:string}[] = []): Promise<string> {
  const config = getConfig()
  const client = getOpenAI()

  if (!client) {
    return `🧑‍💼 *Atendimento ${config.empresa.nome}*\n\nNo momento não temos IA disponível. Um atendente humano irá te atender em breve!\n\nEnquanto isso, digite *cardápio* para ver nosso cardápio.`
  }

  const promptSistema = formatPrompt(config.ia.prompt_sistema, {
    nome: config.empresa.nome,
    descricao: config.empresa.descricao,
    telefone: config.empresa.telefone,
    endereco: config.empresa.endereco,
  })

  const cardapioTexto = montarCardapioTexto()

  const messages: any[] = [
    { role: "system", content: `${promptSistema}\n\n${cardapioTexto}` },
    ...historico.slice(-10),
    { role: "user", content: mensagem },
  ]

  try {
    const response = await client.chat.completions.create({
      model: config.ia.model || "gpt-4o-mini",
      messages,
      temperature: config.ia.temperatura || 0.7,
      max_tokens: config.ia.max_tokens || 300,
    })

    return response.choices[0]?.message?.content || "Desculpe, não entendi. Pode repetir?"
  } catch (error: any) {
    console.error("Erro na IA:", error.message)
    return "❌ Erro ao processar sua mensagem. Tente novamente."
  }
}

export function getMensagemCardapio(): string {
  return formatarCardapioParaMensagem()
}

export function getMensagemBemVindo(): string {
  const config = getConfig()
  return formatPrompt(config.whatsapp.mensagem_bem_vindo, {
    nome: config.empresa.nome,
    descricao: config.empresa.descricao,
    telefone: config.empresa.telefone,
    endereco: config.empresa.endereco,
    link_avaliacao: config.avaliacoes.link,
    link_pagamento: config.pagamento.link_manual,
  })
}

export function getMensagemAvaliacao(): string {
  const config = getConfig()
  if (!config.avaliacoes.ativar) return ""
  return formatPrompt(config.avaliacoes.mensagem, {
    link: config.avaliacoes.link,
    nome: config.empresa.nome,
  })
}

export function getMensagemPagamento(): string {
  const config = getConfig()
  if (!config.pagamento.ativar) return ""
  return formatPrompt(config.pagamento.mensagem, {
    link: config.pagamento.link_manual,
    telefone: config.empresa.telefone,
    nome: config.empresa.nome,
  })
}
