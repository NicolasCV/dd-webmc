import { rooms, type Room } from '../game/world'
import { unseenProps } from '../game/tools'
import { useGame } from '../store'

const W = 86
const H = 54
const MAP: Record<string, [number, number]> = {
  landing: [5, 6],
  hall: [117, 6],
  vault: [229, 6],
  cistern: [117, 76],
}

const wob = (k: number, i: number) => Math.sin(k * 91.7 + i * 37.3)
const sketch = (x: number, y: number, k: number) =>
  `M${x + wob(k, 0)} ${y + wob(k, 1)} L${x + W + wob(k, 2)} ${y + wob(k, 3)} ` +
  `L${x + W + wob(k, 4)} ${y + H + wob(k, 5)} L${x + wob(k, 6)} ${y + H + wob(k, 7)} Z`

// Key is both room ids sorted, so ways() finds the same exit from either end.
const WAYS: Record<string, { rail: [number, number, number, number]; label: [number, number] }> = {
  'hall|landing': { rail: [89, 33, 119, 33], label: [104, 70] },
  'hall|vault': { rail: [201, 33, 231, 33], label: [216, 70] },
  'cistern|hall': { rail: [180, 58, 180, 78], label: [212, 70] },
}

const ways = () => {
  const seen = new Map<string, string | undefined>()
  for (const r of Object.values(rooms))
    for (const e of r.exits) {
      const key = [r.id, e.to].sort().join('|')
      if (!seen.get(key)) seen.set(key, e.needs)
    }
  return [...seen]
}

const marks = (r: Room, flags: string[]) => {
  const unseen = unseenProps(r, flags)
  return r.props
    .filter((p) => !p.needs || flags.includes(p.needs))
    .slice(0, 3)
    .map((p) => ({ id: p.id, unseen: unseen.includes(p) }))
}

const short = (name: string) => name.replace(/^The /, '').replace(/ of .*/, '')

const row = 'flex items-baseline justify-between gap-3 border-b border-ink/10 py-[3px]'
const state = 'text-[9px] tracking-[0.14em] uppercase'

