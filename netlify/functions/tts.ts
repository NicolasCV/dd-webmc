export const config = { path: '/api/tts' }

// tts-1 rather than the HD model: this is a demo, and latency matters more than fidelity.
const MODEL = process.env.TTS_MODEL ?? 'tts-1'
const VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })
  const key = process.env.OPENAI_API_KEY
  if (!key) return new Response('OPENAI_API_KEY is not set', { status: 500 })

  const { text, voice } = (await req.json()) as { text?: string; voice?: string }
  if (!text?.trim()) return new Response('text is required', { status: 400 })

  const upstream = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      voice: VOICES.includes(voice ?? '') ? voice : 'onyx',
      input: text.slice(0, 500),
      response_format: 'mp3',
    }),
  })
  if (!upstream.ok) return new Response(await upstream.text(), { status: upstream.status })

  return new Response(upstream.body, {
    headers: { 'content-type': 'audio/mpeg', 'cache-control': 'no-store' },
  })
}
