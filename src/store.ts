import { create } from 'zustand'
import type { Sheet } from './game/sheet'
import type { Roll } from './game/world'
import { START } from './game/world'

export type Bubble = {
  id: string
  who: 'player' | 'companion' | 'world'
  act?: string
  text: string
}

export const MAX_STEPS = 5
export const TURN_BUDGET = 40

type State = {
  sheet: Sheet | null
  muted: boolean
  bubbles: Bubble[]
  roomId: string
  flags: string[]
  striking: string[]
  lastRoll: (Roll & { of: string }) | null
  turns: number
  busy: boolean
  halted: boolean
  error: string | null
  pick: (sheet: Sheet) => void
  toggleMute: () => void
  say: (who: Bubble['who'], text: string, act?: string) => void
  setFlag: (flag: string) => void
  enter: (roomId: string) => void
  setRoll: (roll: (Roll & { of: string }) | null) => void
  setStriking: (names: string[]) => void
  spendTurn: () => void
  setBusy: (busy: boolean) => void
  setError: (error: string | null) => void
  halt: () => void
  reset: () => void
  leave: () => void
}

const fresh = {
  bubbles: [] as Bubble[],
  roomId: START,
  flags: [] as string[],
  striking: [] as string[],
  lastRoll: null,
  turns: 0,
  busy: false,
  halted: false,
  error: null,
}

export const useGame = create<State>((set, get) => ({
  sheet: null,
  muted: false,
  ...fresh,
  pick: (sheet) => set({ sheet, ...fresh }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  say: (who, text, act) =>
    set((s) => ({ bubbles: [...s.bubbles, { id: crypto.randomUUID(), who, text, act }] })),
  setFlag: (flag) => set((s) => (s.flags.includes(flag) ? s : { flags: [...s.flags, flag] })),
  enter: (roomId) => set({ roomId }),
  setRoll: (lastRoll) => set({ lastRoll }),
  setStriking: (striking) => set({ striking }),
  spendTurn: () => set((s) => ({ turns: s.turns + 1 })),
  setBusy: (busy) => set({ busy }),
  setError: (error) => set({ error }),
  halt: () => set({ halted: true, busy: false }),
  reset: () => set({ ...fresh, sheet: get().sheet }),
  leave: () => set({ ...fresh, sheet: null }),
}))
