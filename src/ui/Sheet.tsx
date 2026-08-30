import { useState } from 'react'
import type { RegisteredTool } from '@mcp-b/webmcp-types'
import { FAMILIES, familyOpen } from '../game/sheet'
import { useGame } from '../store'
import { supported } from '../webmcp/context'

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

function Monogram({ name, className = '' }: { name: string; className?: string }) {
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
  // The vellum ground is the plate's backdrop: .sheet > * isolates every child, so
  // mix-blend-mode: multiply has nothing to multiply against without it.
  return (
    <div className={`shrink-0 overflow-hidden bg-vellum ${className}`}>
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

export function Sheet({ tools, className = '' }: { tools: RegisteredTool[]; className?: string }) {
  // '' is the closed state, so the first tool can open by default and still be closed.
  const [open, setOpen] = useState<string | null>(null)
  const { sheet, striking, lastRoll, mechanics } = useGame()

  if (!sheet) return null
  const shown = open ?? tools[0]?.name
  // A struck name has already left the registry, so it cannot be drawn over a live row --
  // it is drawn from `striking` alone, for the beat it takes to read that it is gone.
  const live = tools.filter((t) => !striking.includes(t.name))
  const closed = Object.entries(FAMILIES).filter(([, f]) => !familyOpen(f, sheet.disposition))
  const withheld = closed.reduce((n, [, f]) => n + f.acts.length, 0)

  // Shrinks on mobile, where it is one pane of a 100dvh column: the tool list scrolls
  // rather than the paper running off the bottom of the screen.
  return (
    <aside className={`sheet w-full min-h-0 flex-col p-5 lg:w-[25rem] lg:shrink-0 lg:p-7 ${className}`}>
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
      <p className="mt-1.5 font-mono text-[11px] tracking-wide text-pencil">
        warmth {sheet.disposition.warmth} · nerve {sheet.disposition.nerve}
      </p>

      <h3 className="mt-6 flex items-baseline justify-between border-b border-ink/25 pb-1.5 font-mono text-[11px] tracking-[0.18em] text-pencil uppercase">
        <span>Can do now</span>
        <span className="font-mono text-[10px] text-pencil">
          {tools.length} live · {withheld} withheld
        </span>
      </h3>
      <p className="mt-1 font-mono text-[10px] tracking-wide text-pencil">
        registered on {supported() ? 'document.modelContext' : 'this page’s local registry'}
      </p>
      {!mechanics && (
        <p className="mt-1 text-[14px] text-pencil italic">
          Names hidden. Ask {sheet.name} for something and find out which ones are there.
        </p>
      )}

      {/* The fade lands on blank paper when the list is short, and on a half-row when it is not. */}
      <ul
        aria-live="polite"
        className="scroll-paper min-h-0 flex-1 overflow-y-auto lg:min-h-[9rem]"
        style={{ maskImage: 'linear-gradient(to bottom, #000 calc(100% - 1.25rem), transparent)' }}
      >
        {live.map((t) => (
          <li key={t.name} className="stamp border-b border-ink/10">
            <button
              type="button"
              onClick={(e) => {
                const row = e.currentTarget.parentElement
                setOpen(shown === t.name ? '' : t.name)
                requestAnimationFrame(() => row?.scrollIntoView({ block: 'nearest' }))
              }}
              className="flex w-full items-center gap-2 py-[5px] text-left"
            >
              <span aria-hidden className="text-ink/30">
                ▸
              </span>
              <span className="font-mono text-[13px] text-brass-ink">
                {mechanics ? t.name : t.name.replace(/_/g, ' ')}
              </span>
              <span className="ml-auto font-mono text-[10px] tracking-[0.14em] text-pencil uppercase">
                {t.annotations?.readOnlyHint ? 'reads' : 'acts'}
              </span>
            </button>
            {shown === t.name && (
              <p className="mb-2 ml-[7px] border-l border-ink/20 pl-3 text-[13px] leading-snug text-pencil italic">
                {t.description}
              </p>
            )}
          </li>
        ))}
        {striking.map((n) => (
          <li key={n} className="flex items-center gap-2 border-b border-ink/10 py-[5px]">
            <span aria-hidden className="text-ink/30">
              ▸
            </span>
            <span className="relative font-mono text-[13px] text-brass-ink">
              {mechanics ? n : n.replace(/_/g, ' ')}
              <StrikeRule />
            </span>
          </li>
        ))}
        {live.length === 0 && striking.length === 0 && (
          <li className="py-1.5 text-[14px] text-pencil italic">nothing registered</li>
        )}
      </ul>

      {/* The acts the disposition never opened: the confinement, itemised, with its price.
          Pinned below the scroller -- withheld is the argument, not a footnote you scroll to. */}
      {mechanics && withheld > 0 && (
        <ul className="shrink-0 border-t border-ink/25 pt-1">
          {closed.flatMap(([fam, f]) =>
            f.acts.map((a) => (
              <li
                key={`${fam}-${a}`}
                className="flex items-center gap-2 border-b border-ink/10 py-[5px] text-pencil last:border-b-0"
              >
                <span aria-hidden className="text-ink/20">
                  ▸
                </span>
                <span className="font-mono text-[13px] line-through decoration-oxblood/70">{a}</span>
                <span className="ml-auto font-mono text-[10px] text-pencil">
                  needs {f.stat} {f.min + 1}
                </span>
              </li>
            )),
          )}
        </ul>
      )}

      <p
        aria-live="polite"
        className="mt-4 shrink-0 border-t border-ink/25 pt-3 font-mono text-[11px]"
      >
        {lastRoll ? (
          <span key={`${lastRoll.of}-${lastRoll.d20}`}>
            {/* Drawn, not typed: U+2684 is absent from the loaded faces and renders as tofu. */}
            <svg className="die mr-2 size-4 align-[-0.28em]" viewBox="0 0 16 16" aria-hidden>
              <rect
                x="1"
                y="1"
                width="14"
                height="14"
                rx="2.5"
                fill="none"
                stroke="var(--color-ink)"
                strokeOpacity="0.7"
                strokeWidth="1.2"
              />
              {[
                [4.6, 4.6],
                [11.4, 4.6],
                [8, 8],
                [4.6, 11.4],
                [11.4, 11.4],
              ].map(([cx, cy]) => (
                <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.5" fill="var(--color-ink)" />
              ))}
            </svg>
            <span className="mr-2 text-pencil">{lastRoll.mine ? 'you' : sheet.name}</span>
            <span className={lastRoll.ok ? 'text-brass-ink' : 'text-oxblood'}>
              {lastRoll.of} {lastRoll.ok ? 'OK' : 'FAIL'}
            </span>
            <span className="text-pencil">
              {' '}
              d20 {lastRoll.d20} {lastRoll.total - lastRoll.d20 >= 0 ? '+' : '−'}{' '}
              {Math.abs(lastRoll.total - lastRoll.d20)} = {lastRoll.total} vs DC {lastRoll.dc}
            </span>
          </span>
        ) : (
          <span className="text-pencil">no roll yet</span>
        )}
      </p>
    </aside>
  )
}
