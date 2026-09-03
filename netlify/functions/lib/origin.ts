// These functions proxy the owner's OpenAI key, so only the site itself may call them.
// Netlify sets URL (primary) and DEPLOY_PRIME_URL (branch and preview deploys).
const originOf = (url: string) => {
  try { return new URL(url).origin } catch { return '' }
}

const allowed = new Set(
  ['https://webmcp.nicolascardenas.dev', process.env.URL, process.env.DEPLOY_PRIME_URL]
    .map((u) => originOf(u ?? ''))
    .filter(Boolean),
)

export const denyCrossOrigin = (req: Request): Response | null => {
  const origin = originOf(req.headers.get('origin') ?? req.headers.get('referer') ?? '')
  if (allowed.has(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return null
  return Response.json({ error: 'forbidden' }, { status: 403 })
}
