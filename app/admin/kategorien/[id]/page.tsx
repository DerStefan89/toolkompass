/**
 * Datei: app/admin/kategorien/[id]/page.tsx
 *
 * Zweck: Admin-Seite zum Bearbeiten einer bestehenden Kategorie.
 * Lädt die Kategorie (inkl. deutscher Übersetzung) aus der DB
 * und übergibt die Daten als defaultValues an KategorieForm.
 *
 * Design-Referenz:
 * - design-refs/4_Alle_Kategorien.png
 *
 * Wichtig:
 * - updateKategorie benötigt die Kategorie-ID als erstes Argument.
 *   Sie wird per .bind(null, id) vorgefüllt, bevor sie an KategorieForm übergeben wird.
 */

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import KategorieForm from '@/components/admin/KategorieForm'
import DeleteButton from '@/components/admin/DeleteButton'
import { updateKategorie, deleteKategorie } from '@/app/admin/kategorien/actions'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditKategoriePage({ params }: Props) {
  const { id } = await params

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      translations: { where: { locale: 'de' } },
      _count: { select: { tools: true } },
    },
  })

  if (!category) notFound()

  const translation = category.translations[0]

  // Alle vorhandenen Werte als defaultValues für das Formular aufbereiten
  const defaultValues = {
    name:        translation?.name        ?? '',
    slug:        category.slug,
    description: translation?.description ?? '',
    icon:        category.icon            ?? '',
    sortOrder:   category.sortOrder,
    published:   category.published,
  }

  // updateKategorie erwartet die Kategorie-ID als erstes Argument;
  // .bind() bindet sie vor, damit ToolForm die generische Signatur erhält
  const boundUpdateKategorie = updateKategorie.bind(null, id)
  const boundDeleteKategorie = deleteKategorie.bind(null, id)

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <Link
          href="/admin/kategorien"
          style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
        >
          ← Zurück zur Kategorien-Liste
        </Link>
        <h1 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginTop: '8px',
        }}>
          {defaultValues.name || category.slug} bearbeiten
        </h1>

        {/* Zusatzinfo: wie viele Tools dieser Kategorie zugeordnet sind */}
        <p style={{
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          marginTop: '4px',
        }}>
          {category._count.tools} {category._count.tools === 1 ? 'Tool' : 'Tools'} zugeordnet
          <span style={{ marginLeft: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
            ID: {id}
          </span>
        </p>
      </div>

      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '32px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <KategorieForm
          action={boundUpdateKategorie}
          defaultValues={defaultValues}
        />
      </div>

      {/* Gefahrenzone */}
      <div style={{
        marginTop: '24px',
        padding: '20px 24px',
        border: '1px solid var(--color-error-border)',
        borderRadius: 'var(--radius-card)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div>
          <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
            Kategorie löschen
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Löscht die Kategorie dauerhaft. Tool-Zuordnungen werden entfernt, die Tools selbst bleiben erhalten.
          </p>
        </div>
        <DeleteButton
          action={boundDeleteKategorie}
          confirmMessage={`"${defaultValues.name}" wirklich löschen? Tool-Zuordnungen gehen verloren.`}
          redirectTo="/admin/kategorien"
        />
      </div>
    </div>
  )
}
