import { useState } from 'react'
import { presets } from '../game/presets'
import { validate, type Sheet } from '../game/sheet'
import { useGame } from '../store'
import { Monogram } from './Sheet'

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
    <section className="mx-auto max-w-3xl py-10">
      <h1 className="font-display text-5xl tracking-tight">Party of Two</h1>
      <p className="mt-2 max-w-xl text-pencil">
        You play one character. An agent plays the other. Its abilities are browser tools,
        registered and unregistered from the state of the world — so it cannot act, or
        speak, outside what it is.
      </p>

      <h2 className="mt-10 font-mono text-xs tracking-widest text-pencil uppercase">
        Pick who comes with you
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {presets.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => pick(p)}
            className="border border-ink/25 bg-vellum/60 p-4 text-left transition hover:border-brass hover:bg-vellum"
          >
            <Monogram name={p.name} className="size-12 text-xl" />
            <h3 className="mt-3 font-display text-xl tracking-tight">{p.name}</h3>
            <p className="mt-1 text-sm text-pencil italic">{p.oneLine}</p>
            <p className="mt-3 font-mono text-xs text-brass">
              {p.speechActs.map((a) => a.name).join(' ')}
            </p>
            <p className="mt-1 font-mono text-xs text-pencil">{p.skills.join(' · ')}</p>
          </button>
        ))}
      </div>

      <h2 className="mt-10 font-mono text-xs tracking-widest text-pencil uppercase">
        Or describe one
      </h2>
      <form onSubmit={create} className="mt-3 border border-ink/25 bg-vellum/60 p-4">
        <textarea
          value={prose}
          onChange={(e) => setProse(e.target.value)}
          rows={3}
          disabled={busy}
          placeholder="A disgraced court alchemist who talks too much and trusts nobody."
          className="w-full resize-none bg-transparent outline-none placeholder:text-pencil/60"
        />
        <div className="mt-2 flex items-center justify-between border-t border-ink/25 pt-2 font-mono text-xs">
          <span className="text-pencil">
            {busy ? 'writing the sheet…' : 'five skills, six speech acts, no more'}
          </span>
          <button type="submit" disabled={busy || !prose.trim()} className="text-brass hover:underline disabled:text-pencil/50">
            make the sheet
          </button>
        </div>
        {error && <p className="mt-2 font-mono text-xs text-oxblood">{error}</p>}
      </form>
    </section>
  )
}
