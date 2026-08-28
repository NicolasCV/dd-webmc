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
    <main className="mx-auto flex min-h-screen max-w-5xl gap-6 p-6">
      {!hasWebMcp && (
        <div className="fixed inset-x-0 top-0 bg-oxblood px-4 py-2 text-center font-mono text-xs text-vellum">
          document.modelContext is missing — enable chrome://flags/#enable-webmcp-testing
        </div>
      )}
      {started ? (
        <>
          <Chat />
          <Sheet />
        </>
      ) : (
        <Start />
      )}
    </main>
  )
}
