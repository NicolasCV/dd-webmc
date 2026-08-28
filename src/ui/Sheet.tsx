import { useEffect, useState } from 'react'
import { FAMILIES } from '../game/sheet'
import { useGame } from '../store'
import { listTools, modelContext } from '../webmcp/context'

function StrikeRule() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 top-1/2 h-2 w-full -translate-y-1/2 overflow-visible"
      preserveAspectRatio="none"
      viewBox="0 0 200 8"
      aria-hidden
    >
      <path
        className="strike-rule"
        d="M2 5 C 40 2, 70 7, 110 3.5 S 170 6, 198 3"
        fill="none"
        stroke="var(--color-oxblood)"
        strokeWidth="1.6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export function Monogram({ name, className = '' }: { name: string; className?: string }) {
  return (
    <div
      className={`grid shrink-0 place-items-center border border-ink/40 bg-ink/5 font-display text-ink/70 ${className}`}
      aria-hidden
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  )
}

export function Sheet() {
  const [tools, setTools] = useState<string[]>([])
  const { sheet, striking, lastRoll } = useGame()

  // Read the live registry rather than tracking our own copy, so the sheet can
  // never disagree with what an agent actually sees.
  useEffect(() => {
    const mc = modelContext()
    if (!mc) return
    const refresh = () => void listTools().then((ts) => setTools(ts.map((t) => t.name)))
    refresh()
    mc.addEventListener('toolchange', refresh)
    return () => mc.removeEventListener('toolchange', refresh)
  }, [])

  if (!sheet) return null
  const closed = Object.entries(FAMILIES).filter(([, f]) => !f.gate(sheet.disposition))

  return (
    <aside className="w-80 shrink-0 self-start border border-ink/25 bg-vellum/60 p-5">
      <div className="flex items-start gap-3">
        <Monogram name={sheet.name} className="size-14 text-2xl" />
        <div className="min-w-0">
          <h2 className="font-display text-2xl tracking-tight">{sheet.name}</h2>
          <p className="mt-0.5 text-sm text-pencil italic">{sheet.oneLine}</p>
        </div>
      </div>

      <dl className="mt-4 flex gap-4 font-mono text-xs">
        {Object.entries(sheet.attributes).map(([k, v]) => (
          <div key={k}>
            <dt className="text-pencil uppercase">{k}</dt>
            <dd className="text-base">{v}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 font-mono text-xs text-pencil">{sheet.skills.join(' · ')}</p>

      <p className="mt-2 font-mono text-xs">
        <span className="text-pencil">
          warmth {sheet.disposition.warmth} · nerve {sheet.disposition.nerve}
        </span>
        {closed.length > 0 && (
          <span className="text-oxblood"> — {closed.map(([k]) => k).join(', ')} closed</span>
        )}
      </p>

      <h3 className="mt-6 border-t border-ink/25 pt-3 font-mono text-xs tracking-widest text-pencil uppercase">
        Can do now
      </h3>
      <ul className="mt-2 space-y-1 font-mono text-sm">
        {tools.map((name) => (
          <li key={name} className="stamp relative text-brass">
            <span className="text-ink/40">▸ </span>
            {name}
            {striking.includes(name) && <StrikeRule />}
          </li>
        ))}
        {tools.length === 0 && <li className="text-pencil italic">nothing registered</li>}
      </ul>

      {lastRoll && (
        <p
          key={`${lastRoll.of}-${lastRoll.d20}`}
          className="mt-6 border-t border-ink/25 pt-3 font-mono text-xs"
        >
          <span className="die mr-2 text-base">⚄</span>
          <span className={lastRoll.ok ? 'text-brass' : 'text-oxblood'}>
            {lastRoll.of} {lastRoll.d20} → {lastRoll.total} vs DC {lastRoll.dc}
          </span>
        </p>
      )}
    </aside>
  )
}
