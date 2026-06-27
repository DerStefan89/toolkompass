/**
 * Datei: components/layout/ConsentBanner.tsx
 *
 * Zweck: DSGVO-konformer Cookie-Consent-Banner. Zeigt beim ersten Besuch einen
 * schmalen Balken unten. Speichert die Wahl in localStorage und verschwindet danach.
 *
 * Wird aufgerufen von:
 * - app/layout.tsx (direkt vor </body>)
 *
 * Wichtig:
 * - "Alle akzeptieren" → reload, damit GoogleAnalytics den Consent sofort sieht.
 * - "Nur Notwendige" → kein Reload nötig (GA wird nicht geladen).
 */

'use client'

import { useState, useEffect } from 'react'
import { hasConsent, setConsent } from '@/lib/consent'
import styles from './ConsentBanner.module.css'

export default function ConsentBanner() {
  // Server rendert Banner nie (false). Client prüft localStorage nach Hydration.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!hasConsent()) setVisible(true)
  }, [])

  const handleAcceptAll = () => {
    setConsent({ analytics: true, marketing: true })
    window.location.reload()
  }

  const handleRejectOptional = () => {
    setConsent({ analytics: false, marketing: false })
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className={styles.banner}>
      <p className={styles.text}>
        Wir nutzen Cookies und Analytics, um ToolSucher zu verbessern.
        Du kannst selbst entscheiden, welche Kategorien du zulässt.
      </p>
      <div className={styles.buttons}>
        <button type="button" onClick={handleAcceptAll} className={styles.btnAccept}>
          Alle akzeptieren
        </button>
        <button type="button" onClick={handleRejectOptional} className={styles.btnReject}>
          Nur Notwendige
        </button>
      </div>
    </div>
  )
}
