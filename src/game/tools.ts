import { speak } from '../audio'
import { useGame } from '../store'
import type { WebMcpTool } from '../webmcp/context'
import type { Sheet } from './sheet'
import { gateOpen } from './sheet'
import type { Challenge, Prop, Room, Skill } from './world'
import { roll, rooms } from './world'

const empty = { type: 'object', properties: {} } as const

const textSchema = {
  type: 'object',
  properties: { text: { type: 'string', description: 'The line, in his voice. One or two sentences.' } },
  required: ['text'],
} as const

const speechTools = (sheet: Sheet): WebMcpTool[] =>
  sheet.speechActs
    .filter((a) => gateOpen(a.name, sheet.disposition))
    .map(({ name, description }) => ({
      name,
      description,
      inputSchema: textSchema,
      annotations: { readOnlyHint: false },
      execute: (input) => {
        const text = String((input as { text?: unknown }).text ?? '')
        useGame.getState().say('companion', text, name)
        speak(text, sheet.voice.ttsVoiceId)
        return 'ok' // terse by design: prose here is what the model paraphrases warmly
      },
    }))

const attempt = (c: Challenge, attrs: Sheet['attributes'], dcBump = 0) => {
  const g = useGame.getState()
  // The tool stays registered for the length of the strike-out animation, so it can be
  // called once more after it has already done its job.
  if (c.gone && g.flags.includes(c.gone)) return `${c.id} → already done.`
  const r = roll(attrs[c.attr], c.dc + dcBump)
  const line = `${c.id} → ${r.ok ? 'OK' : 'FAIL'}. ${r.total} vs DC ${r.dc}. ${r.ok ? c.success : c.fail}`
  g.setRoll({ ...r, of: c.id })
  g.say('world', line)
  const flag = r.ok ? c.sets : c.failSets
  if (flag && !g.flags.includes(flag)) {
    g.setFlag(flag)
    if (flag === 'noise') wakeSomething()
  }
  return line
}

// Failure has to be eventful or the dice are decoration. Fires once, and waits for the
// current turn to end rather than being swallowed by it -- the whole point is that the
// companion reacts to this unprompted.
function wakeSomething() {
  const heard = 'Two rooms down, something that had been still stops being still.'
  const fire = async (tries = 0) => {
    const g = useGame.getState()
    if (g.halted || tries > 12) return
    if (g.busy) return void setTimeout(() => void fire(tries + 1), 1000)
    g.say('world', heard)
    const { agentTurn } = await import('../agent/turn')
    void agentTurn(`${heard} You both heard it.`)
  }
  setTimeout(() => void fire(), 2500)
}

/** Untrained, and it shows. Exists so no room is ever sealed by the companion's sheet. */
export const playerAttempt = (c: Challenge) => attempt(c, { str: 10, dex: 10, wis: 10, cha: 10 }, 2)

export const playerChallenges = (room: Room, sheet: Sheet | null, flags: string[]) =>
  (room.challenges ?? []).filter(
    (c) => !sheet?.skills.includes(c.skill) && !(c.gone && flags.includes(c.gone)),
  )

export const examineProp = (p: Prop) => {
  const g = useGame.getState()
  g.say('world', p.onExamine, `examine_${p.id}`)
  if (p.reveals) g.setFlag(p.reveals)
  g.setFlag(seen(p))
  return p.onExamine
}

const seen = (p: Prop) => `seen_${p.id}`

/**
 * Blocks until the world does something worth noticing, so an external agent has
 * somewhere to put its attention between acts. Never blocks indefinitely -- external
 * agents abandon hanging tools, and a soft return invites another call.
 */
const WAIT_MS = 20_000

let ownTurn = false
export const setOwnTurn = (v: boolean) => {
  ownTurn = v
}

const nextEvent = () =>
  new Promise<string | null>((resolve) => {
    const from = useGame.getState().bubbles.length
    let done: () => void
    const timer = setTimeout(() => {
      done()
      resolve(null)
    }, WAIT_MS)
    const unsub = useGame.subscribe((s) => {
      const b = s.bubbles[s.bubbles.length - 1]
      if (s.bubbles.length > from && b && b.who !== 'companion') {
        done()
        resolve(`${b.act ? `${b.act}: ` : ''}${b.text}`)
      }
    })
    done = () => {
      clearTimeout(timer)
      unsub()
    }
  })

const waitTool: WebMcpTool = {
  name: 'wait_for_moment',
  description:
    "Wait until something happens that you'd notice. Returns what you perceive. " +
    "Call this when you've finished acting and want to see what unfolds.",
  inputSchema: empty,
  annotations: { readOnlyHint: true },
  // In our own panel the player's next line is already the trigger, so waiting here
  // would just stall the turn. External agents get the real blocking behaviour.
  execute: async () => {
    if (ownTurn) return 'A quiet moment. Nothing yet.'
    return (await nextEvent()) ?? 'A quiet moment. Nothing yet. Call again to keep waiting.'
  },
}

export const go = (to: string) => {
  const g = useGame.getState()
  const room = rooms[to]
  g.enter(to)
  g.setRoll(null)
  g.say('world', room.description, room.name)
  return `move_${to} → OK. ${room.name}.`
}

const challengeTool = (sheet: Sheet) => (c: Challenge): WebMcpTool => ({
  name: c.id,
  description: c.description,
  inputSchema: empty,
  execute: () => attempt(c, sheet.attributes),
})

const examineTool = (p: Prop): WebMcpTool => ({
  name: `examine_${p.id}`,
  description: `Look at ${p.label}. Properly, not a glance. You will get back what is there and nothing about how it makes anyone feel.`,
  inputSchema: empty,
  annotations: { readOnlyHint: true },
  execute: () => examineProp(p),
})

const moveTool = (to: string): WebMcpTool => ({
  name: `move_${to}`,
  description: `Walk to ${rooms[to].name}. You go, and the other one follows or doesn't.`,
  inputSchema: empty,
  execute: () => go(to),
})

/** Looking twice at the same thing is not a capability, and the room stays under cap. */
export const unseenProps = (room: Room, flags: string[]) =>
  room.props.slice(0, 3).filter((p) => !flags.includes(seen(p)))

export const openExits = (room: Room, flags: string[]) =>
  room.exits.filter((e) => !e.needs || flags.includes(e.needs))

/** The single source of truth for what it can do right now. Keep the total under 12. */
export function computeTools(sheet: Sheet | null, roomId: string, flags: string[]): WebMcpTool[] {
  if (!sheet) return []
  const room = rooms[roomId]
  const has = (skill: Skill) => sheet.skills.includes(skill)
  return [
    ...speechTools(sheet),
    ...(room.challenges ?? [])
      .filter((c) => has(c.skill) && !(c.gone && flags.includes(c.gone)))
      .map(challengeTool(sheet)),
    ...unseenProps(room, flags).filter((p) => !p.requires || has(p.requires)).map(examineTool),
    ...openExits(room, flags).map((e) => moveTool(e.to)),
    waitTool,
  ]
}
