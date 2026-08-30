export const config = { path: '/api/chat' }

// Cheap by default; the eval (design doc §10) overrides this to compare setups.
const MODEL = process.env.CHAT_MODEL ?? 'gpt-5-mini'

// Reasoning tokens count toward this cap, so leave headroom above the one or two
// sentences a speech act actually emits.
const MAX_COMPLETION_TOKENS = 1500

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })

  const key = process.env.OPENAI_API_KEY
  if (!key) return new Response('OPENAI_API_KEY is not set', { status: 500 })

  const { messages, tools } = (await req.json()) as { messages: unknown; tools: unknown[] }

  // Open proxy on the owner's key: bound it well above real play (the game's own ceiling is 12 tools).
  if (!Array.isArray(messages) || messages.length > 80 || JSON.stringify(messages).length > 60_000)
    return new Response('too large', { status: 413 })
  if (Array.isArray(tools) && tools.length > 14) return new Response('too many tools', { status: 413 })

  const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages,
      reasoning_effort: 'low',
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      ...(Array.isArray(tools) && tools.length ? { tools, tool_choice: 'auto' } : {}),
    }),
  })

  if (!upstream.ok) {
    console.error(await upstream.text())
    return new Response('upstream', { status: upstream.status === 429 ? 429 : 502 })
  }

  const data = await upstream.json()
  return Response.json(data.choices?.[0]?.message ?? { role: 'assistant', content: '' })
}
