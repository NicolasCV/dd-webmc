import type { Skill } from './world'

export const SKILLS: Skill[] = [
  'force', 'stealth', 'lockpicking', 'lore', 'perception', 'medicine', 'persuasion', 'intimidation',
]

export type Disposition = { warmth: number; nerve: number }

/** Six families. Which ones a disposition opens is the whole mechanic. */
export const FAMILIES = {
  assert: { acts: ['state_flatly', 'insist'], gate: () => true },
  deflect: { acts: ['change_subject', 'dismiss'], gate: () => true },
  refuse: { acts: ['refuse_flatly'], gate: () => true },
  provoke: { acts: ['mock', 'threaten', 'goad'], gate: (d: Disposition) => d.nerve > 50 },
  support: { acts: ['reassure', 'encourage', 'apologize'], gate: (d: Disposition) => d.warmth > 60 },
  disclose: { acts: ['admit_fear', 'share_memory'], gate: (d: Disposition) => d.warmth > 75 },
} as const

export const ACT_NAMES = Object.values(FAMILIES).flatMap((f) => f.acts as readonly string[])

const familyOf = (act: string) =>
  Object.entries(FAMILIES).find(([, f]) => (f.acts as readonly string[]).includes(act))?.[1]

export const gateOpen = (act: string, d: Disposition) => familyOf(act)?.gate(d) ?? false

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

/**
 * A player who asks for a god that can do everything must come back with a legal
 * sheet, not forty tools. Everything below is a hard cap, not a suggestion.
 */
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
    // A character with no way to speak is a dead end, so fall back to the one act
    // every disposition permits.
    speechActs: acts.length ? acts : [{ name: 'state_flatly', description: 'State a fact and stop.' }],
    disposition,
    voice: {
      direction: String(s.voice?.direction || 'flat, unhurried').slice(0, 200),
      ttsVoiceId: VOICES.includes(s.voice?.ttsVoiceId as string) ? s.voice!.ttsVoiceId : 'onyx',
    },
  }
}
