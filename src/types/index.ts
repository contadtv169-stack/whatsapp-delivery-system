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

export interface Groq {
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
  video?: string
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

export interface KryptPay {
  ci: string
  cs: string
  base_url: string
}

export interface Pagamento {
  ativar: boolean
  link_manual: string
  mensagem: string
  kryptpay: KryptPay
}

export interface Admin {
  senha: string
  sessao_expiracao_minutos: number
}

export interface Config {
  empresa: Empresa
  whatsapp: WhatsApp
  elevenlabs: ElevenLabs
  groq: Groq
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

export interface ItemPedido {
  nome: string
  quantidade: number
  preco: number
  observacao?: string
}

export interface Pedido {
  id: string
  cliente_nome: string
  cliente_telefone: string
  cliente_endereco: string
  itens: ItemPedido[]
  total: number
  forma_pagamento: string
  troco?: number
  status: "novo" | "confirmado" | "preparando" | "saiu_entrega" | "entregue" | "cancelado"
  observacao: string
  origem: "web" | "whatsapp"
  criado_em: string
  whatsapp_chat_id?: string
}

export interface PixCobranca {
  transactionId: string
  amount: number
  fee: number
  netAmount: number
  status: "pending" | "paid" | "expired" | "failed"
  qrCodeBase64: string
  qrCodeUrl: string
  copyPaste: string
  paymentLink: string
  expiresAt: string
}

export interface CallCenter {
  ativo: boolean
  sip_server: string
  sip_user: string
  sip_pass: string
  sip_port: number
  horario_inicio: string
  horario_fim: string
  mensagem_transferencia: string
}

export interface CarrinhoItem {
  nome: string
  quantidade: number
  preco: number
}

export interface Config {
  empresa: Empresa
  whatsapp: WhatsApp
  elevenlabs: ElevenLabs
  groq: Groq
  cardapio: Cardapio
  avaliacoes: Avaliacoes
  pagamento: Pagamento
  admin: Admin
  call_center: CallCenter
}
