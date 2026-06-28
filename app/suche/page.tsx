/**
 * Datei: app/suche/page.tsx
 *
 * Zweck: Suchergebnis-Seite — liest q aus searchParams, sucht in DB,
 *        zeigt Tool-Cards im gleichen Layout wie Kategorie-Detailseite.
 *
 * Design-Referenz:
 * - design-refs/4_Alle_Kategorien.png
 *
 * Wichtig:
 * force-dynamic — kein Caching, da Ergebnis von Query-Parameter abhängt.
 * take + skip immer gemeinsam (ARCHITECTURE.md).
 */

import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatPreis } from '@/lib/utils/format'
import SearchInput from '@/components/SearchInput'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}): Promise<Metadata> {
  const { q } = await searchParams
  const title = q
    ? `Ergebnisse für „${q}" | ToolSucher`
    : 'Suche | ToolSucher'
  return {
    title,
    description: 'Tools, Kategorien und Aufgaben suchen. Finde passende Software für Buchhaltung, KI, CRM, Design und mehr.',
    robots: { index: false },
  }
}

export default async function SuchSeite({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q?.trim() ?? '').slice(0, 100)

  const tools = query
    ? await prisma.tool.findMany({
        where: {
          published: true,
          OR: [
            { translations: { some: { locale: 'de', name: { contains: query, mode: 'insensitive' } } } },
            { translations: { some: { locale: 'de', shortDescription: { contains: query, mode: 'insensitive' } } } },
            { categories: { some: { category: { translations: { some: { locale: 'de', name: { contains: query, mode: 'insensitive' } } } } } } },
          ],
        },
        include: {
          translations: { where: { locale: 'de' } },
          tags: { include: { tag: true } },
          affiliateLinks: {
            where: { isActive: true },
            orderBy: { isPrimary: 'desc' },
            take: 1,
            skip: 0,
          },
        },
        take: 20,
        skip: 0,
      })
    : []

  return (
    <main className={styles.main}>

      {/* Breadcrumb */}
      <p className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Startseite</Link>
        {' › '}
        Suche
      </p>

      {/* Titel */}
      <h1 className={styles.pageTitle}>
        {query ? `Ergebnisse für „${query}"` : 'Suche'}
      </h1>

      {/* Suchfeld — vorausgefüllt mit aktuellem Query */}
      <SearchInput
        className={styles.searchInput}
        wrapperClassName={styles.searchWrapper}
        placeholder="Nach Tool, Kategorie oder Anwendungsfall suchen ..."
        initialValue={query}
      />

      {/* Kein Query */}
      {!query && (
        <p className={styles.empty}>Gib ein Tool, eine Kategorie oder eine Aufgabe ein. Zum Beispiel Buchhaltung, KI, CRM oder Termine.</p>
      )}

      {/* Query vorhanden, aber keine Ergebnisse */}
      {query && tools.length === 0 && (
        <p className={styles.empty}>Für &bdquo;{query}&ldquo; wurde aktuell kein passendes Tool gefunden.</p>
      )}

      {/* Ergebnisse */}
      {tools.length > 0 && (
        <>
          <p className={styles.resultCount}>{tools.length} Tool{tools.length !== 1 ? 's' : ''} gefunden</p>
          <div className={styles.toolGrid}>
            {tools.map((tool) => {
              const tl = tool.translations[0]
              const name = tl?.name ?? tool.slug
              const preis = formatPreis(tool.startingPriceCents, {
                prefix: 'ab',
                suffix: '/ Monat',
                hasFreePlan: tool.hasFreePlan,
              })

              return (
                <div key={tool.id} className={styles.toolCard}>
                  <div className={styles.toolCardTop}>
                    {/* backgroundColor + border: conditional auf logoUrl — erlaubte Inline-Styles */}
                    <div
                      className={styles.toolLogoWrap}
                      style={{
                        backgroundColor: tool.logoUrl ? 'transparent' : 'var(--color-cta)',
                        border: tool.logoUrl ? '1px solid var(--color-border)' : 'none',
                      }}
                    >
                      {tool.logoUrl ? (
                        <Image
                          src={tool.logoUrl}
                          alt={name}
                          width={44}
                          height={44}
                          className={styles.toolLogoImg}
                        />
                      ) : (
                        <span className={styles.toolLogoInitial}>
                          {name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className={styles.toolName}>{name}</p>
                  <p className={styles.toolDesc}>{tl?.shortDescription}</p>

                  <div className={styles.toolBadges}>
                    {tool.hasFreePlan && (
                      <span className={styles.toolBadge}>Free Plan</span>
                    )}
                    {tool.tags.slice(0, 2).map(({ tag }) => (
                      <span key={tag.id} className={styles.toolBadge}>{tag.name}</span>
                    ))}
                  </div>

                  <p className={styles.toolPrice}>{preis}</p>

                  <a href={`/tools/${tool.slug}`} className={styles.toolDetailBtn}>
                    Details ansehen
                  </a>
                </div>
              )
            })}
          </div>
        </>
      )}

    </main>
  )
}
