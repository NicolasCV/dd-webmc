import { useEffect, useRef, useState } from 'react'
import { agentTurn, resetHistory, retry } from '../agent/turn'
import { stopAudio } from '../audio'
import { examineProp, go, openExits, playerAttempt, playerChallenges, unseenProps } from '../game/tools'
import { rooms } from '../game/world'
import { TURN_BUDGET, useGame } from '../store'

type Bubble = { id: string | number; who: string; text: string; act?: string }

/** A room name arrives as an act too; only tool names are snake_case. */
const isToolName = (act: string) => act.includes('_')

function Line({ b }: { b: Bubble }) {
  if (b.who === 'player')
    return (
      <p className="rise pl-6 text-[15px] leading-relaxed text-pencil">
        <span className="mr-2 font-mono text-[10px] tracking-[0.14em] uppercase">you</span>
        <span className="italic">{b.text}</span>
      </p>
    )

  if (b.who === 'world' && b.act && !isToolName(b.act))
    return (
      <div className="rise pt-3">
        <div className="mb-2 flex items-center gap-3">
          <span className="font-display text-lg tracking-tight">{b.act}</span>
          <span className="h-px flex-1 bg-ink/20" />
        </div>
        <p className="text-[15px] leading-relaxed text-pencil">{b.text}</p>
      </div>
    )

  if (b.who === 'world')
    return (
      <p className="rise border-l-2 border-ink/15 pl-3 text-[14px] leading-relaxed text-pencil">
        {b.act && <span className="mr-2 font-mono text-[11px] text-ink/45">{b.act}</span>}
        {b.text}
      </p>
    )

  return (
    <p className="rise text-[17px] leading-[1.65]">
      {b.act && (
        <span className="mr-2 align-[0.1em] font-mono text-[10px] tracking-[0.14em] text-brass uppercase">
          {b.act}
        </span>
      )}
      {b.text}
    </p>
  )
}

export function Chat() {
  const [draft, setDraft] = useState('')
  const end = useRef<HTMLDivElement>(null)
  const { sheet, bubbles, roomId, flags, turns, busy, halted, error, muted, say, halt, reset, leave, toggleMute } =
    useGame()
  const room = rooms[roomId]

  // A judge should not have to type first. agentTurn no-ops while busy, so React's
  // double-invoked effects in development cannot double-greet.
  useEffect(() => {
    if (sheet && bubbles.length === 0) {
      void agentTurn(`You are both at the bottom of the stairs. ${rooms[roomId].description} Say something.`)
    }
  }, [sheet, roomId, bubbles.length])

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [bubbles.length, busy])

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
    stopAudio()
    resetHistory()
    reset()
  }

  const change = () => {
    stopAudio()
    resetHistory()
    leave()
  }

  const chip = 'text-brass hover:underline disabled:text-pencil/40 disabled:no-underline'

  return (
    <section className="sheet flex min-h-0 min-w-0 flex-1 flex-col p-5 lg:-rotate-[0.2deg] lg:p-7">
      <header className="flex shrink-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink/25 pb-2.5">
        <h1 className="font-display text-3xl tracking-tight">{room.name}</h1>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className={turns >= TURN_BUDGET ? 'text-oxblood' : 'text-pencil'}>
            {turns}/{TURN_BUDGET} turns
          </span>
          <button
            type="button"
            onClick={() => {
              stopAudio()
              toggleMute()
            }}
            className={muted ? 'text-oxblood hover:underline' : 'text-brass hover:underline'}
          >
            {muted ? 'muted' : 'voice on'}
          </button>
          <button type="button" onClick={halt} className="text-oxblood hover:underline">
            halt
          </button>
          <button type="button" onClick={restart} className="text-pencil hover:underline">
            restart
          </button>
          <button type="button" onClick={change} className="text-pencil hover:underline">
            change character
          </button>
        </div>
      </header>

      <div className="scroll-paper flex min-h-0 flex-1 flex-col overflow-y-auto py-5 pr-1">
        <div className="mt-auto flex max-w-[64ch] flex-col gap-3.5">
          {bubbles.length === 0 && <p className="text-[15px] text-pencil">{room.description}</p>}
          {bubbles.map((b) => (
            <Line key={b.id} b={b} />
          ))}
          {busy && <p className="font-mono text-xs text-pencil">…</p>}
          {halted && <p className="font-mono text-xs text-oxblood">halted</p>}
          {error && (
            <p className="font-mono text-xs text-oxblood">
              {error}{' '}
              <button type="button" onClick={() => void retry()} className="underline">
                try again
              </button>
            </p>
          )}
          <div ref={end} />
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-t border-ink/25 pt-3 font-mono text-[11px]">
        <span className="tracking-[0.14em] text-pencil uppercase">you</span>
        {unseenProps(room, flags).map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={busy || halted}
            onClick={() => act(`You examine ${p.label}. ${examineProp(p)}`)}
            className={chip}
          >
            examine_{p.id}
          </button>
        ))}
        {playerChallenges(room, sheet, flags).map((c) => (
          <button
            key={c.id}
            type="button"
            disabled={busy || halted}
            onClick={() => act(`You try it yourself. ${playerAttempt(c)}`)}
            className={chip}
          >
            {c.id}
          </button>
        ))}
        {openExits(room, flags).map((e) => (
          <button
            key={e.to}
            type="button"
            disabled={busy || halted}
            onClick={() => act(`You walk to ${rooms[e.to].name}. ${go(e.to)}`)}
            className={chip}
          >
            move_{e.to}
          </button>
        ))}
      </div>

      <form onSubmit={send} className="flex shrink-0 items-center gap-2 border-t border-ink/25 pt-3">
        <span className="font-mono text-pencil">&gt;</span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={busy || halted}
          placeholder="say something to them"
          className="flex-1 bg-transparent text-[16px] outline-none placeholder:text-pencil/55"
        />
      </form>
    </section>
  )
}
