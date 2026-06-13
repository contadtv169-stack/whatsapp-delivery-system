import axios from "axios"
import { getConfig } from "./config"
import type { PixCobranca } from "@/types"

const API = axios.create({
  headers: { "Content-Type": "application/json" },
})

export async function criarPix(
  amount: number,
  payerName: string,
  payerDocument: string,
  description: string
): Promise<PixCobranca | null> {
  const config = getConfig()
  const { ci, cs, base_url } = config.pagamento.kryptpay

  if (!cs) {
    console.warn("KryptPay CS não configurado")
    return null
  }

  try {
    const response = await API.post(
      `${base_url}/api/gateway/pix-create`,
      { amount, payerName, payerDocument, description },
      { headers: { ci, cs } }
    )

    if (response.data?.success) {
      return response.data.data as PixCobranca
    }
    return null
  } catch (error: unknown) {
    console.error("Erro KryptPay:", error instanceof Error ? error.message : String(error))
    return null
  }
}

export async function consultarPix(transactionId: string): Promise<{ status: string; paidAt?: string } | null> {
  const config = getConfig()
  const { ci, cs, base_url } = config.pagamento.kryptpay

  if (!cs) return null

  try {
    const response = await API.get(`${base_url}/api/gateway/pix-status`, {
      params: { transactionId },
      headers: { ci, cs },
    })

    if (response.data?.success) {
      return response.data.data
    }
    return null
  } catch (error: unknown) {
    console.error("Erro ao consultar PIX:", error instanceof Error ? error.message : String(error))
    return null
  }
}

export async function consultarSaldo(): Promise<Record<string, unknown> | null> {
  const config = getConfig()
  const { ci, cs, base_url } = config.pagamento.kryptpay

  if (!cs) return null

  try {
    const response = await API.get(`${base_url}/api/gateway/balance`, {
      headers: { ci, cs },
    })

    if (response.data?.success) {
      return response.data.data
    }
    return null
  } catch {
    return null
  }
}
