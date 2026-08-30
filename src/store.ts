import { create } from 'zustand'
import type { Sheet } from './game/sheet.ts'
import type { Roll } from './game/world.ts'
import { START } from './game/world.ts'

export type Bubble = {
  id: string
  who: 'player' | 'companion' | 'world'
  act?: string
  text: string
  /** Who invoked the tool: the LLM/external agent, or the player's own button. */
  source?: 'agent' | 'you'
  args?: string
  roll?: { of: string; d20: number; total: number; dc: number; ok: boolean }
}

export const MAX_STEPS = 5
export const TURN_BUDGET = 40

type State = {
  sheet: Sheet | null
  muted: boolean
  mechanics: boolean
  soloAgent: boolean
  bubbles: Bubble[]
  roomId: string
  visited: string[]
  flags: string[]
  striking: string[]
  lastRoll: (Roll & { of: string; mine: boolean }) | null
  registered: number
  unregistered: number
  turns: number
  busy: boolean
  halted: boolean
  ended: boolean
  error: string | null
  pick: (sheet: Sheet) => void
  toggleMute: () => void
  toggleMechanics: () => void
  toggleSoloAgent: () => void
  say: (who: Bubble['who'], text: string, extra?: Omit<Bubble, 'id' | 'who' | 'text'>) => void
  setFlag: (flag: string) => void
  enter: (roomId: string) => void
  setRoll: (roll: (Roll & { of: string; mine: boolean }) | null) => void
  setStriking: (names: string[]) => void
  count: (k: 'registered' | 'unregistered', n: number) => void
  spendTurn: () => void
  setBusy: (busy: boolean) => void
  setError: (error: string | null) => void
  halt: () => void
  resume: () => void
  end: () => void
  reset: () => void
  leave: () => void
}

const fresh = {
  bubbles: [] as Bubble[],
  roomId: START,
  visited: [START],
  flags: [] as string[],
  striking: [] as string[],
  lastRoll: null,
  registered: 0,
  unregistered: 0,
  turns: 0,
  busy: false,
  halted: false,
  ended: false,
  error: null,
}

export const useGame = create<State>((set, get) => ({
  sheet: null,
  muted: false,
  mechanics: true,
  // Survives reset()/leave(): an external agent that took the seat keeps it.
  soloAgent: false,
  ...fresh,
  pick: (sheet) => set({ sheet, ...fresh }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  toggleMechanics: () => set((s) => ({ mechanics: !s.mechanics })),
  toggleSoloAgent: () => set((s) => ({ soloAgent: !s.soloAgent })),
  say: (who, text, extra) =>
    set((s) => ({ bubbles: [...s.bubbles, { id: crypto.randomUUID(), who, text, ...extra }] })),
  setFlag: (flag) => set((s) => (s.flags.includes(flag) ? s : { flags: [...s.flags, flag] })),
  enter: (roomId) =>
    set((s) => ({ roomId, visited: s.visited.includes(roomId) ? s.visited : [...s.visited, roomId] })),
  setRoll: (lastRoll) => set({ lastRoll }),
  setStriking: (striking) => set({ striking }),
  count: (k, n) => set((s) => ({ [k]: s[k] + n })),
  spendTurn: () => set((s) => ({ turns: s.turns + 1 })),
  setBusy: (busy) => set({ busy }),
  setError: (error) => set({ error }),
  // Keeps busy: the in-flight loop is still awaiting its fetch and clears busy itself.
  halt: () => set((s) => ({ halted: !s.halted })),
  resume: () => set({ halted: false }),
  end: () => set({ ended: true }),
  reset: () => set({ ...fresh, sheet: get().sheet }),
  leave: () => set({ ...fresh, sheet: null }),
}))
