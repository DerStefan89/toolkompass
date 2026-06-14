/**
 * Datei: components/home/StackWidget.tsx
 *
 * Zweck: Stack-Vorschau in der rechten Hero-Spalte der Startseite. Lädt den
 * Stack des eingeloggten Nutzers erst im Browser (die Startseite ist gecacht).
 * Drei Zustände: Gast / eingeloggt-leer / eingeloggt-mit-Tools.
 *
 * Wird aufgerufen von:
 * - app/page.tsx (rechte Hero-Spalte)
 *
 * Wichtig:
 * - Kein Prisma-Import — getMyStackSummary (Server Action) ist die Brücke.
 * - Ladezustand ohne Layout-Sprung (neutraler Platzhalter).
 */

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getMyStackSummary, type StackSummary } from '@/app/page-actions'
import { formatPreis } from '@/lib/utils/format'
import styles from './StackWidget.module.css'

const MAX_VISIBLE = 5

export default function StackWidget() {
  const [data, setData] = useState<StackSummary | null>(null)

  useEffect(() => {
    let active = true
    getMyStackSummary()
      .then((res) => {
        if (active) setData(res)
      })
      .catch(() => {
        if (active) setData({ isLoggedIn: false, tools: [], monthlyCents: 0, count: 0 })
      })
    return () => {
      active = false
    }
  }, [])

  // ─── Ladezustand: neutraler Platzhalter ────────────────────
  if (data === null) {
    return (
      <div>
        <div className={styles.header}>
          <span className={styles.title}>Dein Tool-Stack</span>
        </div>
        <p className={styles.copy}>Wird geladen …</p>
      </div>
    )
  }

  // ─── Zustand 1: Gast ───────────────────────────────────────
  if (!data.isLoggedIn) {
    return (
      <div>
        <div className={styles.header}>
          <span className={styles.title}>Dein Tool-Stack</span>
        </div>
        <p className={styles.copy}>
          Melde dich an und markiere deine Tools, um Kosten und Alternativen
          an einem Ort zu sehen.
        </p>
        <Link href="/tool-finder" className={styles.cta}>Tools entdecken</Link>
        <Link href="/einloggen" className={styles.secondary}>Einloggen</Link>
      </div>
    )
  }

  // ─── Zustand 2: eingeloggt, keine Tools ────────────────────
  if (data.count === 0) {
    return (
      <div>
        <div className={styles.header}>
          <span className={styles.title}>Dein Tool-Stack</span>
        </div>
        <p className={styles.copy}>
          Du hast noch keine Tools markiert. Klick bei einem Tool auf{' '}
          {'„Ich nutze das"'}, um deinen Stack aufzubauen.
        </p>
        <Link href="/tool-finder" className={styles.cta}>Tools entdecken</Link>
      </div>
    )
  }

  // ─── Zustand 3: eingeloggt mit Tools ───────────────────────
  const visible = data.tools.slice(0, MAX_VISIBLE)
  const rest = data.count - visible.length

  return (
    <div>
      <div className={styles.header}>
        <span className={styles.title}>Dein Tool-Stack</span>
      </div>

      <div className={styles.preview}>
        {visible.map((tool) => (
          <div key={tool.id} className={styles.toolRow}>
            {/* backgroundColor + border: conditional auf logoUrl — erlaubte Inline-Styles */}
            <div
              className={styles.logoWrap}
              style={{
                backgroundColor: tool.logoUrl ? 'transparent' : 'var(--color-cta)',
                border: tool.logoUrl ? '1px solid var(--color-border)' : 'none',
              }}
            >
              {tool.logoUrl ? (
                <Image src={tool.logoUrl} alt={tool.name} width={28} height={28} className={styles.logoImg} />
              ) : (
                <span className={styles.logoInitial}>{tool.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className={styles.toolName}>{tool.name}</span>
          </div>
        ))}
        {rest > 0 && <p className={styles.more}>+ {rest} weitere</p>}
      </div>

      <p className={styles.costLine}>
        Monatliche Kosten: {formatPreis(data.monthlyCents, { suffix: '/ Monat' })}
      </p>

      <Link href="/meine-tools" className={styles.cta}>Zu meinen Tools</Link>
    </div>
  )
}
