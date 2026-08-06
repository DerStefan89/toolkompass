import { describe, expect, it } from 'vitest'
import { formatPreis } from './format'

describe('formatPreis', () => {
  it('formatiert Cent als deutsches Euro-Format', () => {
    expect(formatPreis(990)).toBe('9,90 €')
  })

  it('stellt prefix voran', () => {
    expect(formatPreis(990, { prefix: 'ab' })).toBe('ab 9,90 €')
  })

  it('kombiniert prefix und suffix', () => {
    expect(formatPreis(990, { prefix: 'ab', suffix: '/ Monat' })).toBe('ab 9,90 € / Monat')
  })

  it('gibt "Kostenlos" für null mit hasFreePlan zurück', () => {
    expect(formatPreis(null, { hasFreePlan: true })).toBe('Kostenlos')
  })

  it('gibt "Auf Anfrage" für null ohne hasFreePlan zurück', () => {
    expect(formatPreis(null, { hasFreePlan: false })).toBe('Auf Anfrage')
  })

  it('gibt "Kostenlos" für 0 Cent zurück', () => {
    expect(formatPreis(0)).toBe('Kostenlos')
  })
})
