import { useEffect, useState } from 'react'
import { FAMILIES } from '../game/sheet'
import { useGame } from '../store'
import { listTools, modelContext } from '../webmcp/context'

const PLATES: Record<string, string> = {
  Brakka: '/art/brakka.webp',
  'Sister Wen': '/art/wen.webp',
  Ilke: '/art/ilke.webp',
}

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

/** Engraved plate where we have one; a hand-lettered initial where we don't. */
export function Portrait({ name, className = '' }: { name: string; className?: string }) {
  const src = PLATES[name]
  if (!src) return <Monogram name={name} className={`${className} text-3xl`} />
  return (
    <div className={`shrink-0 overflow-hidden border border-ink/30 ${className}`}>
      <img src={src} alt="" className="plate size-full object-cover object-top" />
    </div>
  )
}

const Stat = ({ k, v }: { k: string; v: number }) => (
  <div className="flex-1 border-r border-ink/15 px-2 py-1.5 text-center last:border-r-0">
    <dt className="font-mono text-[10px] tracking-widest text-pencil uppercase">{k}</dt>
    <dd className="font-display text-xl leading-tight">{v}</dd>
  </div>
)

export function Sheet() {
  const [tools, setTools] = useState<string[]>([])
  const { sheet, striking, lastRoll } = useGame()

  // Read the live registry rather than tracking our own copy, so the sheet can
  // never disagree with what an agent actually sees.
  useEffect(() => {
    const mc = modelContext()
    const refresh = () => void listTools().then((ts) => setTools(ts.map((t) => t.name)))
    refresh()
    mc.addEventListener('toolchange', refresh)
    return () => mc.removeEventListener('toolchange', refresh)
  }, [])

  if (!sheet) return null
  const closed = Object.entries(FAMILIES).filter(([, f]) => !f.gate(sheet.disposition))

  return (
    <aside className="sheet flex w-full shrink-0 flex-col p-5 lg:w-[23rem] lg:rotate-[0.35deg]">
      <div className="flex items-start gap-4">
        <Portrait name={sheet.name} className="size-24" />
        <div className="min-w-0 pt-0.5">
          <h2 className="font-display text-2xl leading-tight tracking-tight">{sheet.name}</h2>
          <p className="mt-1 text-sm leading-snug text-pencil italic">{sheet.oneLine}</p>
        </div>
      </div>

      <dl className="mt-4 flex border-y border-ink/20">
        {Object.entries(sheet.attributes).map(([k, v]) => (
          <Stat key={k} k={k} v={v} />
        ))}
      </dl>

      <p className="mt-3 font-mono text-[11px] tracking-wide text-pencil">
        {sheet.skills.join(' · ')}
      </p>
      <p className="mt-1.5 font-mono text-[11px] tracking-wide">
        <span className="text-pencil">
          warmth {sheet.disposition.warmth} · nerve {sheet.disposition.nerve}
        </span>
        {closed.length > 0 && (
          <span className="text-oxblood"> — {closed.map(([k]) => k).join(', ')} closed</span>
        )}
      </p>

      <h3 className="mt-6 flex items-baseline justify-between border-b border-ink/25 pb-1.5 font-mono text-[11px] tracking-[0.18em] text-pencil uppercase">
        <span>Can do now</span>
        <span className="text-ink/45">
          {tools.length} tool{tools.length === 1 ? '' : 's'}
        </span>
      </h3>
      <ul className="min-h-0 flex-1 overflow-y-auto font-mono text-[13px] lg:min-h-[9rem]">
        {tools.map((name) => (
          <li
            key={name}
            className="stamp relative flex items-center gap-2 border-b border-ink/10 py-[5px] text-brass"
          >
            <span className="text-ink/30">▸</span>
            <span className="relative">
              {name}
              {striking.includes(name) && <StrikeRule />}
            </span>
          </li>
        ))}
        {tools.length === 0 && <li className="py-1.5 text-pencil italic">nothing registered</li>}
      </ul>

      <p className="mt-4 shrink-0 border-t border-ink/25 pt-3 font-mono text-[11px]">
        {lastRoll ? (
          <span key={`${lastRoll.of}-${lastRoll.d20}`}>
            <span className="die mr-2 text-base">⚄</span>
            <span className={lastRoll.ok ? 'text-brass' : 'text-oxblood'}>
              {lastRoll.of} {lastRoll.d20} → {lastRoll.total} vs DC {lastRoll.dc}
            </span>
          </span>
        ) : (
          <span className="text-pencil/70">no roll yet</span>
        )}
      </p>
    </aside>
  )
}
