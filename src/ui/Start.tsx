import { useState } from 'react'
import { presets } from '../game/presets'
import { validate, type Sheet } from '../game/sheet'
import { useGame } from '../store'
import { Portrait } from './Sheet'

export function Start() {
  const pick = useGame((s) => s.pick)
  const [prose, setProse] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy || !prose.trim()) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prose }),
        signal: AbortSignal.timeout(60_000),
      })
      if (!res.ok) throw new Error(`create ${res.status}: ${await res.text()}`)
      pick(validate((await res.json()) as Sheet))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-10 lg:py-14">
      <h1 className="font-display text-6xl leading-none tracking-tight text-vellum lg:text-7xl">
        Party of Two
      </h1>
      <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-vellum/65">
        You play one character. An agent plays the other. Its abilities are browser tools,
        registered and unregistered from the state of the world — so it cannot act, or speak,
        outside what it is.
      </p>

      <h2 className="mt-12 font-mono text-[11px] tracking-[0.22em] text-vellum/45 uppercase">
        Pick who comes with you
      </h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-3">
        {presets.map((p, i) => (
          <button
            key={p.name}
            type="button"
            onClick={() => pick(p)}
            className="sheet group flex flex-col p-4 text-left transition-transform duration-200 hover:-translate-y-1"
            style={{ rotate: `${[-0.6, 0.3, -0.2][i] ?? 0}deg` }}
          >
            <Portrait name={p.name} className="aspect-[6/5] w-full" />
            <h3 className="mt-3 font-display text-2xl leading-tight tracking-tight group-hover:text-oxblood">
              {p.name}
            </h3>
            <p className="mt-1 min-h-[2.7em] text-sm leading-snug text-pencil italic">{p.oneLine}</p>

            <p className="mt-4 border-t border-ink/20 pt-2.5 font-mono text-[10px] tracking-[0.18em] text-pencil uppercase">
              Registers
            </p>
            <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-brass">
              {p.speechActs.map((a) => a.name).join('  ')}
            </p>
            <p className="mt-1 font-mono text-[11px] leading-relaxed text-pencil">
              {p.skills.join(' · ')}
            </p>
          </button>
        ))}
      </div>

      <h2 className="mt-12 font-mono text-[11px] tracking-[0.22em] text-vellum/45 uppercase">
        Or describe one
      </h2>
      <form onSubmit={create} className="sheet mt-4 max-w-2xl p-5">
        <textarea
          value={prose}
          onChange={(e) => setProse(e.target.value)}
          rows={3}
          disabled={busy}
          placeholder="A disgraced court alchemist who talks too much and trusts nobody."
          className="w-full resize-none bg-transparent text-[16px] leading-relaxed outline-none placeholder:text-pencil/55"
        />
        <div className="mt-3 flex items-center justify-between border-t border-ink/25 pt-2.5 font-mono text-[11px]">
          <span className="text-pencil">
            {busy ? 'writing the sheet…' : 'five skills, six speech acts, no more'}
          </span>
          <button
            type="submit"
            disabled={busy || !prose.trim()}
            className="text-brass hover:underline disabled:text-pencil/40 disabled:no-underline"
          >
            make the sheet →
          </button>
        </div>
        {error && <p className="mt-2 font-mono text-[11px] text-oxblood">{error}</p>}
      </form>
    </section>
  )
}
