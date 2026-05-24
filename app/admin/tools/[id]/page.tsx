/**
 * Datei: app/admin/tools/[id]/page.tsx
 *
 * Zweck: Admin-Seite zum Bearbeiten eines bestehenden Tools.
 * Lädt das Tool (inkl. deutscher Übersetzung und Kategoriezuordnungen) aus der DB
 * und übergibt die Daten als defaultValues an ToolForm.
 *
 * Design-Referenz:
 * - design-refs/2_Tool_Detailseite.png
 *
 * Wichtig:
 * - updateTool benötigt die Tool-ID als erstes Argument.
 *   Sie wird per .bind(null, id) vorgefüllt, bevor sie an ToolForm übergeben wird.
 */

import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ToolForm from '@/components/admin/ToolForm'
import { updateTool } from '@/app/admin/tools/actions'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditToolPage({ params }: Props) {
  const { id } = await params

  const [tool, vendors, categories] = await Promise.all([
    prisma.tool.findUnique({
      where: { id },
      include: {
        translations: { where: { locale: 'de' } },
        categories: true,
      },
    }),
    prisma.vendor.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.category.findMany({
      include: { translations: { where: { locale: 'de' } } },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  if (!tool) notFound()

  const translation = tool.translations[0]

  const defaultValues = {
    name: translation?.name ?? '',
    slug: tool.slug,
    vendorId: tool.vendorId,
    shortDescription: translation?.shortDescription ?? '',
    longDescription: translation?.longDescription ?? null,
    startingPriceMonthly: tool.startingPriceMonthly ?? null,
    hasFreePlan: tool.hasFreePlan,
    isAffiliate: tool.isAffiliate,
    published: tool.published,
    categoryIds: tool.categories.map(c => c.categoryId),
    features: translation?.features ?? [],
    strengths: translation?.strengths ?? [],
    weaknesses: translation?.weaknesses ?? [],
    bestFor: translation?.bestFor ?? [],
    notIdealFor: translation?.notIdealFor ?? [],
  }

  const vendorOptions = vendors.map(v => ({ id: v.id, name: v.name }))
  const categoryOptions = categories.map(cat => ({
    id: cat.id,
    name: cat.translations[0]?.name ?? cat.slug,
  }))

  // Die Tool-ID wird vorab eingebunden, damit ToolForm die generische Signatur
  // (prev, formData) => Promise<ActionState> erhält
  const boundUpdateTool = updateTool.bind(null, id)

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
          {defaultValues.name || tool.slug} bearbeiten
        </h1>
        <p style={{
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
          marginTop: '4px',
          fontFamily: 'monospace',
        }}>
          ID: {id}
        </p>
      </div>

      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '32px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <ToolForm
          action={boundUpdateTool}
          vendors={vendorOptions}
          categories={categoryOptions}
          defaultValues={defaultValues}
        />
      </div>
    </div>
  )
}
