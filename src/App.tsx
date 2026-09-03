import { useEffect, useRef, useState } from 'react'
import type { RegisteredTool } from '@mcp-b/webmcp-types'
import { useGame } from './store'
import { Chat } from './ui/Chat'
import { Sheet } from './ui/Sheet'
import { Start } from './ui/Start'
import { listTools, modelContext, supported, toInputSchema } from './webmcp/context'
import { resync, startRegistry } from './webmcp/registry'

const REPO = 'https://github.com/NicolasCV/dd-webmc'

const AGENT_PROMPT =
  'You are the companion in this tab. Your abilities are WebMCP tools registered on ' +
  'document.modelContext — call getTools() to see them and executeTool() to act. Do not click ' +
  'the page. When you have finished acting, call wait_for_moment: it blocks until the player ' +
  'does something and returns what they did. Act on that, then call it again, and keep calling ' +
  'it — the player is a person typing and is often slow. Stay in that loop until the scene ends; ' +
  'do not stop to report back to me.'

export default function App() {
  const started = useGame((s) => !!s.sheet)
  const soloAgent = useGame((s) => s.soloAgent)
  const toggleSoloAgent = useGame((s) => s.toggleSoloAgent)
  const [live, setLive] = useState(supported)
  const [tools, setTools] = useState<RegisteredTool[]>([])
  const [pane, setPane] = useState<'scene' | 'sheet'>('scene')
  const [copied, setCopied] = useState(false)
  const dlg = useRef<HTMLDialogElement>(null)
  const seat = useRef<HTMLDivElement>(null)

  useEffect(startRegistry, [])

  useEffect(() => {
    const mc = modelContext()
    const refresh = () => void listTools().then(setTools)
    // modelContext injected after first paint starts empty: resync before listing, or tools read as none.
    void resync().then(refresh)
    mc.addEventListener('toolchange', refresh)
    return () => mc.removeEventListener('toolchange', refresh)
  }, [live])

  // In-app browser and extension inject document.modelContext late, after first paint.
  useEffect(() => {
    if (live) return
    const id = setInterval(() => {
      if (supported()) {
        setLive(true)
        clearInterval(id)
      }
    }, 500)
    const stop = setTimeout(() => clearInterval(id), 10_000)
    return () => {
      clearInterval(id)
      clearTimeout(stop)
    }
  }, [live])

  const open = (toSeat: boolean) => {
    const d = dlg.current
    if (!d) return
    d.showModal()
    // A modal dialog is position:absolute, so scrollIntoView would scroll the page out from under it.
    d.scrollTop = toSeat ? (seat.current?.offsetTop ?? 0) : 0
  }

  return (
    <div className={started ? 'flex h-[100dvh] flex-col' : 'flex min-h-[100dvh] flex-col'}>
      <header className="mx-auto flex w-full max-w-[1400px] shrink-0 flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-4 pt-3 pb-2 sm:pt-5 sm:pb-3 lg:px-10">
        <a href="/" className="font-display text-lg tracking-tight text-vellum/90">
          Party of Two
        </a>
        <nav className="flex flex-wrap items-baseline gap-x-5 gap-y-1 font-mono text-label tracking-label text-vellum/55 uppercase">
          <button
            type="button"
            onClick={() => open(false)}
            className="hidden hover:text-brass sm:inline"
          >
            how to play
          </button>
          <a className="hidden hover:text-brass sm:inline" href="/why.html">
            why webmcp
          </a>
          <a className="hidden hover:text-brass sm:inline" href={REPO}>
            source
          </a>
          <button type="button" onClick={() => open(true)} className="text-brass hover:underline">
            {live ? 'document.modelContext' : 'local registry'} · {tools.length}
          </button>
        </nav>
      </header>

      {started ? (
        <main className="mx-auto flex w-full max-w-[1400px] min-h-0 flex-1 flex-col gap-5 px-4 pb-4 lg:flex-row lg:gap-8 lg:px-10 lg:pb-10">
          <nav className="flex shrink-0 gap-5 font-mono text-label tracking-label uppercase lg:hidden">
            {(['scene', 'sheet'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPane(p)}
                className={pane === p ? 'text-brass' : 'text-vellum/50'}
              >
                {p === 'sheet' ? `sheet · ${tools.length}` : 'scene'}
              </button>
            ))}
          </nav>
          <Chat className={pane === 'scene' ? 'flex' : 'hidden lg:flex'} />
          <Sheet tools={tools} className={pane === 'sheet' ? 'flex' : 'hidden lg:flex'} />
        </main>
      ) : (
        <main className="flex min-h-0 flex-1 flex-col">
          <Start />
        </main>
      )}

      <dialog
        ref={dlg}
        // Backdrop clicks target the dialog, and so do clicks on its padding: compare against the box.
        onMouseDown={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          const out =
            e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom
          if (out) e.currentTarget.close()
        }}
        className="sheet m-auto max-h-[85vh] w-[min(42rem,92vw)] overflow-y-auto border-0 p-6 text-ink backdrop:bg-ink/75 backdrop:backdrop-blur-sm lg:p-8"
      >
        <form method="dialog" className="float-right">
          <button className="font-mono text-label text-pencil hover:text-oxblood">close ✕</button>
        </form>

        <h2 className="font-display text-3xl tracking-tight">How to play</h2>
        <p className="mt-3 text-body leading-relaxed text-pencil">
          You play one character; the other one is an agent. Talk to them in the line at the bottom,
          or take a turn with one of the chips above it. It plays as a scene; the machinery is
          hidden until you ask for it. Hit <em>show mechanics</em> in the scene header and the same
          screen names every tool they hold, struck through the ones they do not — a room change
          turns the set over.
        </p>
        <p className="mt-2 text-body leading-relaxed text-pencil">
          Four rooms, forty turns, about ten minutes. Ask a cold mercenary for reassurance and watch
          what the registry does about it.
        </p>
        <div className="mt-4 flex gap-5 font-mono text-label tracking-label text-brass-ink uppercase sm:hidden">
          <a href="/why.html">why webmcp</a>
          <a href={REPO}>source</a>
        </div>

        <div ref={seat} className="mt-8 border-t border-ink/25 pt-6">
          <h2 className="font-display text-3xl tracking-tight">Take the agent's seat</h2>

          {live ? (
            <p className="mt-3 text-body leading-relaxed text-pencil">
              This page has registered {tools.length} tools on{' '}
              <code className="font-mono text-brass-ink">document.modelContext</code>. Any WebMCP
              agent in this browser can list them and call them right now.
            </p>
          ) : (
            <p className="mt-3 text-body leading-relaxed text-pencil">
              <code className="font-mono text-brass-ink">document.modelContext</code> is not exposed
              in this browser, so the tools are running on the page's own registry — the game, the
              reconciler and the sheet behave identically, and only the part that genuinely needs the
              browser is missing. To hand the seat over for real: Chrome 149+ with{' '}
              <code className="font-mono text-brass-ink">
                chrome://flags/#enable-webmcp-testing
              </code>
              .
            </p>
          )}

          <ol className="mt-4 list-decimal space-y-2 pl-5 text-body leading-relaxed text-pencil">
            <li>Open this page in a browser your agent can see.</li>
            <li>
              Give it this prompt:
              <div className="mt-2 border border-ink/25 bg-ink/[0.04] p-3">
                <p className="font-mono text-note leading-relaxed text-ink">{AGENT_PROMPT}</p>
                <button
                  type="button"
                  onClick={() =>
                    void navigator.clipboard.writeText(AGENT_PROMPT).then(() => {
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    })
                  }
                  className="mt-2.5 font-mono text-label tracking-label text-brass-ink uppercase hover:underline"
                >
                  {copied ? 'copied ✓' : 'copy prompt'}
                </button>
              </div>
            </li>
            <li>Turn the built-in model off below, so you are the only thing driving the companion.</li>
          </ol>

          <button
            type="button"
            onClick={toggleSoloAgent}
            className={`mt-5 inline-flex items-center gap-2 border px-3 py-2 font-mono text-note ${soloAgent ? 'border-oxblood text-oxblood' : 'border-ink/30 text-pencil'}`}
          >
            <span>{soloAgent ? '◼' : '◻'}</span>
            {soloAgent
              ? 'built-in model OFF — your agent has the seat'
              : 'built-in model on — turn it off to take the seat'}
          </button>

          <ul className="mt-6 border-t border-ink/20">
            {tools.map((t) => (
              <li key={t.name} className="border-b border-ink/10 py-2.5">
                <p className="flex items-baseline justify-between gap-3 font-mono text-note text-brass-ink">
                  {t.name}
                  <span className="font-mono text-micro tracking-label text-pencil uppercase">
                    {t.annotations?.readOnlyHint ? 'reads' : 'acts'}
                  </span>
                </p>
                <p className="mt-1 text-body leading-snug text-pencil italic">{t.description}</p>
                <pre className="mt-1 font-mono text-micro whitespace-pre-wrap text-pencil">
                  {JSON.stringify(toInputSchema(t.inputSchema)?.properties ?? {}, null, 1)}
                </pre>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </div>
  )
}
