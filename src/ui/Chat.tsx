import { useEffect, useRef, useState } from 'react'
import { agentTurn, resetHistory, retry } from '../agent/turn'
import { stopAudio } from '../audio'
import { FAMILIES, familyOpen } from '../game/sheet'
import { examineProp, go, openExits, playerAttempt, playerChallenges, unseenProps } from '../game/tools'
import { opening, rooms, START } from '../game/world'
import type { Bubble } from '../store'
import { TURN_BUDGET, useGame } from '../store'
import { Icon } from './icons'
import { Room } from './Room'

/** move() sets Bubble.act to the room name; every other act is a tool name. */
const isRoomName = (act: string) => Object.values(rooms).some((r) => r.name === act)

const RoomHead = ({ name }: { name: string }) => (
  <div className="mb-2 flex items-center gap-3">
    <span className="font-display text-lg tracking-tight">{name}</span>
    <span className="h-px flex-1 bg-ink/20" />
  </div>
)

function Line({ b, mechanics, name }: { b: Bubble; mechanics: boolean; name: string }) {
  if (b.act === 'tools_registered' || b.act === 'tools_unregistered') {
    if (!mechanics) return null
    const gained = b.act === 'tools_registered'
    return (
      <p className={`rise font-mono text-label ${gained ? 'text-brass-ink' : 'text-oxblood'}`}>
        <span className="mr-2 tracking-label uppercase">{gained ? '+ registered' : '− unregistered'}</span>
        {b.text}
      </p>
    )
  }

  if (b.who === 'world' && b.act && isRoomName(b.act))
    return (
      <div className="rise pt-3">
        <RoomHead name={b.act} />
        <p className="text-body leading-relaxed text-pencil">{b.text}</p>
      </div>
    )

  const companion = b.who === 'companion'
  const speaker = b.who === 'player' ? 'you' : companion ? name : 'narrator'

  return (
    <div className="rise grid grid-cols-[5.5rem_1fr] gap-x-3">
      <span className="pt-[0.4em] text-right font-mono text-micro leading-tight tracking-label text-pencil uppercase">
        {speaker}
      </span>
      <div>
        {b.act && !isRoomName(b.act) && mechanics && (
          <span className="mb-1 flex flex-wrap items-baseline gap-x-2 font-mono text-label">
            {b.source && (
              <span className={b.source === 'agent' ? 'text-oxblood' : 'text-pencil'}>
                {b.source === 'agent' ? '◆ tool call' : '◇ you'}
              </span>
            )}
            <span className="text-brass-ink">{b.act}</span>
            {b.args && (
              <span className="text-pencil">{b.args.length > 64 ? `${b.args.slice(0, 63)}…` : b.args}</span>
            )}
          </span>
        )}
        <p
          className={
            companion
              ? 'text-said leading-[1.65]'
              : `text-body leading-relaxed text-pencil${b.who === 'player' ? ' italic' : ''}`
          }
        >
          {b.text}
        </p>
        {b.roll && (
          <span className="mt-1 block font-mono text-label">
            <span className="text-pencil">{b.roll.of}</span>{' '}
            <span className={b.roll.ok ? 'text-brass-ink' : 'text-oxblood'}>{b.roll.ok ? 'OK' : 'FAIL'}</span>{' '}
            <span className="text-pencil">
              d20 {b.roll.d20} → {b.roll.total} vs DC {b.roll.dc}
            </span>
          </span>
        )}
      </div>
    </div>
  )
}

