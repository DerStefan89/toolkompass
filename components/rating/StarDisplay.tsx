/**
 * Datei: components/rating/StarDisplay.tsx
 *
 * Zweck: Read-only Sterne-Darstellung (gefüllt nach Wert). Server Component,
 * kein Input — für Durchschnitte und einzelne Bewertungen.
 *
 * Wird aufgerufen von:
 * - components/rating/RatingSummary.tsx
 * - app/admin/bewertungen/page.tsx
 */

const STARS = [1, 2, 3, 4, 5]

interface StarDisplayProps {
  value: number
  size?: number
}

export default function StarDisplay({ value, size = 16 }: StarDisplayProps) {
  const filled = Math.round(value)
  return (
    <span
      aria-label={`${value} von 5 Sternen`}
      style={{ color: 'var(--color-warning)', fontSize: `${size}px`, letterSpacing: '1px', whiteSpace: 'nowrap' }}
    >
      {STARS.map((i) => (
        <span key={i} aria-hidden="true">{i <= filled ? '★' : '☆'}</span>
      ))}
    </span>
  )
}
