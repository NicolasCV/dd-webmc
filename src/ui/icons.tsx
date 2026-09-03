/* Drawn, not typed: the loaded mono face has no glyph for most of these, and tofu is worse than a path. */
const PATHS = {
  look: (
    <>
      <circle cx="6.8" cy="6.8" r="4.3" />
      <path d="M10 10 13.6 13.6" />
    </>
  ),
  roll: (
    <>
      <rect x="2" y="2" width="12" height="12" rx="2.5" />
      <circle cx="5.4" cy="5.4" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="8" cy="8" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="10.6" cy="10.6" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  say: <path d="M2.6 3.4h10.8v7.2H7.6L4.4 13.4V10.6H2.6z" />,
  go: <path d="M2.4 8h11M9.4 4.2 13.4 8 9.4 11.8" />,
  sound: (
    <>
      <path d="M2.6 6.2h2.5L8.4 3.3v9.4L5.1 9.8H2.6z" />
      <path d="M10.7 6.1a3.3 3.3 0 0 1 0 3.8" />
    </>
  ),
  hush: (
    <>
      <path d="M2.6 6.2h2.5L8.4 3.3v9.4L5.1 9.8H2.6z" />
      <path d="M10.7 6.4 13.7 9.6M13.7 6.4 10.7 9.6" />
    </>
  ),
  seen: (
    <>
      <path d="M1.4 8S4 4.1 8 4.1 14.6 8 14.6 8 12 11.9 8 11.9 1.4 8 1.4 8z" />
      <circle cx="8" cy="8" r="1.7" />
    </>
  ),
  // A shut lid, not an eye with a slash through it: at 14px the slash eats the eye and reads as ∅.
  unseen: (
    <>
      <path d="M1.6 6.6C4 10 12 10 14.4 6.6" />
      <path d="M3.4 9.1 2.4 10.8M8 10.3v1.9M12.6 9.1l1 1.7" />
    </>
  ),
  pause: <path d="M5.9 3.3v9.4M10.1 3.3v9.4" />,
  play: <path d="M5.2 3.2 12.6 8 5.2 12.8z" />,
  again: <path d="M13 8.4A5 5 0 1 1 11.2 4.4M13.4 2.6v2.6h-2.6" />,
  swap: <path d="M2.8 5.6h9.4M9.6 2.9 12.6 5.6 9.6 8.3M13.2 10.4H3.8M6.4 7.7 3.4 10.4 6.4 13.1" />,
}

export type IconName = keyof typeof PATHS

export const Icon = ({ of, className = 'size-3.5' }: { of: IconName; className?: string }) => (
  <svg
    viewBox="0 0 16 16"
    className={`shrink-0 ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.3}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {PATHS[of]}
  </svg>
)
