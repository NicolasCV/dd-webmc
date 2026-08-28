import { useState } from 'react'
import { agentTurn, resetHistory } from '../agent/turn'
import { TURN_BUDGET, useGame } from '../store'

export function Chat() {
  const [draft, setDraft] = useState('')
  const { bubbles, turns, busy, halted, error, say, halt, reset } = useGame()

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || busy || halted) return
    setDraft('')
    say('player', text)
    void agentTurn(text)
  }

  const restart = () => {
    resetHistory()
    reset()
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <header className="flex items-baseline justify-between border-b border-ink/25 pb-2">
        <h1 className="font-display text-3xl tracking-tight">The Sealed Landing</h1>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className={turns >= TURN_BUDGET ? 'text-oxblood' : 'text-pencil'}>
            turns: {turns}/{TURN_BUDGET}
          </span>
          <button type="button" onClick={halt} className="text-oxblood hover:underline">
            halt
          </button>
          <button type="button" onClick={restart} className="text-pencil hover:underline">
            restart
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {bubbles.map((b) => (
          <p key={b.id} className={b.who === 'player' ? 'text-pencil' : ''}>
            {b.act && <span className="mr-2 font-mono text-xs text-brass">{b.act}</span>}
            <span className={b.who === 'player' ? 'italic' : ''}>{b.text}</span>
          </p>
        ))}
        {busy && <p className="font-mono text-xs text-pencil">…</p>}
        {halted && <p className="font-mono text-xs text-oxblood">halted</p>}
        {error && <p className="font-mono text-xs text-oxblood">{error}</p>}
      </div>

      <form onSubmit={send} className="flex gap-2 border-t border-ink/25 pt-3">
        <span className="font-mono text-pencil">&gt;</span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={busy || halted}
          placeholder="say something to him"
          className="flex-1 bg-transparent outline-none placeholder:text-pencil/60"
        />
      </form>
    </section>
  )
}
