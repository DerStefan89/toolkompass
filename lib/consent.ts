/**
 * Datei: lib/consent.ts
 *
 * Zweck: Liest und speichert den Cookie-Consent-Zustand in localStorage.
 * Drei Kategorien: Notwendig (immer an), Analytics, Marketing.
 *
 * Wird aufgerufen von:
 * - components/layout/ConsentBanner.tsx (lesen + schreiben)
 * - components/layout/GoogleAnalytics.tsx (lesen)
 */

const STORAGE_KEY = 'ts_consent'

export type ConsentState = {
  analytics: boolean
  marketing: boolean
}

export function getConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'analytics' in parsed &&
      'marketing' in parsed
    ) {
      return parsed as ConsentState
    }
    return null
  } catch {
    return null
  }
}

export function setConsent(state: ConsentState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function hasConsent(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) !== null
}
