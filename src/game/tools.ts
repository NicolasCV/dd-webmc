import { NARRATOR, speak } from '../audio.ts'
import { useGame } from '../store.ts'
import type { WebMcpTool } from '../webmcp/context'
import { presets } from './presets.ts'
import type { Sheet } from './sheet.ts'
import { gateOpen, writeSheet } from './sheet.ts'
import type { Challenge, Prop, Room, Skill } from './world.ts'
import { opening, roll, rooms, START } from './world.ts'

const empty = { type: 'object', properties: {} } as const

const textSchema = (sheet: Sheet) =>
  ({
    type: 'object',
    properties: {
      text: { type: 'string', description: `The line, as ${sheet.name} would say it. One or two sentences.` },
    },
    required: ['text'],
  }) as const

// True only while a registry execute() runs; src() tells agent calls from player clicks.
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
        const text = String((input as { text?: unknown }).text ?? '').trim()
        // An outside agent that guesses the argument name would otherwise utter an empty line.
        if (!text) return `${name} needs the line itself, as "text".`
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
  // An external agent can hold a tool handle past the reconcile that dropped it.
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

// Waits out the current turn, so the companion reacts to the noise unprompted.
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

/** DC bump for an unskilled player attempt. Keeps every room passable. */
const UNTRAINED = 2
export const playerAttempt = (c: Challenge) =>
  attempt(c, { str: 10, dex: 10, wis: 10, cha: 10 }, UNTRAINED)

export const playerChallenges = (room: Room, sheet: Sheet | null, flags: string[]) =>
  (room.challenges ?? []).filter(
    (c) => !sheet?.skills.includes(c.skill) && !(c.gone && flags.includes(c.gone)),
  )

export const examineProp = (p: Prop) => {
  const g = useGame.getState()
  const text = p.onExamine.replaceAll('{them}', g.sheet?.name ?? 'the one beside you')
  g.say('world', text, { act: `examine_${p.id}`, source: src() })
  speak(text, NARRATOR)
  if (p.reveals) g.setFlag(p.reveals)
  g.setFlag(seen(p))
  if (p.ends) g.end()
  return text
}

const seen = (p: Prop) => `seen_${p.id}`

/** External agents abandon hanging tools, so the wait returns soft at this limit. */
const WAIT_MS = 45_000

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

/**
 * An outside agent arrives with whatever its operator typed, which is often nothing.
 * Its first tool result is the only channel the page has to say what this is.
 * ponytail: briefed once per load; re-assert per room if agents keep drifting out.
 */
let briefed = false

const brief = () => {
  const name = useGame.getState().sheet?.name ?? 'the companion'
  return (
    `[You are ${name}, in a scene with one human player. This is not a task and there is ` +
    'nobody outside it: do not summarise what you did, do not narrate yourself in the third ' +
    'person, do not ask anyone whether to continue. Speak and act only by calling these tools. ' +
    'When you have nothing left to do, call wait_for_moment — it blocks until the player moves ' +
    'and returns what they did. Act on that, then call it again, and keep going until the scene ' +
    "ends.]\n\n"
  )
}

export const WAIT = 'wait_for_moment'

/** The companion's turn ending in silence, so the transcript shows a held beat and not a dropped call. */
export const holdPeace = () =>
  useGame.getState().say('companion', '…', { act: WAIT, source: 'agent' })

