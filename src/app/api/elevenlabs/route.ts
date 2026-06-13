import { NextRequest, NextResponse } from "next/server"
import { textToSpeech, getVoices } from "@/lib/elevenlabs"

export async function GET() {
  const voices = await getVoices()
  return NextResponse.json({ voices })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { texto } = body

  if (!texto) {
    return NextResponse.json({ error: "Texto é obrigatório" }, { status: 400 })
  }

  const audio = await textToSpeech(texto)
  if (!audio) {
    return NextResponse.json({ error: "Erro ao gerar áudio" }, { status: 500 })
  }

  return new NextResponse(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": audio.length.toString(),
    },
  })
}
