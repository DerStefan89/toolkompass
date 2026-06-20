/**
 * Datei: app/admin/vergleiche/[id]/page.tsx
 *
 * Zweck: Formularseite zum Bearbeiten eines bestehenden Vergleichs.
 * Lädt den Vergleich (inkl. Rows und Tool-Daten) sowie alle Tools für die Dropdowns.
 *
 * Wichtig:
 * - updateVergleich benötigt die Comparison-ID als erstes Argument.
 *   Sie wird per .bind(null, id) vorgefüllt.
 * - Rows werden per deleteMany + create atomisch ersetzt (onDelete: Cascade).
 */

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import VergleichForm from '@/components/admin/VergleichForm'
import DeleteButton from '@/components/admin/DeleteButton'
import { updateVergleich, deleteVergleich } from '../actions'
import type { VergleichFormDefaults } from '@/components/admin/VergleichForm'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditVergleichPage({ params }: Props) {
  const { id } = await params

  const [vergleich, allTools] = await Promise.all([
    prisma.comparison.findUnique({
      where: { id },
      include: {
        toolA: { include: { translations: { where: { locale: 'de' } } } },
        toolB: { include: { translations: { where: { locale: 'de' } } } },
        rows: { orderBy: { sortOrder: 'asc' } },
        sections: { orderBy: { sortOrder: 'asc' } },
        features: { orderBy: { sortOrder: 'asc' } },
        alternatives: {
          orderBy: { sortOrder: 'asc' },
          include: { tool: { include: { translations: { where: { locale: 'de' } } } } },
        },
      },
    }),
    prisma.tool.findMany({
      include: { translations: { where: { locale: 'de' } } },
      orderBy: { slug: 'asc' },
    }),
  ])

  if (!vergleich) notFound()

  const toolOptions = allTools.map(t => ({
    id:   t.id,
    name: t.translations[0]?.name ?? t.slug,
    slug: t.slug,
  }))

  // JSON-Felder typisiert durchreichen (Prisma.JsonValue → erwartete Form)
  const dgRaw = vergleich.decisionGuide as unknown as
    { toolA?: string[]; toolB?: string[]; alternatives?: string[] } | null
  const tgRaw = vergleich.targetGroups as unknown as
    { toolA?: string[]; toolB?: string[] } | null

  const defaultValues: VergleichFormDefaults = {
    toolAId:   vergleich.toolAId,
    toolBId:   vergleich.toolBId,
    slug:      vergleich.slug,
    verdict:   vergleich.verdict,
    published: vergleich.published,
    rows: vergleich.rows.map(r => ({
      criterion:  r.criterion,
      toolAValue: r.toolAValue,
      toolBValue: r.toolBValue,
    })),
    title:         vergleich.title,
    subtitle:      vergleich.subtitle,
    keyDifference: vergleich.keyDifference,
    decisionGuide: dgRaw
      ? { toolA: dgRaw.toolA ?? [], toolB: dgRaw.toolB ?? [], alternatives: dgRaw.alternatives ?? [] }
      : null,
    targetGroups: tgRaw
      ? { toolA: tgRaw.toolA ?? [], toolB: tgRaw.toolB ?? [] }
      : null,
    sections: vergleich.sections.map(s => ({ heading: s.heading, content: s.content })),
    features: vergleich.features.map(f => ({
      feature:    f.feature,
      toolAValue: f.toolAValue,
      toolBValue: f.toolBValue,
    })),
    alternatives: vergleich.alternatives.map(a => ({ toolId: a.toolId, reason: a.reason })),
    faqItems: (vergleich.faqItems as unknown as Array<{ question: string; answer: string }> | null) ?? [],
  }

  const nameA = vergleich.toolA.translations[0]?.name ?? vergleich.toolA.slug
  const nameB = vergleich.toolB.translations[0]?.name ?? vergleich.toolB.slug

  const boundUpdate = updateVergleich.bind(null, id)
  const boundDelete = deleteVergleich.bind(null, id)

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <Link
          href="/admin/vergleiche"
          style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}
        >
          ← Zurück zur Vergleichsliste
        </Link>
        <h1 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'var(--color-text-primary)',
          marginTop: '8px',
        }}>
          {nameA} vs. {nameB}
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
        <VergleichForm
          action={boundUpdate}
          tools={toolOptions}
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
            Vergleich löschen
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Löscht den Vergleich dauerhaft inkl. aller Vergleichszeilen. Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
        </div>
        <DeleteButton
          action={boundDelete}
          confirmMessage={`"${nameA} vs. ${nameB}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
          redirectTo="/admin/vergleiche"
        />
      </div>
    </div>
  )
}
