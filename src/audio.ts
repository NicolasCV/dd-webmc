import { useGame } from './store.ts'

/** The room, the dice and the dark. Never a party member's voice. */
export const NARRATOR = 'fable'

// One element for the whole session. A freshly constructed Audio played after an awaited
// fetch is a long way from the user's gesture, and iOS and the in-app browser refuse it.
// Built on first use, not at import: the .check.ts scripts import this file under node.
let el: HTMLAudioElement | null = null
const element = () => (el ??= new Audio())
let playing: HTMLAudioElement | null = null
let queue: Promise<void> = Promise.resolve()

/** Call inside a real click, before anything is fetched, to buy the element its gesture. */
export const unlock = () => {
  const a = element()
  a.src = 'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjEyLjEwMAAAAAAAAAAAAAAA'
  void a.play().catch(() => {})
}

export const stopAudio = () => {
  playing?.pause()
  playing = null
}

async function play(text: string, voice: string) {
  if (useGame.getState().muted) return
  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text, voice }),
    signal: AbortSignal.timeout(20_000),
  })
  if (!res.ok || useGame.getState().muted) return
  const url = URL.createObjectURL(await res.blob())
  const a = element()
  a.src = url
  playing = a
  try {
    await a.play()
    // Waiting on 'ended' alone deadlocks the queue the first time stopAudio pauses a
    // line mid-word -- mute, restart -- and every later line waits behind it forever.
    await new Promise<void>((resolve) => {
      const ends = ['ended', 'pause', 'error']
      const done = () => {
        for (const e of ends) a.removeEventListener(e, done)
        resolve()
      }
      for (const e of ends) a.addEventListener(e, done)
    })
  } finally {
    URL.revokeObjectURL(url)
    if (playing === a) playing = null
  }
}

/** Fire and forget. The bubble is already on screen; audio catches up or it doesn't. */
export const speak = (text: string, voice: string) => {
  queue = queue.then(() => play(text, voice)).catch(() => {})
}