export function Chat({ className = '' }: { className?: string }) {
  const [draft, setDraft] = useState('')
  const box = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    sheet, bubbles, roomId, flags, visited, turns, busy, halted, ended, soloAgent, error, muted, mechanics,
    registered, unregistered, say, halt, resume, reset, leave, toggleMute, toggleMechanics,
    toggleSoloAgent,
  } = useGame()
  const room = rooms[roomId]
  const over = ended || turns >= TURN_BUDGET
  const locked = busy || halted || over

  // Let the cold open land before the companion is asked for a line.
  // Gated on turns, not bubbles: the registry logs its own bubbles inside the delay.
  useEffect(() => {
    if (!sheet || turns > 0) return
    const id = setTimeout(() => {
      void agentTurn(
        `${opening(sheet.name).join(' ')} ${rooms[roomId].description} ` +
          'You are both at the bottom of the stairs and nothing has happened yet. ' +
          "Say something, or don't.",
      )
    }, 1600)
    return () => clearTimeout(id)
  }, [sheet, roomId, turns])

  // Unstick on upward scroll. Distance from bottom cannot tell who scrolled away from who never scrolled.
  const stuck = useRef(true)
  const lastTop = useRef(0)
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (el.scrollTop < lastTop.current) stuck.current = false
    else if (el.scrollHeight - el.scrollTop - el.clientHeight < 40) stuck.current = true
    lastTop.current = el.scrollTop
  }

  // Scroll the transcript, never the document.
  useEffect(() => {
    const el = box.current
    // Turn 0 is the cold open: scrolling to the bottom would bury it before it is read.
    if (el && stuck.current && turns > 0) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [bubbles.length, busy, turns])

  useEffect(() => {
    if (!busy && !halted && !ended) inputRef.current?.focus()
  }, [busy, halted, ended])

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || locked) return
    setDraft('')
    say('player', text)
    void agentTurn(text)
  }

  const act = (narration: string) => {
    if (locked) return
    void agentTurn(narration)
  }

  const ask = (line: string) => {
    if (locked) return
    say('player', line)
    void agentTurn(line)
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

  const chip =
    'inline-flex min-h-6 items-center px-1 text-brass-ink hover:underline active:text-oxblood disabled:text-pencil/40 disabled:no-underline'
  const toolChip = `${chip} gap-1.5 ${mechanics ? 'font-mono text-label' : 'text-body italic'}`
  const ctl =
    'inline-flex min-h-6 items-center gap-1.5 px-1 underline decoration-dotted decoration-ink/30 underline-offset-[3px] hover:decoration-ink'
  const ic = 'inline-flex min-h-6 items-center px-1 hover:text-oxblood'
  const eyebrow = 'px-1 font-mono text-label tracking-label text-pencil uppercase'
  const divider = <span className="h-3 w-px bg-ink/20" />

  const rolls = bubbles.filter((b) => b.roll).length
  const withheld = sheet
    ? Object.values(FAMILIES)
        .filter((f) => !familyOpen(f, sheet.disposition))
        .flatMap((f) => f.acts)
    : []
  const closed = (f: keyof typeof FAMILIES) => !!sheet && !familyOpen(FAMILIES[f], sheet.disposition)
  const openings = closed('support')
    ? ["I'm scared. Tell me it's going to be fine.", 'Just say one kind thing to me.']
    : closed('provoke')
      ? ['Stop being nice to me.', 'Mock me — I can take it.']
      : ['Tell me something true about yourself.']

  return (
    <section className={`sheet min-h-0 min-w-0 flex-1 flex-col p-5 lg:p-7 ${className}`}>
      <header className="flex shrink-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ink/25 pb-2.5">
        <h1 key={roomId} className="rise font-display text-2xl tracking-tight lg:text-3xl">
          {room.name}
        </h1>
        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 font-mono text-label [&>*]:whitespace-nowrap">
          <span
            className={turns >= TURN_BUDGET ? 'text-oxblood' : 'text-pencil'}
            title="Every line, look and move is one agent turn. Capped at 40 so a shared demo key survives the day."
          >
            turn {turns} of {TURN_BUDGET}
          </span>
          {divider}
          <button
            type="button"
            onClick={() => {
              stopAudio()
              toggleMute()
            }}
            title={muted ? 'unmute' : 'mute'}
            aria-label={muted ? 'unmute' : 'mute'}
            className={`${ic} ${muted ? 'text-oxblood' : 'text-brass-ink'}`}
          >
            <Icon of={muted ? 'hush' : 'sound'} className="size-4" />
          </button>
          <button
            type="button"
            onClick={toggleMechanics}
            title="Tool names, the registry log and the map's flags. Display only — the tools stay registered either way."
            aria-pressed={mechanics}
            className={`${ctl} ${mechanics ? 'text-ink/70' : 'text-brass-ink'}`}
          >
            <Icon of={mechanics ? 'seen' : 'unseen'} className="size-4" />
            mechanics
          </button>
          {divider}
          <button
            type="button"
            onClick={() => {
              if (halted) return resume()
              stopAudio()
              halt()
            }}
            title={halted ? 'resume' : 'pause'}
            aria-label={halted ? 'resume' : 'pause'}
            className={`${ic} ${halted ? 'text-brass-ink' : 'text-oxblood'}`}
          >
            <Icon of={halted ? 'play' : 'pause'} className="size-4" />
          </button>
          {divider}
          <button
            type="button"
            onClick={restart}
            title="restart the scene"
            aria-label="restart the scene"
            className={`${ic} text-ink/70`}
          >
            <Icon of="again" className="size-4" />
          </button>
          <button
            type="button"
            onClick={change}
            title="another companion"
            aria-label="another companion"
            className={`${ic} text-ink/70`}
          >
            <Icon of="swap" className="size-4" />
          </button>
        </div>
      </header>

      <Room />

      <div
        ref={box}
        onScroll={onScroll}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="scroll-paper flex max-h-[55dvh] min-h-0 flex-1 flex-col overflow-y-auto py-5 pr-1 lg:max-h-none"
      >
        <div className="mx-auto flex w-full max-w-[44rem] flex-col gap-5">
          {opening(sheet?.name ?? 'them').map((line, i) => (
            <p
              key={line}
              style={{ animationDelay: `${i * 500}ms` }}
              className="rise text-said leading-[1.65] text-ink/90"
            >
              {line}
            </p>
          ))}
          <div className="rise" style={{ animationDelay: '1000ms' }}>
            <RoomHead name={rooms[START].name} />
            <p className="text-body leading-relaxed text-pencil">{rooms[START].description}</p>
          </div>
          {turns === 0 && (
            <>
              <p className="rise text-note text-pencil italic" style={{ animationDelay: '1300ms' }}>
                Whatever you ask for, the answer has to come out of the tools on the sheet.
              </p>
            </>
          )}
          {bubbles.map((b) => (
            <Line key={b.id} b={b} mechanics={mechanics} name={sheet?.name ?? 'them'} />
          ))}
          {busy && (
            <p role="status" className="rise font-mono text-label tracking-label text-pencil uppercase">
              <span className="think">{sheet?.name ?? 'They'} is deciding…</span>
            </p>
          )}
          {halted && <p className="text-body text-oxblood italic">Paused. Nothing acts until you resume.</p>}
          {soloAgent && !over && !halted && (
            <p className="font-mono text-label leading-relaxed text-pencil">
              Your agent has the seat, so the built-in model is off. What you say is on the page;
              it answers the next time it calls a tool. If it has stopped looping,{' '}
              <button type="button" onClick={toggleSoloAgent} className="text-brass-ink underline">
                take the seat back
              </button>
              .
            </p>
          )}
          {error && (
            <p role="alert" className="font-mono text-label text-oxblood">
              {error}{' '}
              {!halted && turns < TURN_BUDGET && (
                <button type="button" onClick={() => void retry()} className="underline">
                  try again
                </button>
              )}
            </p>
          )}
        </div>
      </div>

      {over ? (
        <div className="shrink-0 border-t border-ink/25 pt-4">
          <h2 className="font-display text-3xl tracking-tight">
            {ended ? 'The account is closed' : 'Out of turns'}
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-label lg:grid-cols-5">
            {[
              ['turns spent', `${turns}/${TURN_BUDGET}`],
              ['rooms', `${visited.length}/${Object.keys(rooms).length}`],
              ['rolls', `${rolls}`],
              ['tools registered', `${registered}`],
              ['unregistered', `${unregistered}`],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="tracking-label text-pencil uppercase">{label}</dt>
                <dd className="text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          {withheld.length > 0 && (
            <p className="mt-3 text-body leading-relaxed text-pencil">
              {sheet?.name} never once had{' '}
              <span className="font-mono text-note line-through decoration-oxblood/70">
                {withheld.join(' ')}
              </span>
              . Not declined — <em>not registered</em>.
            </p>
          )}
          <div className="mt-4 flex gap-5 font-mono text-label">
            <button type="button" onClick={restart} className={chip}>
              play it again
            </button>
            <button type="button" onClick={change} className={chip}>
              someone else
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="shrink-0 border-t border-ink/25 pt-3">
            {bubbles.length <= 2 && (
              <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className={eyebrow}>try</span>
                {openings.map((line) => (
                  <button
                    key={line}
                    type="button"
                    disabled={locked}
                    onClick={() => ask(line)}
                    className={`${chip} gap-1.5 text-body italic`}
                  >
                    <Icon of="say" />
                    {line}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className={eyebrow}>you</span>
              {[...unseenProps(room, flags)]
                .sort((a, b) => Number(!!a.requires) - Number(!!b.requires))
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    disabled={locked}
                    onClick={() => act(`They examine ${p.label}. ${examineProp(p)}`)}
                    className={toolChip}
                  >
                    <Icon of="look" />
                    {mechanics ? `examine_${p.id}` : p.label}
                  </button>
                ))}
              {playerChallenges(room, sheet, flags).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  disabled={locked}
                  onClick={() => act(`They try it themselves. ${playerAttempt(c)}`)}
                  title={`You try it yourself — ${sheet?.name ?? 'they'} is not asked`}
                  className={toolChip}
                >
                  <Icon of="roll" />
                  {mechanics ? c.id : c.id.replace(/_/g, ' ')}
                </button>
              ))}
              {(room.challenges ?? [])
                .filter((c) => sheet?.skills.includes(c.skill) && !(c.gone && flags.includes(c.gone)))
                .map((c) => (
                  <button
                    key={`ask_${c.id}`}
                    type="button"
                    disabled={locked}
                    onClick={() => ask(`Can you ${c.id.replace(/_/g, ' ')}?`)}
                    className={`${chip} gap-1.5 text-body italic`}
                  >
                    <Icon of="say" />
                    ask {sheet!.name} to {c.id.replace(/_/g, ' ')}
                  </button>
                ))}
              {openExits(room, flags).map((e) => (
                <button
                  key={e.to}
                  type="button"
                  disabled={locked}
                  onClick={() => act(`They walk to ${rooms[e.to].name}. ${go(e.to)}`)}
                  className={toolChip}
                >
                  <Icon of="go" />
                  {mechanics ? `move_${e.to}` : rooms[e.to].name}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={send}
            className="flex shrink-0 items-center gap-2 border-t border-ink/25 pt-3 pb-[env(safe-area-inset-bottom)]"
          >
            <label htmlFor="say" className="sr-only">
              Say something to your companion
            </label>
            <span aria-hidden className="font-mono text-pencil">
              &gt;
            </span>
            <input
              id="say"
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              readOnly={busy || halted}
              enterKeyHint="send"
              autoComplete="off"
              placeholder={halted ? 'paused' : `ask ${sheet?.name ?? 'them'} for something they cannot give`}
              className="min-w-0 flex-1 bg-transparent text-base placeholder:text-pencil read-only:text-pencil"
            />
            <button
              type="submit"
              disabled={busy || halted || !draft.trim()}
              className="shrink-0 font-mono text-label tracking-label text-brass-ink uppercase disabled:text-pencil/40"
            >
              send
            </button>
          </form>
        </>
      )}
    </section>
  )
}
