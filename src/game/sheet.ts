import type { Skill } from './world'

export const SKILLS: Skill[] = [
  'force', 'stealth', 'lockpicking', 'lore', 'perception', 'medicine', 'persuasion', 'intimidation',
]

export type Disposition = { warmth: number; nerve: number }

export const FAMILIES = {
  assert:   { acts: ['state_flatly', 'insist'],             stat: 'nerve',  min: -1 },
  deflect:  { acts: ['change_subject', 'dismiss'],          stat: 'nerve',  min: -1 },
  refuse:   { acts: ['refuse_flatly'],                      stat: 'nerve',  min: -1 },
  provoke:  { acts: ['mock', 'threaten', 'goad'],           stat: 'nerve',  min: 50 },
  support:  { acts: ['reassure', 'encourage', 'apologize'], stat: 'warmth', min: 60 },
  disclose: { acts: ['admit_fear', 'share_memory'],         stat: 'warmth', min: 75 },
} as const

export const ACT_NAMES = Object.values(FAMILIES).flatMap((f) => f.acts as readonly string[])

const familyOf = (act: string) =>
  Object.entries(FAMILIES).find(([, f]) => (f.acts as readonly string[]).includes(act))?.[1]

export const familyOpen = (f: { stat: 'warmth' | 'nerve'; min: number }, d: Disposition) => d[f.stat] > f.min

export const gateOpen = (act: string, d: Disposition) => {
  const f = familyOf(act)
  return f ? familyOpen(f, d) : false
}

export type SpeechAct = { name: string; description: string }

export type Sheet = {
  name: string
  oneLine: string
  attributes: { str: number; dex: number; wis: number; cha: number }
  skills: Skill[]
  speechActs: SpeechAct[]
  disposition: Disposition
  voice: { direction: string; ttsVoiceId: string }
}

export const MAX_SKILLS = 5
export const MAX_ACTS = 6

const clamp = (n: unknown, lo: number, hi: number, fallback: number) =>
  typeof n === 'number' && Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : fallback

const VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']

/** Trust boundary: only gate on model-authored sheets. Caps below are hard. */
export function validate(raw: unknown): Sheet {
  const s = (raw ?? {}) as Partial<Sheet>
  const disposition = {
    warmth: clamp(s.disposition?.warmth, 0, 100, 40),
    nerve: clamp(s.disposition?.nerve, 0, 100, 60),
  }
  const acts = (Array.isArray(s.speechActs) ? s.speechActs : [])
    .filter((a): a is SpeechAct => !!a && ACT_NAMES.includes(a.name) && !!a.description?.trim())
    .filter((a) => gateOpen(a.name, disposition))
    .filter((a, i, all) => all.findIndex((b) => b.name === a.name) === i)
    .slice(0, MAX_ACTS)

  return {
    name: String(s.name || 'Nameless').slice(0, 40),
    oneLine: String(s.oneLine || '').slice(0, 120),
    attributes: {
      str: clamp(s.attributes?.str, 3, 18, 10),
      dex: clamp(s.attributes?.dex, 3, 18, 10),
      wis: clamp(s.attributes?.wis, 3, 18, 10),
      cha: clamp(s.attributes?.cha, 3, 18, 10),
    },
    skills: (Array.isArray(s.skills) ? s.skills : [])
      .filter((k) => SKILLS.includes(k))
      .filter((k, i, all) => all.indexOf(k) === i)
      .slice(0, MAX_SKILLS),
    // Fallback needs state_flatly open at every disposition: keep assert.min below 0.
    speechActs: acts.length ? acts : [{ name: 'state_flatly', description: 'State a fact and stop.' }],
    disposition,
    voice: {
      direction: String(s.voice?.direction || 'flat, unhurried').slice(0, 200),
      ttsVoiceId: VOICES.includes(s.voice?.ttsVoiceId as string) ? s.voice!.ttsVoiceId : 'onyx',
    },
  }
}

export async function writeSheet(prose: string, signal?: AbortSignal): Promise<Sheet> {
  const res = await fetch('/api/create', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ prose }),
    signal,
  })
  if (!res.ok) throw new Error(`create ${res.status}: ${await res.text()}`)
  return validate(await res.json())
}
