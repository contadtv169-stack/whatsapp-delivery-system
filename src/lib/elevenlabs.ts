import axios from "axios"
import { getConfig } from "./config"

export async function textToSpeech(texto: string): Promise<Buffer | null> {
  const config = getConfig()
  const { api_key, voice_id, model, stability, similarity_boost } = config.elevenlabs

  if (!api_key) {
    console.warn("ElevenLabs API key não configurada")
    return null
  }

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        text: texto,
        model_id: model || "eleven_multilingual_v2",
        voice_settings: {
          stability: stability || 0.5,
          similarity_boost: similarity_boost || 0.75,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": api_key,
        },
        responseType: "arraybuffer",
      }
    )

    return Buffer.from(response.data)
  } catch (error: unknown) {
    console.error("Erro no ElevenLabs:", error instanceof Error ? error.message : String(error))
    return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getVoices(): Promise<any[]> {
  const config = getConfig()
  const { api_key } = config.elevenlabs

  if (!api_key) return []

  try {
    const response = await axios.get("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": api_key },
    })
    return response.data.voices || []
  } catch {
    return []
  }
}
