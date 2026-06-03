/**
 * Datei: app/tool-stacks/[slug]/page.tsx
 *
 * Zweck: Dynamische Detailseite für einen Tool-Stack aus der Datenbank.
 *
 * Design-Referenz:
 * - design-refs/5_Tool_Stacks.png
 *
 * Wichtig:
 * ToolStack hat kein Farb-Feld — Logos erhalten Farben aus LOGO_FARBEN per Index.
 * ToolStackItem.note wird als "Wofür"-Zeile angezeigt (optional).
 * Gesamtkosten = Summe aller startingPriceCents der Stack-Tools.
 * Erlaubte Inline-Styles: backgroundColor auf .toolLogoWrap (farbe — Laufzeitwert).
 * gridTemplateColumns wurde auf statisch 3-col vereinfacht (war dynamisch n-col).
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPreis } from '@/lib/utils/format'
import styles from './page.module.css'

export const revalidate = 3600

export async function generateStaticParams() {
  const stacks = await prisma.toolStack.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return stacks.map((s) => ({ slug: s.slug }))
}

const LOGO_FARBEN = [
  'var(--color-cta)',
  '#c8a96e',
  '#2563eb',
  '#7c3aed',
  '#dc2626',
  '#0f172a',
] as const

export default async function ToolStackDetailSeite({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const stack = await prisma.toolStack.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale: 'de' } },
      tools: {
        orderBy: { sortOrder: 'asc' },
        include: {
          tool: {
            include: {
              translations: { where: { locale: 'de' } },
              categories: {
                include: {
                  category: { include: { translations: { where: { locale: 'de' } } } },
                },
              },
              tags: { include: { tag: true } },
            },
          },
        },
      },
      tags: { include: { tag: true } },
    },
  })

  if (!stack || !stack.published) notFound()

  const t = stack.translations[0]
  if (!t) notFound()

  const gesamtKosten = stack.tools.reduce(
    (sum, item) => sum + (item.tool.startingPriceCents ?? 0),
    0,
  )
  const preisGesamt = formatPreis(gesamtKosten, { prefix: 'ab' })

  return (
    <main className={styles.main}>

      {/* Breadcrumb */}
      <p className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Startseite</Link>
        {' › '}
        <Link href="/tool-stacks" className={styles.breadcrumbLink}>Tool-Stacks</Link>
        {' › '}
        {t.name}
      </p>

      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerBadge}>{t.targetAudience}</span>
        <h1 className={styles.headerTitle}>{t.name}</h1>
        {t.description && (
          <p className={styles.headerDesc}>{t.description}</p>
        )}
        <p className={styles.headerPrice}>
          Gesamtkosten:{' '}
          <strong className={styles.headerPriceValue}>{preisGesamt} / Monat</strong>
        </p>
      </div>

      {/* Tool-Karten */}
      <div className={styles.toolGrid}>
        {stack.tools.map((item, index) => {
          const tool = item.tool
          const tt = tool.translations[0]
          const farbe = LOGO_FARBEN[index % LOGO_FARBEN.length]
          const kuerzel = tt?.name.slice(0, 2).toUpperCase() ?? tool.slug.slice(0, 2).toUpperCase()
          const kategorie = tool.categories[0]?.category.translations[0]?.name ?? '—'
          const badges = tool.tags.map(({ tag }) => tag.name)
          const preis = formatPreis(tool.startingPriceCents, { prefix: 'ab', suffix: '/ Monat' })

          return (
            <div key={tool.id} className={styles.toolCard}>
              {/* Nummer */}
              <p className={styles.toolIndex}>
                {index + 1} / {stack.tools.length}
              </p>

              {/* Logo — backgroundColor: farbe ist Laufzeitwert (LOGO_FARBEN) */}
              <div
                className={styles.toolLogoWrap}
                style={{ backgroundColor: farbe }}
              >
                {kuerzel}
              </div>

              {/* Name + Kategorie */}
              <p className={styles.toolName}>{tt?.name ?? tool.slug}</p>
              <p className={styles.toolCategory}>{kategorie}</p>

              {/* Wofür (optional aus ToolStackItem.note) */}
              {item.note && (
                <p className={styles.toolNote}>{item.note}</p>
              )}

              {/* Beschreibung */}
              <p className={styles.toolDesc}>{tt?.shortDescription ?? ''}</p>

              {/* Preis */}
              <p className={badges.length > 0 ? styles.toolPriceWithBadges : styles.toolPrice}>
                {preis}
              </p>

              {/* Badges */}
              {badges.length > 0 && (
                <div className={styles.toolBadges}>
                  {badges.map((badge) => (
                    <span key={badge} className={styles.toolBadge}>{badge}</span>
                  ))}
                </div>
              )}

              {/* Button */}
              <a href={`/tools/${tool.slug}`} className={styles.toolBtn}>
                Details ansehen
              </a>
            </div>
          )
        })}
      </div>

      {/* CTA Box */}
      <div className={styles.ctaBox}>
        <div className={styles.ctaIcon}>🧭</div>
        <h2 className={styles.ctaTitle}>Alles in einem Account managen</h2>
        <p className={styles.ctaDesc}>
          Bald kannst du deinen Stack speichern, Kosten tracken, Kündigungsfristen im Blick behalten
          und alle deine Tools direkt von ToolSucher aus öffnen.
        </p>
        <div className={styles.ctaFeatures}>
          {[
            '✓ Stack speichern',
            '✓ Kosten tracken',
            '✓ Kündigungen erinnern',
            '✓ Alternativen entdecken',
            '✓ Tools direkt öffnen',
          ].map((feature) => (
            <span key={feature} className={styles.ctaFeatureItem}>{feature}</span>
          ))}
        </div>
        <div className={styles.ctaBtns}>
          <Link href="/einloggen" className={styles.ctaBtnPrimary}>
            🔔 Benachrichtigen lassen
          </Link>
          <Link href="/tool-stacks" className={styles.ctaBtnSecondary}>
            Andere Stacks ansehen
          </Link>
        </div>
      </div>

    </main>
  )
}
