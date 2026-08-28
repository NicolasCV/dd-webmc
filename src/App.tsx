import { useEffect, useState } from 'react'
import { speechActs } from './game/brakka'
import { Chat } from './ui/Chat'
import { Sheet } from './ui/Sheet'
import { registerAll, supported } from './webmcp/context'

export default function App() {
  const [hasWebMcp] = useState(supported)

  useEffect(() => {
    const ctrl = new AbortController()
    void registerAll(speechActs, ctrl.signal)
    return () => ctrl.abort()
  }, [])

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl gap-6 p-6">
      {!hasWebMcp && (
        <div className="fixed inset-x-0 top-0 bg-oxblood px-4 py-2 text-center font-mono text-xs text-vellum">
          document.modelContext is missing — enable chrome://flags/#enable-webmcp-testing
        </div>
      )}
      <Chat />
      <Sheet />
    </main>
  )
}
