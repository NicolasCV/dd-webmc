import { useGame } from './store.ts'

export const NARRATOR = 'fable'

// Time-stretch on playback, not a lower `speed` upstream: preservesPitch keeps the voice's pitch.
const RATE = 1.15

// iOS and in-app browsers refuse play() far from the user gesture; reuse one element.
// Build on first use: .check.ts scripts import this file under node, where Audio is missing.
let el: HTMLAudioElement | null = null
const element = () => (el ??= new Audio())
let playing: HTMLAudioElement | null = null
let queue: Promise<void> = Promise.resolve()

/** Call synchronously inside a click handler to give the element gesture permission. */
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
  a.preservesPitch = true
  // Loading a source resets playbackRate to defaultPlaybackRate, so set both.
  a.defaultPlaybackRate = RATE
  a.playbackRate = RATE
  playing = a
  try {
    await a.play()
    // Wait on 'pause' and 'error' too: 'ended' alone deadlocks the queue when stopAudio pauses.
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

export const speak = (text: string, voice: string) => {
  queue = queue.then(() => play(text, voice)).catch(() => {})
}
