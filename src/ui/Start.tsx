import { useEffect, useRef, useState } from 'react'
import { unlock } from '../audio'
import { presets } from '../game/presets'
import { FAMILIES, familyOpen, writeSheet } from '../game/sheet'
import { useGame } from '../store'
import { Portrait } from './Sheet'

const Rule = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mt-14 mb-4 flex items-baseline gap-4 font-display text-2xl tracking-tight text-vellum">
    {children}
    <span className="h-px flex-1 bg-vellum/20" />
  </h2>
)

const WRITING = ['reading it…', 'setting the disposition…', 'choosing what they can say…']

export function Start() {
  const pick = useGame((s) => s.pick)
  const [prose, setProse] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const [step, setStep] = useState(0)
  const ac = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!busy) return
    const id = setInterval(() => setStep((s) => Math.min(s + 1, WRITING.length - 1)), 2500)
    return () => clearInterval(id)
  }, [busy])

  const create = async (e: React.FormEvent) => {
    unlock()
    e.preventDefault()
    if (busy || !prose.trim()) return
    setBusy(true)
    setError(false)
    setStep(0)
    const controller = new AbortController()
    ac.current = controller
    const timeout = setTimeout(() => controller.abort(), 30_000)
    try {
      pick(await writeSheet(prose, controller.signal))
    } catch (err) {
      if (controller.signal.reason !== 'cancel') {
        console.error('create', err)
        setError(true)
      }
    } finally {
      clearTimeout(timeout)
      setBusy(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 pt-10 pb-16 lg:px-10 lg:pt-14 lg:pb-20">
      <header className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-end lg:gap-14">
        <div>
          <p className="font-mono text-label tracking-label text-brass uppercase">A solo tabletop scene</p>
          <h1 className="mt-2 font-display text-6xl leading-[0.9] tracking-tight text-vellum lg:text-8xl">
            Party
            <br />
            of Two
          </h1>
        </div>
        <p className="mt-6 text-said leading-[1.6] text-vellum/85 lg:mt-0">
          Everyone building AI for tabletop builds a Dungeon Master — a narrator that agrees with
          you. What a solo player is actually missing is a party member: someone with their own
          competence, their own opinions, and their own refusals.
        </p>
      </header>

      <div className="mt-10 grid gap-x-14 gap-y-6 border-y border-vellum/15 py-6 text-body leading-relaxed text-vellum/60 sm:grid-cols-2">
        <p>
          So the companion's abilities are WebMCP tools, registered on this page with{' '}
          <code className="font-mono text-[0.9em] text-brass">
            document.modelContext.registerTool
          </code>
          , and unregistered from the state of the world. It cannot act, or speak, outside what it
          is — not because it was told not to, but because the tool is not there.
        </p>
        <p>
          The tools run here on a local registry, so the game plays in any browser. In Chrome 149+
          with <code className="font-mono text-[0.9em] text-brass">#enable-webmcp-testing</code>, or
          in ChatGPT's in-app browser, the same registrations land on{' '}
          <code className="font-mono text-[0.9em] text-brass">document.modelContext</code> and any
          outside WebMCP agent can pick up the character.
        </p>
        <p className="font-mono text-label leading-relaxed text-vellum/45 sm:col-span-2">
          Four rooms, about ten minutes. Talk to them like a person.
        </p>
      </div>

      <Rule>Pick who comes with you</Rule>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {presets.map((p) => {
          const closed = Object.entries(FAMILIES).filter(([, f]) => !familyOpen(f, p.disposition))
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                unlock()
                pick(p)
              }}
              className="sheet group flex flex-col p-4 text-left"
            >
              <Portrait name={p.name} className="aspect-[6/5] w-full" />
              <h3 className="mt-3 font-display text-2xl leading-tight tracking-tight group-hover:text-oxblood">
                {p.name}
              </h3>
              <p className="mt-1 min-h-[2.7em] text-sm leading-snug text-pencil italic">
                {p.oneLine}
              </p>

              <p className="mt-4 border-t border-ink/20 pt-2.5 font-mono text-micro tracking-label text-pencil uppercase">
                Registers
              </p>
              <p className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-1 font-mono text-label leading-relaxed text-brass-ink">
                {p.speechActs.map((a) => (
                  <span key={a.name} title={a.description}>
                    {a.name}
                  </span>
                ))}
              </p>
              <p className="mt-1 font-mono text-label leading-relaxed text-pencil">
                {p.skills.join(' · ')}
              </p>
              <p className="mt-1.5 font-mono text-label leading-relaxed">
                <span className="text-pencil">
                  warmth {p.disposition.warmth} · nerve {p.disposition.nerve}
                </span>
                {closed.length > 0 && (
                  <span className="text-oxblood">
                    {' '}
                    — {closed.map(([k, f]) => `${k} needs ${f.stat} ${f.min + 1}`).join(', ')}
                  </span>
                )}
              </p>
            </button>
          )
        })}
      </div>

      <Rule>Or write one, and watch the API get built</Rule>
      <p className="max-w-2xl text-body leading-relaxed text-vellum/60">
        Your sentence becomes a sheet: skills, a disposition, and up to six speech acts. Those acts
        are registered as real tools with your character's own descriptions attached — the agent's
        API for this companion did not exist a moment ago.
      </p>
      <form onSubmit={create} className="sheet mt-4 p-5">
        <label htmlFor="describe" className="sr-only">
          Describe the companion you want
        </label>
        <textarea
          id="describe"
          value={prose}
          onChange={(e) => setProse(e.target.value)}
          rows={3}
          disabled={busy}
          placeholder="A disgraced court alchemist who talks too much and trusts nobody."
          className="w-full resize-none bg-transparent text-base leading-relaxed placeholder:text-pencil"
        />
        <div className="mt-3 flex items-center justify-between gap-4 border-t border-ink/25 pt-2.5 font-mono text-label">
          <span className="text-pencil">
            {busy ? (
              <>
                <span className="think">{WRITING[step]}</span>{' '}
                <button
                  type="button"
                  onClick={() => ac.current?.abort('cancel')}
                  className="text-brass-ink hover:underline"
                >
                  cancel
                </button>
              </>
            ) : (
              'five skills, six speech acts — clamped on arrival, not asked for politely'
            )}
          </span>
          <button
            type="submit"
            disabled={busy || !prose.trim()}
            className="shrink-0 text-brass-ink hover:underline disabled:text-pencil/40 disabled:no-underline"
          >
            register the character
          </button>
        </div>
        {error && (
          <p className="mt-2 text-body text-oxblood italic">
            The sheet-writer did not answer. Try again, or take one of the three above.
          </p>
        )}
      </form>

      <footer className="mt-20 border-t border-vellum/15 pt-5">
        <p className="font-display text-2xl tracking-tight text-vellum/75">
          A character is a set of registered tools. Change the character, change the API.
        </p>
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-label tracking-label text-vellum/45 uppercase">
          <a className="text-brass hover:underline" href="/why.html">
            why this exists
          </a>
          <a className="text-brass hover:underline" href="https://github.com/NicolasCV/dd-webmc">
            source
          </a>
          <a
            className="text-brass hover:underline"
            href="https://github.com/NicolasCV/dd-webmc/tree/main/eval"
          >
            the eval
          </a>
          <a
            className="text-brass hover:underline"
            href="https://github.com/NicolasCV/dd-webmc/blob/main/LICENSE"
          >
            MIT
          </a>
        </p>
      </footer>
    </section>
  )
}
