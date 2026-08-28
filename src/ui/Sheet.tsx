import { useEffect, useState } from 'react'
import { brakka } from '../game/brakka'
import { listTools, modelContext } from '../webmcp/context'

export function Sheet() {
  const [tools, setTools] = useState<string[]>([])

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

  return (
    <aside className="w-80 shrink-0 border border-ink/25 bg-vellum/60 p-5">
      <h2 className="font-display text-2xl tracking-tight">{brakka.name}</h2>
      <p className="mt-1 text-sm text-pencil italic">{brakka.oneLine}</p>

      <dl className="mt-4 flex gap-4 font-mono text-xs">
        {Object.entries(brakka.attributes).map(([k, v]) => (
          <div key={k}>
            <dt className="text-pencil uppercase">{k}</dt>
            <dd className="text-base">{v}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-6 border-t border-ink/25 pt-3 font-mono text-xs tracking-widest text-pencil uppercase">
        Can do now
      </h3>
      <ul className="mt-2 space-y-1 font-mono text-sm">
        {tools.map((name) => (
          <li key={name} className="text-brass">
            <span className="text-ink/40">▸ </span>
            {name}
          </li>
        ))}
        {tools.length === 0 && <li className="text-pencil italic">nothing registered</li>}
      </ul>
    </aside>
  )
}
