/**
 * Datei: app/admin/tags/neu/page.tsx
 *
 * Zweck: Formularseite zum Erstellen einer neuen Tag-Gruppe mit Tags.
 */

import TagGroupForm from '@/components/admin/TagGroupForm'
import { createTagGroup } from '../actions'

export default function NeuTagGroupPage() {
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
          Neue Tag-Gruppe
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Lege eine Gruppe an und füge Tags hinzu (ein Tag pro Zeile).
        </p>
      </div>

      <TagGroupForm action={createTagGroup} />
    </div>
  )
}