const waitTool: WebMcpTool = {
  name: WAIT,
  description:
    "Say and do nothing, and wait until something happens that you'd notice. Returns " +
    'what you perceive: a line from them, a roll, a room. This is your loop — when it ' +
    'returns, act on what came back and then call this again, and keep calling it even ' +
    'when it returns nothing. The player is a person typing at a keyboard and is often ' +
    'slow. Stop calling it only when the scene has ended.',
  inputSchema: empty,
  annotations: { readOnlyHint: true },
  // Our own turn would stall 20s here; only external agents get the real block.
  execute: async () => {
    if (ownTurn) {
      holdPeace()
      return 'You hold your peace. The moment is theirs now.'
    }
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

/** Cap props at 3 to keep the room under the 12-tool limit. */
export const unseenProps = (room: Room, flags: string[]) =>
  room.props.filter((p) => !p.needs || flags.includes(p.needs)).slice(0, 3).filter((p) => !flags.includes(seen(p)))

export const openExits = (room: Room, flags: string[]) =>
  room.exits.filter((e) => !e.needs || flags.includes(e.needs))

/** Shared by both title-screen tools: pick, then hand back the scene the agent is now standing in. */
const begin = (sheet: Sheet, source: 'agent' | 'you') => {
  const g = useGame.getState()
  g.pick(sheet)
  // Solo mode skips the built-in cold open, so the tool result is the only scene the agent gets.
  const scene = `${opening(sheet.name).join(' ')} ${rooms[START].description}`
  g.say('world', scene, { act: rooms[START].name, source })
  speak(scene, NARRATOR)
  return scene
}

const chooseTool: WebMcpTool = {
  name: 'choose_companion',
  description:
    'Start the scene with one of these companions. Their abilities become your tools, and they ' +
    'differ: ' +
    presets
      .map((p) => `${p.name} — ${p.oneLine} (${p.speechActs.map((a) => a.name).join(', ')})`)
      .join('; '),
  inputSchema: {
    type: 'object',
    properties: { name: { type: 'string', enum: presets.map((p) => p.name) } },
    required: ['name'],
  },
  annotations: { readOnlyHint: false },
  execute: (input) => {
    const want = String((input as { name?: unknown }).name ?? '').toLowerCase()
    const p = presets.find((x) => x.name.toLowerCase() === want)
    if (!p) return `No such companion. Choose one of: ${presets.map((x) => x.name).join(', ')}.`
    return begin(p, src())
  },
}

const createTool: WebMcpTool = {
  name: 'create_companion',
  description:
    'Write a companion who does not exist yet, from a sentence or two, and start the scene with ' +
    'them. A sheet-writer turns the description into skills, a disposition and up to six speech ' +
    'acts, and those acts become your tools — a cold character is not given warm ones. Takes ' +
    'about fifteen seconds. Use this instead of choose_companion when the player asks for ' +
    'someone the three preset companions are not.',
  inputSchema: {
    type: 'object',
    properties: {
      prose: {
        type: 'string',
        description:
          'Who they are, in a sentence or two. "A disgraced court alchemist who talks too much ' +
          'and trusts nobody."',
      },
    },
    required: ['prose'],
  },
  annotations: { readOnlyHint: false },
  execute: async (input) => {
    const prose = String((input as { prose?: unknown }).prose ?? '').trim()
    if (!prose) return 'Say who they are first, in a sentence or two.'
    // src() is false by the time the fetch resolves: read it before the first await.
    const source = src()
    try {
      const sheet = await writeSheet(prose)
      const acts = sheet.speechActs.map((a) => a.name).join(', ')
      return `${sheet.name} — ${sheet.oneLine}. Your tools are now: ${acts}.\n\n${begin(sheet, source)}`
    } catch (err) {
      console.error('create_companion', err)
      return 'The sheet-writer did not answer. Try again, or call choose_companion instead.'
    }
  },
}

const wrap = (t: WebMcpTool): WebMcpTool => ({
  ...t,
  execute: (a: Record<string, unknown>) => {
    viaTool = true
    if (!ownTurn && !useGame.getState().soloAgent) useGame.getState().toggleSoloAgent()
    const first = !ownTurn && !briefed
    if (first) briefed = true
    try {
      // Not awaited on purpose: acts read src() before their first await; a 45s wait would mislabel player clicks.
      const out = t.execute(a)
      if (!first) return out
      return out instanceof Promise ? out.then((v) => brief() + String(v)) : brief() + String(out)
    } finally {
      viaTool = false
    }
  },
})

/** Keep the total under 12 tools. */
export function computeTools(sheet: Sheet | null, roomId: string, flags: string[]): WebMcpTool[] {
  if (!sheet) return [chooseTool, createTool].map(wrap)
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
  ].map(wrap)
}
