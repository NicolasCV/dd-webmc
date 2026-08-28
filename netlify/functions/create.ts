export const config = { path: '/api/create' }

const MODEL = process.env.CREATE_MODEL ?? 'gpt-5-mini'

const SKILLS = [
  'force', 'stealth', 'lockpicking', 'lore', 'perception', 'medicine', 'persuasion', 'intimidation',
]
const ACTS = [
  'state_flatly', 'insist', 'change_subject', 'dismiss', 'refuse_flatly',
  'mock', 'threaten', 'goad', 'reassure', 'encourage', 'apologize', 'admit_fear', 'share_memory',
]

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'oneLine', 'attributes', 'skills', 'speechActs', 'disposition', 'voice'],
  properties: {
    name: { type: 'string' },
    oneLine: { type: 'string', description: 'Six to ten words. No verb needed.' },
    attributes: {
      type: 'object',
      additionalProperties: false,
      required: ['str', 'dex', 'wis', 'cha'],
      properties: {
        str: { type: 'integer' }, dex: { type: 'integer' },
        wis: { type: 'integer' }, cha: { type: 'integer' },
      },
    },
    skills: { type: 'array', maxItems: 5, items: { type: 'string', enum: SKILLS } },
    speechActs: {
      type: 'array',
      maxItems: 6,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'description'],
        properties: {
          name: { type: 'string', enum: ACTS },
          description: { type: 'string' },
        },
      },
    },
    disposition: {
      type: 'object',
      additionalProperties: false,
      required: ['warmth', 'nerve'],
      properties: { warmth: { type: 'integer' }, nerve: { type: 'integer' } },
    },
    voice: {
      type: 'object',
      additionalProperties: false,
      required: ['direction', 'ttsVoiceId'],
      properties: {
        direction: { type: 'string' },
        ttsVoiceId: { type: 'string', enum: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] },
      },
    },
  },
}

// The speech acts become the character's entire expressive range, so the descriptions
// are the deliverable here, not the stat block.
const SYSTEM = `Turn a player's description into a tabletop character sheet.

Attributes are 3-18. At most 5 skills, at most 6 speech acts.

Speech acts come in families, and a family is only available if the disposition allows it:
  assert (state_flatly, insist) - always
  deflect (change_subject, dismiss) - always
  refuse (refuse_flatly) - always
  provoke (mock, threaten, goad) - only if nerve > 50
  support (reassure, encourage, apologize) - only if warmth > 60
  disclose (admit_fear, share_memory) - only if warmth > 75

Set warmth and nerve from the description first, then choose acts the gates permit.
A cold character must not be given supportive acts. Do not hedge the disposition to
keep options open - a character who can do everything is not a character.

Each description is written in second person, addressed to the character, in their
voice. It says when they reach for this and what it never is. "Mock the player." is
useless; "Say something cutting - you do this when someone is being soft, especially
when they're scared" is the job. Two or three sentences each.`

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 })
  const key = process.env.OPENAI_API_KEY
  if (!key) return new Response('OPENAI_API_KEY is not set', { status: 500 })

  const { prose } = (await req.json()) as { prose?: string }
  if (!prose?.trim()) return new Response('prose is required', { status: 400 })

  const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: prose.slice(0, 2000) },
      ],
      reasoning_effort: 'low',
      max_completion_tokens: 4000,
      response_format: { type: 'json_schema', json_schema: { name: 'sheet', strict: true, schema } },
    }),
  })
  if (!upstream.ok) return new Response(await upstream.text(), { status: upstream.status })

  const data = await upstream.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) return new Response('model returned no sheet', { status: 502 })
  return new Response(content, { headers: { 'content-type': 'application/json' } })
}
