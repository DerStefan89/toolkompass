/**
 * Datei: components/layout/GoogleAnalytics.tsx
 *
 * Zweck: Lädt das Google Analytics gtag-Script NUR wenn der Nutzer Analytics-
 * Consent gegeben hat. Ohne Consent wird nichts geladen (DSGVO-konform).
 *
 * Wird aufgerufen von:
 * - app/layout.tsx (direkt nach <body>)
 *
 * Wichtig:
 * - Strategy "afterInteractive" — Script wird nach dem Hydrate geladen.
 * - consent('update') setzt analytics_storage auf 'granted'.
 * - Kein GA-Code wird jemals vor Consent ausgeführt.
 */

'use client'

import { useState } from 'react'
import Script from 'next/script'
import { getConsent } from '@/lib/consent'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function GoogleAnalytics() {
  // Lazy-Init: liest Consent einmalig beim ersten Render (Client-only).
  // Kein useEffect+setState nötig — vermeidet react-hooks/set-state-in-effect.
  const [enabled] = useState(() => {
    const consent = getConsent()
    return !!consent?.analytics
  })

  if (!enabled || !GA_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
          });
          gtag('consent', 'update', {
            analytics_storage: 'granted',
          });
          gtag('config', '${GA_ID}', {
            anonymize_ip: true,
          });
        `}
      </Script>
    </>
  )
}
