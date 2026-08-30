import { NARRATOR, speak } from '../audio.ts'
import { useGame } from '../store.ts'
import type { WebMcpTool } from '../webmcp/context'
import type { Sheet } from './sheet.ts'
import { gateOpen } from './sheet.ts'
import type { Challenge, Prop, Room, Skill } from './world.ts'
import { roll, rooms } from './world.ts'

const empty = { type: 'object', properties: {} } as const

const textSchema = (sheet: Sheet) =>
  ({
    type: 'object',
    properties: {
      text: { type: 'string', description: `The line, as ${sheet.name} would say it. One or two sentences.` },
    },
    required: ['text'],
  }) as const

// Set only while a tool's execute() is running, so every act can say whether it was
// invoked through the registry or by the player's own button.
let viaTool = false
const src = (): 'agent' | 'you' => (viaTool ? 'agent' : 'you')

const speechTools = (sheet: Sheet): WebMcpTool[] =>
  sheet.speechActs
    .filter((a) => gateOpen(a.name, sheet.disposition))
    .map(({ name, description }) => ({
      name,
      description,
      inputSchema: textSchema(sheet),
      annotations: { readOnlyHint: false },
      execute: (input) => {
        const text = String((input as { text?: unknown }).text ?? '')
        useGame.getState().say('companion', text, {
          act: name,
          source: 'agent',
          args: JSON.stringify({ text }),
        })
        speak(text, sheet.voice.ttsVoiceId)
        return 'ok' // terse by design: prose here is what the model paraphrases warmly
      },
    }))

const attempt = (c: Challenge, attrs: Sheet['attributes'], dcBump = 0) => {
  const g = useGame.getState()
  // An external agent can hold a tool handle past the reconcile that dropped it, so the
  // guard is here rather than in the registry.
  if (c.gone && g.flags.includes(c.gone)) return `${c.id} → already done.`
  const dc = c.dc + dcBump - (c.easedBy && g.flags.includes(c.easedBy) ? 2 : 0)
  const r = roll(attrs[c.attr], dc)
  const line = `${c.id} → ${r.ok ? 'OK' : 'FAIL'}. ${r.total} vs DC ${r.dc}. ${r.ok ? c.success : c.fail}`
  g.setRoll({ ...r, of: c.id, mine: dcBump > 0 })
  g.say('world', r.ok ? c.success : c.fail, {
    act: c.id,
    source: src(),
    roll: { of: c.id, d20: r.d20, total: r.total, dc: r.dc, ok: r.ok },
  })
  speak(r.ok ? c.success : c.fail, NARRATOR)
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
    if (g.halted || g.ended || tries > 12) return
    if (g.busy) return void setTimeout(() => void fire(tries + 1), 1000)
    g.say('world', heard)
    speak(heard, NARRATOR)
    const { agentTurn } = await import('../agent/turn')
    void agentTurn(`${heard} You both heard it.`)
  }
  setTimeout(() => void fire(), 2500)
}

/** Untrained, and it shows. Exists so no room is ever sealed by the companion's sheet. */
export const UNTRAINED = 2
export const playerAttempt = (c: Challenge) =>
  attempt(c, { str: 10, dex: 10, wis: 10, cha: 10 }, UNTRAINED)

export const playerChallenges = (room: Room, sheet: Sheet | null, flags: string[]) =>
  (room.challenges ?? []).filter(
    (c) => !sheet?.skills.includes(c.skill) && !(c.gone && flags.includes(c.gone)),
  )

export const examineProp = (p: Prop) => {
  const g = useGame.getState()
  g.say('world', p.onExamine, { act: `examine_${p.id}`, source: src() })
  speak(p.onExamine, NARRATOR)
  if (p.reveals) g.setFlag(p.reveals)
  g.setFlag(seen(p))
  if (p.ends) g.end()
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
  g.say('world', room.description, { act: room.name, source: src() })
  speak(`${room.name}. ${room.description}`, NARRATOR)
  return `move_${to} → OK. ${room.name}.`
}

const challengeTool = (sheet: Sheet) => (c: Challenge): WebMcpTool => ({
  name: c.id,
  description: c.description,
  inputSchema: empty,
  // WebMCP's dictionary carries only readOnlyHint; destructive/idempotent are MCP-side.
  annotations: { readOnlyHint: false },
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
  annotations: { readOnlyHint: false },
  execute: () => go(to),
})

/** Looking twice at the same thing is not a capability, and the room stays under cap. */
export const unseenProps = (room: Room, flags: string[]) =>
  room.props.filter((p) => !p.needs || flags.includes(p.needs)).slice(0, 3).filter((p) => !flags.includes(seen(p)))

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
  ].map((t) => ({
    // The only place a tool's execute can be reached from outside, so it is the only
    // place that can tell an agent's call from the player pressing a chip.
    ...t,
    execute: (a: Record<string, unknown>) => {
      viaTool = true
      if (!ownTurn && !useGame.getState().soloAgent) useGame.getState().toggleSoloAgent()
      try {
        // Deliberately not awaited: every act reads src() before its first await, while
        // wait_for_moment blocks for 20s -- holding the flag that long would stamp the
        // player's own chip clicks as agent tool calls.
        return t.execute(a)
      } finally {
        viaTool = false
      }
    },
  }))
}
