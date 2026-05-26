/**
 * Datei: app/kategorien/page.tsx
 *
 * Zweck: Übersicht aller publizierten Kategorien — lädt echte Daten aus Prisma.
 * Zeigt Tool-Anzahl und die ersten 3 Tool-Namen pro Kategorie.
 *
 * Design-Referenz:
 * - design-refs/4_Alle_Kategorien.png
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import IconRenderer from '@/components/ui/IconRenderer'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Alle Kategorien — ToolSucher',
  description: 'Entdecke digitale Business-Tools nach Kategorie: Buchhaltung, CRM, Projektmanagement und mehr.',
  openGraph: {
    title: 'Alle Kategorien — ToolSucher',
    description: 'Entdecke digitale Business-Tools nach Kategorie: Buchhaltung, CRM, Projektmanagement und mehr.',
  },
}

export default async function KategorienSeite() {
  const categories = await prisma.category.findMany({
    where: { published: true },
    include: {
      translations: { where: { locale: 'de' } },
      _count: { select: { tools: true } },
      tools: {
        where: { tool: { published: true } },
        include: {
          tool: { include: { translations: { where: { locale: 'de' } } } },
        },
        take: 3,
      },
    },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
        <Link href="/" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none' }}>Startseite</Link>
        {' › '}
        Kategorien
      </p>

      {/* Seitentitel */}
      <h1 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '40px',
        fontWeight: '700',
        color: 'var(--color-text-primary)',
        marginBottom: '12px',
      }}>
        Alle Tool-Kategorien
      </h1>

      <p style={{
        fontSize: '16px',
        color: 'var(--color-text-secondary)',
        marginBottom: '32px',
        lineHeight: '1.6',
      }}>
        Entdecke Tools nach Bereich und finde passende Software für deine Aufgaben —
        kuratiert für Solo-Selbstständige und kleine Teams in Deutschland.
      </p>

      {/* Suchfeld */}
      <input
        type="text"
        placeholder="Kategorie oder Aufgabe suchen ..."
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-btn)',
          border: '1px solid var(--color-border)',
          fontSize: '14px',
          backgroundColor: 'white',
          marginBottom: '32px',
        }}
      />

      {/* Kategorien-Raster */}
      {categories.length === 0 ? (
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Noch keine Kategorien vorhanden.
        </p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
        }}>
          {categories.map((cat) => {
            const t = cat.translations[0]
            if (!t) return null

            const toolNames = cat.tools
              .map((tc) => tc.tool.translations[0]?.name ?? tc.tool.slug)
              .join(' · ')

            return (
              <a
                key={cat.id}
                href={`/kategorien/${cat.slug}`}
                className="category-card"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-card)',
                  padding: '20px',
                  textDecoration: 'none',
                  color: 'var(--color-text-primary)',
                  display: 'block',
                }}
              >
                {/* Icon */}
                <div className="category-card-icon" style={{ marginBottom: '12px', color: 'var(--color-cta)' }}>
                  <IconRenderer icon={cat.icon} size={28} />
                </div>

                {/* Name */}
                <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '8px', lineHeight: '1.3' }}>
                  {t.name}
                </p>

                {/* Beschreibung */}
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px', lineHeight: '1.5' }}>
                  {t.description}
                </p>

                {/* Beispiel-Tools */}
                {toolNames && (
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                    {toolNames}
                  </p>
                )}

                {/* Anzahl Tools + Pfeil */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {cat._count.tools} Tools
                  </span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>→</span>
                </div>
              </a>
            )
          })}
        </div>
      )}

    </main>
  )
}
