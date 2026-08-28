import { create } from 'zustand'

export type Bubble = {
  id: string
  who: 'player' | 'companion'
  act?: string
  text: string
}

export const MAX_STEPS = 5
export const TURN_BUDGET = 40

type State = {
  bubbles: Bubble[]
  turns: number
  busy: boolean
  halted: boolean
  error: string | null
  say: (who: Bubble['who'], text: string, act?: string) => void
  spendTurn: () => void
  setBusy: (busy: boolean) => void
  setError: (error: string | null) => void
  halt: () => void
  reset: () => void
}

export const useGame = create<State>((set) => ({
  bubbles: [],
  turns: 0,
  busy: false,
  halted: false,
  error: null,
  say: (who, text, act) =>
    set((s) => ({ bubbles: [...s.bubbles, { id: crypto.randomUUID(), who, text, act }] })),
  spendTurn: () => set((s) => ({ turns: s.turns + 1 })),
  setBusy: (busy) => set({ busy }),
  setError: (error) => set({ error }),
  halt: () => set({ halted: true, busy: false }),
  reset: () => set({ bubbles: [], turns: 0, busy: false, halted: false, error: null }),
}))
