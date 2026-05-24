/**
 * Datei: app/admin/artikel/neu/page.tsx
 *
 * Zweck: Formularseite zum Erstellen eines neuen Artikels im Admin-Bereich.
 * Delegiert alle Logik an ArtikelForm + createArtikel Server Action.
 */

import ArtikelForm from '@/components/admin/ArtikelForm'
import { createArtikel } from '../actions'

export default function NeuArtikelPage() {
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '24px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginBottom: '4px',
        }}>
          Neuer Artikel
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Erstelle einen neuen Guide, eine Top-Liste, einen Vergleich oder eine Anleitung.
        </p>
      </div>

      <ArtikelForm action={createArtikel} />
    </div>
  )
}
