export interface Empresa {
  nome: string
  descricao: string
  telefone: string
  endereco: string
  horario_funcionamento: string
  logo: string
  cor_primaria: string
  cor_secundaria: string
}

export interface WhatsApp {
  session_path: string
  mensagem_bem_vindo: string
}

export interface ElevenLabs {
  api_key: string
  voice_id: string
  model: string
  stability: number
  similarity_boost: number
}

export interface IA {
  provider: string
  api_key: string
  model: string
  temperatura: number
  max_tokens: number
  prompt_sistema: string
}

export interface ItemCardapio {
  nome: string
  descricao: string
  preco: number
  imagem: string
}

export interface Categoria {
  nome: string
  emoji: string
  itens: ItemCardapio[]
}

export interface Cardapio {
  moeda: string
  categorias: Categoria[]
}

export interface Avaliacoes {
  ativar: boolean
  link: string
  mensagem: string
}

export interface Pagamento {
  ativar: boolean
  link_manual: string
  mensagem: string
}

export interface Admin {
  senha: string
  sessao_expiracao_minutos: number
}

export interface Config {
  empresa: Empresa
  whatsapp: WhatsApp
  elevenlabs: ElevenLabs
  ia: IA
  cardapio: Cardapio
  avaliacoes: Avaliacoes
  pagamento: Pagamento
  admin: Admin
}

export interface Mensagem {
  id: string
  de: string
  conteudo: string
  tipo: "texto" | "audio" | "imagem"
  timestamp: Date
  lida: boolean
}

export interface Pedido {
  id: string
  cliente: string
  itens: { nome: string; quantidade: number; preco: number }[]
  total: number
  status: "novo" | "preparando" | "saiu_entrega" | "entregue" | "cancelado"
  endereco_entrega: string
  forma_pagamento: string
  observacao: string
  criado_em: Date
}
