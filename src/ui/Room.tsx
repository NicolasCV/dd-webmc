import { useState } from 'react'
import { rooms, type Prop } from '../game/world'
import { unseenProps } from '../game/tools'
import { useGame } from '../store'

/**
 * Percent of the plate, so it is one number to nudge per thing once the art lands.
 * Everything else reads these; nothing else needs touching.
 */
const SPOTS: Record<string, { party: [number, number]; props: Record<string, [number, number]> }> = {
  landing: {
    party: [44, 74],
    props: { door_seal: [73, 48], rubble: [26, 68], bracket: [18, 42] },
  },
  hall: {
    party: [40, 76],
    props: { murals: [62, 36], bones: [20, 62], brazier: [80, 60] },
  },
  cistern: {
    party: [36, 78],
    props: { water: [62, 82], scribe: [54, 50] },
  },
  vault: {
    party: [42, 76],
    props: { reliquary: [28, 46], ledger: [68, 58] },
  },
}

const at = ([x, y]: [number, number]) => ({ left: `${x}%`, top: `${y}%` })

export function Room({
  examine,
  disabled,
}: {
  examine: (p: Prop) => void
  disabled: boolean
}) {
  const [missing, setMissing] = useState<string[]>([])
  const { sheet, roomId, visited, flags } = useGame()
  const room = rooms[roomId]
  const spots = SPOTS[roomId]
  const unseen = unseenProps(room, flags)

  return (
    <div className="relative h-[228px] w-full shrink-0 overflow-hidden border-b border-ink/15">
      {missing.includes(roomId) ? (
        <div className="hatch grid h-full w-full place-items-center">
          <p className="font-mono text-[11px] tracking-[0.14em] text-pencil uppercase">
            {room.name} — plate pending
          </p>
        </div>
      ) : (
        <img
          src={`/art/rooms/${roomId}.webp`}
          alt=""
          onError={() => setMissing((m) => [...m, roomId])}
          className="plate h-full w-full object-cover object-center"
        />
      )}

      {room.props.map((p) => {
        const spot = spots?.props[p.id]
        if (!spot) return null
        const seen = !unseen.includes(p)
        return (
          <button
            key={p.id}
            type="button"
            disabled={disabled || seen}
            onClick={() => examine(p)}
            style={at(spot)}
            className="group absolute -translate-x-1/2 -translate-y-1/2 disabled:cursor-default"
          >
            <span
              className={`block size-2.5 rounded-full border ${
                seen ? 'border-ink/25 bg-transparent' : 'border-brass bg-brass/40 group-hover:bg-brass'
              }`}
            />
            {!seen && (
              <span className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 rounded-xs bg-vellum/80 px-1 font-mono text-[10px] whitespace-nowrap text-ink/70 opacity-0 group-hover:opacity-100">
                {p.label}
              </span>
            )}
          </button>
        )
      })}

      {spots && (
        <div
          style={at(spots.party)}
          className="absolute flex -translate-x-1/2 -translate-y-1/2 items-end gap-3"
        >
          <Token label="you" className="border-ink/70 bg-ink text-vellum" />
          <Token
            label={sheet?.name ?? 'them'}
            className="border-brass/80 bg-brass text-ink"
          />
        </div>
      )}

      <p className="absolute inset-x-0 bottom-0 flex flex-wrap gap-x-2 bg-gradient-to-t from-vellum/85 to-transparent px-3 pt-4 pb-1 font-mono text-[10px] tracking-wide">
        {Object.values(rooms)
          .filter((r) => visited.includes(r.id))
          .map((r) => (
            <span key={r.id} className={r.id === roomId ? 'text-brass' : 'text-pencil/70'}>
              {r.name}
            </span>
          ))}
      </p>
    </div>
  )
}

const Token = ({ label, className }: { label: string; className: string }) => (
  <span className="flex flex-col items-center gap-0.5">
    <span className={`size-4 rounded-full border shadow-sm ${className}`} />
    <span className="font-mono text-[9px] tracking-wide text-ink/70">{label}</span>
  </span>
)
