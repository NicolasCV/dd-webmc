import { useEffect, useState } from 'react'
import { useGame } from './store'
import { Chat } from './ui/Chat'
import { Sheet } from './ui/Sheet'
import { Start } from './ui/Start'
import { supported } from './webmcp/context'
import { startRegistry } from './webmcp/registry'

export default function App() {
  const [hasWebMcp] = useState(supported)
  const started = useGame((s) => !!s.sheet)

  useEffect(startRegistry, [])

  return (
    <div className="flex min-h-screen flex-col lg:h-screen">
      {!hasWebMcp && (
        <p className="shrink-0 bg-ink/70 px-4 py-1.5 text-center font-mono text-[11px] text-vellum/70 backdrop-blur">
          no <code className="text-brass">document.modelContext</code> here — running on a local
          registry. For the real thing, Chrome 149+ with{' '}
          <code className="text-brass">chrome://flags/#enable-webmcp-testing</code>
        </p>
      )}
      {started ? (
        <main className="mx-auto flex w-full max-w-[1500px] min-h-0 flex-1 flex-col gap-5 p-4 lg:flex-row lg:gap-8 lg:p-10">
          <Chat />
          <Sheet />
        </main>
      ) : (
        <Start />
      )}
    </div>
  )
}
