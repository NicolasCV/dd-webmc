import { useGame } from './store'

let playing: HTMLAudioElement | null = null
let queue: Promise<void> = Promise.resolve()

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
  const audio = new Audio(url)
  playing = audio
  try {
    await audio.play()
    await new Promise((r) => audio.addEventListener('ended', r, { once: true }))
  } finally {
    URL.revokeObjectURL(url)
    if (playing === audio) playing = null
  }
}

/** Fire and forget. The bubble is already on screen; audio catches up or it doesn't. */
export const speak = (text: string, voice: string) => {
  queue = queue.then(() => play(text, voice)).catch(() => {})
}
