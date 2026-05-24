/**
 * Datei: app/admin/tools/neu/page.tsx
 *
 * Zweck: Admin-Seite zum Erstellen eines neuen Tools.
 * Lädt Vendors und Kategorien aus der DB und rendert ToolForm im "create"-Modus.
 *
 * Design-Referenz:
 * - design-refs/2_Tool_Detailseite.png
 */

import { prisma } from '@/lib/prisma'
import ToolForm from '@/components/admin/ToolForm'
import { createTool } from '@/app/admin/tools/actions'

export default async function NewToolPage() {
  const [vendors, categories] = await Promise.all([
    prisma.vendor.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.category.findMany({
      include: { translations: { where: { locale: 'de' } } },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  const vendorOptions = vendors.map(v => ({ id: v.id, name: v.name }))
  const categoryOptions = categories.map(cat => ({
    id: cat.id,
    name: cat.translations[0]?.name ?? cat.slug,
  }))

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <a
          href="/admin/tools"
          style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
        >
          ← Zurück zur Tool-Liste
        </a>
        <h1 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginTop: '8px',
        }}>
          Neues Tool anlegen
        </h1>
      </div>

      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '32px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <ToolForm
          action={createTool}
          vendors={vendorOptions}
          categories={categoryOptions}
        />
      </div>
    </div>
  )
}
