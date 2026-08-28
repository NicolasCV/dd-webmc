import { computeTools } from '../game/tools'
import { useGame } from '../store'
import { modelContext, type WebMcpTool } from './context'

const live = new Map<string, { ctrl: AbortController; def: WebMcpTool }>()
let queue: Promise<void> = Promise.resolve()

export const liveDefs = () => [...live.values()].map((v) => v.def)
export const settled = () => queue

// 200ms for the rule to draw, 900ms to hold it so the loss registers.
const STRIKE_MS = 1100
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

async function run(desired: WebMcpTool[]) {
  const mc = modelContext()
  const want = new Map(desired.map((t) => [t.name, t]))
  const gone = [...live.entries()].filter(([name]) => !want.has(name))

  if (gone.length) {
    useGame.getState().setStriking(gone.map(([name]) => name))
    if (!reducedMotion()) await new Promise((r) => setTimeout(r, STRIKE_MS))
    for (const [name, entry] of gone) {
      entry.ctrl.abort()
      live.delete(name)
    }
    useGame.getState().setStriking([])
  }

  for (const [name, def] of want) {
    if (live.has(name)) continue
    const ctrl = new AbortController()
    await mc.registerTool(def, { signal: ctrl.signal })
    live.set(name, { ctrl, def })
  }
}

export const reconcile = (desired: WebMcpTool[]) => (queue = queue.then(() => run(desired)))

/**
 * Registration is driven straight off world state, not from a React effect — the
 * agent reads the registry, so it must not lag a render behind the world.
 */
export function startRegistry() {
  const sync = (s = useGame.getState()) => void reconcile(computeTools(s.sheet, s.roomId, s.flags))
  sync()
  return useGame.subscribe((s, prev) => {
    if (s.sheet !== prev.sheet || s.roomId !== prev.roomId || s.flags !== prev.flags) sync(s)
  })
}
