export const config = { path: '/api/chat' }

const MODEL = 'gpt-5'

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })

  const key = process.env.OPENAI_API_KEY
  if (!key) return new Response('OPENAI_API_KEY is not set', { status: 500 })

  const { messages, tools } = (await req.json()) as { messages: unknown; tools: unknown[] }

  const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(Array.isArray(tools) && tools.length ? { tools, tool_choice: 'auto' } : {}),
    }),
  })

  if (!upstream.ok) {
    return new Response(await upstream.text(), { status: upstream.status })
  }

  const data = await upstream.json()
  return Response.json(data.choices?.[0]?.message ?? { role: 'assistant', content: '' })
}
