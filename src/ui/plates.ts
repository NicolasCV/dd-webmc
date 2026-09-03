const STEM: Record<string, string> = { Brakka: 'brakka', 'Sister Wen': 'wen', Ilke: 'ilke' }

// Read off disk at build time, so a src is never guessed into a 404.
const DRAWN = new Set(
  Object.keys(import.meta.glob('/public/art/*.webp')).map((p) => p.split('/').pop()!.slice(0, -5)),
)

export const plate = (id: string) => (DRAWN.has(id) ? `/art/${id}.webp` : null)
export const stemOf = (name: string) => STEM[name]

/** The plate set is the tool set: an act wears its own face only where that plate was drawn. */
export const face = (name: string, act?: string) =>
  (act ? plate(`${STEM[name]}-${act}`) : null) ?? plate(STEM[name])