export function Room() {
  const { sheet, roomId, visited, flags } = useGame()
  const links = ways()

  return (
    <div className="relative flex h-[136px] w-full shrink-0 overflow-hidden border-b border-ink/15 lg:h-[220px]">
      <svg
        viewBox="0 0 320 136"
        preserveAspectRatio="xMidYMid meet"
        className="h-full min-w-0 flex-1"
        role="img"
        aria-label="Map of the four rooms and the ways between them"
      >
        {links.map(([key, needs]) => {
          const [x1, y1, x2, y2] = WAYS[key].rail
          const [lx, ly] = WAYS[key].label
          const flat = y1 === y2
          const [mx, my] = [(x1 + x2) / 2, (y1 + y2) / 2]
          const locked = !!needs && !flags.includes(needs)
          const rail = (o: number) =>
            flat
              ? { x1, y1: y1 + o, x2, y2: y2 + o }
              : { x1: x1 + o, y1, x2: x2 + o, y2 }
          return (
            <g key={key} stroke="var(--color-ink)">
              <line {...rail(-4)} strokeWidth={1.2} strokeOpacity={0.55} vectorEffect="non-scaling-stroke" />
              <line {...rail(4)} strokeWidth={1.2} strokeOpacity={0.55} vectorEffect="non-scaling-stroke" />
              {locked && (
                <>
                  <line
                    x1={flat ? mx : mx - 4}
                    y1={flat ? my - 4 : my}
                    x2={flat ? mx : mx + 4}
                    y2={flat ? my + 4 : my}
                    stroke="var(--color-oxblood)"
                    strokeWidth={2.6}
                    vectorEffect="non-scaling-stroke"
                  />
                  {flat && (
                    <line
                      x1={lx}
                      y1={my + 5}
                      x2={lx}
                      y2={ly - 6.5}
                      stroke="var(--color-oxblood)"
                      strokeWidth={1}
                      strokeOpacity={0.5}
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    className="font-mono"
                    fontSize={8}
                    fill="var(--color-oxblood)"
                    stroke="var(--color-vellum)"
                    strokeWidth={3.5}
                    paintOrder="stroke"
                  >
                    {needs}
                  </text>
                </>
              )}
            </g>
          )
        })}

        {Object.entries(MAP).map(([id, [x, y]], k) => {
          const seen = visited.includes(id)
          const here = id === roomId
          const tint = here ? 'var(--color-oxblood)' : seen ? 'var(--color-ink)' : 'var(--color-pencil)'
          return (
            <g key={id}>
              {!seen &&
                [0, 1, 2, 3].map((i) => (
                  <line
                    key={i}
                    x1={x + 10 + i * 16}
                    y1={y + 50}
                    x2={x + 26 + i * 16}
                    y2={y + 34}
                    stroke="var(--color-ink)"
                    strokeOpacity={0.09}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              <path
                d={sketch(x, y, k + 1)}
                fill={seen ? 'var(--color-vellum)' : 'none'}
                fillOpacity={0.8}
                stroke={tint}
                strokeOpacity={here ? 1 : seen ? 0.5 : 0.25}
                strokeWidth={here ? 2 : 1.2}
                strokeDasharray={seen ? undefined : '5 4'}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={x + 7}
                y={y + 13}
                className="font-display"
                fontSize={8.5}
                fill={tint}
                fillOpacity={seen ? 1 : 0.65}
              >
                {short(rooms[id].name)}
              </text>
              <text
                x={x + 7}
                y={y + 23}
                className="font-mono uppercase"
                fontSize={7}
                letterSpacing={0.7}
                fill={here ? 'var(--color-oxblood)' : seen ? 'var(--color-brass-ink)' : 'var(--color-pencil)'}
                fillOpacity={seen ? 0.9 : 0.55}
              >
                {here ? 'you are here' : seen ? 'surveyed' : 'unsurveyed'}
              </text>
              <line
                x1={x + 7}
                y1={y + 28}
                x2={x + 79}
                y2={y + 28}
                stroke={tint}
                strokeOpacity={0.2}
                vectorEffect="non-scaling-stroke"
              />

              {/* Decorative only: the chip row is the labelled control for the same action. */}
              {seen && (
                <g aria-hidden className="pointer-events-none">
                  {marks(rooms[id], flags).map((p, i, all) => (
                    <circle
                      key={p.id}
                      cx={x + 75 - (all.length - 1 - i) * 12}
                      cy={y + 37}
                      r={2.3}
                      fill={p.unseen ? 'var(--color-brass)' : 'none'}
                      stroke={p.unseen ? undefined : 'var(--color-ink)'}
                      strokeOpacity={0.4}
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                  {here && (
                    <>
                      <circle cx={x + 13} cy={y + 37} r={3.1} fill="var(--color-ink)" />
                      <circle
                        cx={x + 20}
                        cy={y + 37}
                        r={3.1}
                        fill="var(--color-brass)"
                        stroke="var(--color-ink)"
                        strokeWidth={0.8}
                      />
                      <text
                        x={x + 43}
                        y={y + 48}
                        textAnchor="middle"
                        className="font-display"
                        fontSize={7}
                        fill="var(--color-brass-ink)"
                      >
                        {(sheet?.name ?? 'them').slice(0, 11)}
                      </text>
                    </>
                  )}
                </g>
              )}
            </g>
          )
        })}
      </svg>

      <div className="hidden w-[42%] shrink-0 flex-col justify-center border-l border-ink/15 py-3 pl-6 font-mono text-[10px] lg:flex">
        <h2 className="border-b border-ink/25 pb-1 tracking-[0.18em] text-pencil uppercase">
          the plan
        </h2>
        <ul>
          {Object.values(rooms).map((r) => {
            const current = r.id === roomId
            const seen = visited.includes(r.id)
            return (
              <li key={r.id} className={row}>
                <span
                  className={`font-body text-[11px] ${current ? 'text-oxblood' : seen ? 'text-ink' : 'text-pencil/55'}`}
                >
                  {short(r.name)}
                </span>
                <span
                  className={`${state} ${current ? 'text-oxblood' : seen ? 'text-brass-ink' : 'text-pencil/55'}`}
                >
                  {current ? 'here' : seen ? 'visited' : 'unvisited'}
                </span>
              </li>
            )
          })}
        </ul>
        <h2 className="mt-3 border-b border-ink/25 pb-1 tracking-[0.18em] text-pencil uppercase">
          ways
        </h2>
        <ul>
          {links.map(([key, needs]) => {
            const locked = !!needs && !flags.includes(needs)
            return (
              <li key={key} className={row}>
                <span className="text-ink/75">{key.replace('|', ' ↔ ')}</span>
                <span className={locked ? 'text-oxblood' : `${state} text-pencil/55`}>
                  {locked ? `needs ${needs}` : 'open'}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
