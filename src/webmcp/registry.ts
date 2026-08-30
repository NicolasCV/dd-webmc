import { computeTools } from '../game/tools'
import { useGame } from '../store'
import { modelContext, type WebMcpTool } from './context'

const live = new Map<string, { ctrl: AbortController; def: WebMcpTool }>()
let queue: Promise<void> = Promise.resolve()

export const liveDefs = () => [...live.values()].map((v) => v.def)
export const settled = () => queue

// The tool is gone the moment the world changes; the struck-through rule outlives it by
// 200ms to draw and 900ms to hold, so the loss registers without blocking anything.
const STRIKE_MS = 1100

// document.modelContext can be injected after first paint, so the page may start on the
// local fallback and be handed the real one later. Everything must move across.
let ctx: unknown = null

async function run(desired: WebMcpTool[]) {
  const mc = modelContext()
  if (ctx && ctx !== mc) live.clear()
  ctx = mc

  const want = new Map(desired.map((t) => [t.name, t]))
  const gone = [...live.entries()].filter(([name]) => !want.has(name))

  if (gone.length) {
    const names = gone.map(([name]) => name)
    for (const [name, entry] of gone) {
      entry.ctrl.abort()
      live.delete(name)
    }
    const g = useGame.getState()
    g.count('unregistered', names.length)
    if (g.sheet) g.say('world', names.join(', '), { act: 'tools_unregistered' })
    g.setStriking(names)
    setTimeout(() => {
      const s = useGame.getState()
      s.setStriking(s.striking.filter((n) => !names.includes(n)))
    }, STRIKE_MS)
  }

  const added: string[] = []
  for (const [name, def] of want) {
    if (live.has(name)) continue
    const ctrl = new AbortController()
    await mc.registerTool(def, { signal: ctrl.signal })
    live.set(name, { ctrl, def })
    added.push(name)
  }

  if (added.length) {
    const g = useGame.getState()
    g.count('registered', added.length)
    if (g.sheet) g.say('world', added.join(', '), { act: 'tools_registered' })
  }
}

// A rejected registerTool -- empty description, duplicate name, tools=() policy -- must
// not poison the chain: every later reconcile would be skipped and settled() would throw
// on every turn after it, with nothing registered and no way back.
export const reconcile = (desired: WebMcpTool[]) =>
  (queue = queue.then(() => run(desired)).catch((err) => console.error('registry', err)))

/**
 * Registration is driven straight off world state, not from a React effect — the
 * agent reads the registry, so it must not lag a render behind the world.
 */
export function startRegistry() {
  resync()
  return useGame.subscribe((s, prev) => {
    if (s.sheet !== prev.sheet || s.roomId !== prev.roomId || s.flags !== prev.flags) resync()
  })
}

/** Reconcile against whatever context is current — also how a late-injected one gets filled. */
export function resync() {
  const s = useGame.getState()
  return reconcile(computeTools(s.sheet, s.roomId, s.flags))
}
