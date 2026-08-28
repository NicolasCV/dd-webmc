import { useState } from 'react'
import { agentTurn, resetHistory } from '../agent/turn'
import { examineProp, go, openExits } from '../game/tools'
import { rooms } from '../game/world'
import { TURN_BUDGET, useGame } from '../store'

export function Chat() {
  const [draft, setDraft] = useState('')
  const { bubbles, roomId, flags, turns, busy, halted, error, say, halt, reset } = useGame()
  const room = rooms[roomId]

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || busy || halted) return
    setDraft('')
    say('player', text)
    void agentTurn(text)
  }

  // The player's own actions are events he reacts to, which is what makes this a party
  // rather than a chat window.
  const act = (narration: string) => {
    if (busy || halted) return
    void agentTurn(narration)
  }

  const restart = () => {
    resetHistory()
    reset()
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col">
      <header className="flex items-baseline justify-between border-b border-ink/25 pb-2">
        <h1 className="font-display text-3xl tracking-tight">{room.name}</h1>
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
        <p className="text-pencil">{room.description}</p>
        {bubbles.map((b) => (
          <p key={b.id} className={b.who === 'player' ? 'text-pencil' : ''}>
            {b.act && (
              <span className={`mr-2 font-mono text-xs ${b.who === 'world' ? 'text-pencil' : 'text-brass'}`}>
                {b.act}
              </span>
            )}
            <span className={b.who === 'player' ? 'italic' : ''}>{b.text}</span>
          </p>
        ))}
        {busy && <p className="font-mono text-xs text-pencil">…</p>}
        {halted && <p className="font-mono text-xs text-oxblood">halted</p>}
        {error && <p className="font-mono text-xs text-oxblood">{error}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-ink/25 pt-3 font-mono text-xs">
        <span className="text-pencil">you:</span>
        {room.props.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={busy || halted}
            onClick={() => act(`You examine ${p.label}. ${examineProp(p)}`)}
            className="text-brass hover:underline disabled:text-pencil/50"
          >
            examine_{p.id}
          </button>
        ))}
        {openExits(room, flags).map((e) => (
          <button
            key={e.to}
            type="button"
            disabled={busy || halted}
            onClick={() => act(`You walk to ${rooms[e.to].name}. ${go(e.to)}`)}
            className="text-brass hover:underline disabled:text-pencil/50"
          >
            move_{e.to}
          </button>
        ))}
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
