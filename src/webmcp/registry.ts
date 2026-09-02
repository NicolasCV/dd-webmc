import { computeTools } from '../game/tools'
import { useGame } from '../store'
import { modelContext, type WebMcpTool } from './context'

const live = new Map<string, { ctrl: AbortController; def: WebMcpTool }>()
let queue: Promise<void> = Promise.resolve()

export const liveDefs = () => [...live.values()].map((v) => v.def)
export const settled = () => queue

// Strike outlives the already-unregistered tool: 200ms to draw, 900ms to hold.
const STRIKE_MS = 1100

// document.modelContext can arrive after first paint; re-register all tools on the new one.
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

// Catch is load-bearing: one rejected registerTool poisons the queue chain forever.
export const reconcile = (desired: WebMcpTool[]) =>
  (queue = queue.then(() => run(desired)).catch((err) => console.error('registry', err)))

// Store subscription, not a React effect: the registry must not lag a render behind the world.
export function startRegistry() {
  resync()
  return useGame.subscribe((s, prev) => {
    if (s.sheet !== prev.sheet || s.roomId !== prev.roomId || s.flags !== prev.flags) resync()
  })
}

export function resync() {
  const s = useGame.getState()
  return reconcile(computeTools(s.sheet, s.roomId, s.flags))
}
