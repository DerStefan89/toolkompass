/**
 * Datei: app/tools/[slug]/page.tsx
 *
 * Zweck: Tool-Detailseite — lädt echte Daten aus Prisma.
 *
 * Design-Referenz:
 * - design-refs/2_Tool_Detailseite.png
 *
 * Wichtig:
 * Erlaubte Inline-Styles: backgroundColor + border auf .toolLogoWrap und .altLogo
 * (conditional auf logoUrl — Laufzeitwert).
 */

import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { getToolBySlug } from '@/lib/data/tools'
import { isToolInUserStack } from '@/lib/data/user-tools'
import { getToolRatingSummary } from '@/lib/data/ratings'
import { formatPreis } from '@/lib/utils/format'
import { toolJsonLd, breadcrumbJsonLd } from '@/lib/seo/json-ld'
import PricingSection from '@/components/tools/PricingSection'
import RatingSummary from '@/components/rating/RatingSummary'
import UseToolButton from '@/components/tools/UseToolButton'
import type { FaqItem } from '@/components/admin/FaqEditor'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import styles from './page.module.css'

const SITE_URL = 'https://toolsucher.de'

// Rendert Markdown (fett/kursiv/unterstrichen) aus dem Admin-Formular inline,
// ohne den Block-Wrapper <p>, den react-markdown standardmäßig erzeugt —
// der würde in Listen-Items und neben Icons zu ungültigem verschachteltem
// HTML und gebrochenem Inline-Layout führen.
//
// rehypeRaw erlaubt rohes HTML (für <u>…</u>, da Markdown kein natives
// Underline kennt). Das ist hier unbedenklich, weil der Inhalt ausschließlich
// aus dem eigenen Admin-Bereich stammt — kein nutzergenerierter Content.
function InlineMarkdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      components={{ p: ({ children }) => <>{children}</> }}
    >
      {text}
    </ReactMarkdown>
  )
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tool = await getToolBySlug(slug)
  if (!tool) return {}
  const t = tool.translations[0]
  if (!t) return {}
  const title = `${t.name} — ToolSucher`
  const description = t.shortDescription
  return {
    title,
    description,
    alternates: { canonical: `/tools/${slug}` },
    openGraph: { title, description },
    twitter: { card: 'summary_large_image', title, description },
  }
}


export default async function ToolDetailSeite({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const tool = await getToolBySlug(slug)

  if (!tool || !tool.published) notFound()

  const t = tool.translations[0]
  if (!t) notFound()

  // Optional-Auth: Gäste sehen die Seite normal, Eingeloggte zusätzlich den
  // Stack-Status. Kein Redirect — nur ein leichter Zusatz-DB-Call (force-dynamic).
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let isLoggedIn = false
  let initialInStack = false
  if (user) {
    isLoggedIn = true
    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: { id: true },
    })
    if (dbUser) {
      initialInStack = await isToolInUserStack(dbUser.id, tool.id)
    }
  }

  // Plan & Preisdetails: eigenes Feld — Fallback auf features, solange ältere
  // Tools noch kein planFeatures gepflegt haben.
  const planFeatures = t.planFeatures.length > 0 ? t.planFeatures : t.features

  const primaryLink = tool.affiliateLinks[0]
  // Tracking-URL wenn Affiliate-Link vorhanden, sonst Vendor-Website als Fallback
  const primaryUrl = primaryLink
    ? `/api/track/${primaryLink.id}`
    : (tool.vendor.website ?? '#')
  const categoryNames = tool.categories
    .map((tc) => tc.category.translations[0]?.name)
    .filter(Boolean)
    .join(' · ')

  const preisFormatted = formatPreis(tool.startingPriceCents, { hasFreePlan: tool.hasFreePlan })

  const alternatives = await prisma.tool.findMany({
    where: {
      categories: { some: { categoryId: tool.categories[0]?.categoryId } },
      slug: { not: slug },
      published: true,
    },
    take: 3,
    select: {
      slug: true,
      logoUrl: true,
      translations: {
        where: { locale: 'de' },
        select: { name: true, shortDescription: true },
      },
    },
  })

  const tabs = ['Überblick', 'Funktionen', 'Preise', 'Vergleich', 'Alternativen', 'FAQ']

  // Freigegebene Bewertungen (Durchschnitte + Kommentare) — separate Query
  const ratingSummary = await getToolRatingSummary(tool.id)

  const jsonLd = toolJsonLd({
    name: t.name,
    description: t.shortDescription,
    url: `${SITE_URL}/tools/${tool.slug}`,
    logoUrl: tool.logoUrl,
    startingPriceCents: tool.startingPriceCents,
    hasFreePlan: tool.hasFreePlan,
    // aggregateRating nur wenn mindestens eine freigegebene Bewertung existiert
    ...(ratingSummary.count >= 1 && ratingSummary.averageOverall !== null
      ? { rating: { average: ratingSummary.averageOverall, count: ratingSummary.count } }
      : {}),
  }, SITE_URL)

  const crumbLd = breadcrumbJsonLd([
    { name: 'Startseite', url: SITE_URL },
    { name: categoryNames || 'Tools', url: `${SITE_URL}/kategorien` },
    { name: t.name, url: `${SITE_URL}/tools/${tool.slug}` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: crumbLd }} />
      <main className={styles.main}>

      {/* Breadcrumb */}
      <p className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Startseite</Link>
        {' › '}
        <Link href="/kategorien" className={styles.breadcrumbLink}>
          {categoryNames || 'Tools'}
        </Link>
        {' › '}
        {t.name}
      </p>

      {/* ─── HERO: 2 Spalten → Mobile: einspaltig ────────────── */}
      <div className={styles.heroGrid}>

        {/* Spalte 1: Tool-Info */}
        <div>
          <div className={styles.toolLogoRow}>
            {/* backgroundColor + border: conditional auf logoUrl — erlaubte Inline-Styles */}
            <div
              className={styles.toolLogoWrap}
              style={{
                backgroundColor: tool.logoUrl ? 'transparent' : 'var(--color-cta)',
                border: tool.logoUrl ? '1px solid var(--color-border)' : 'none',
              }}
            >
              {tool.logoUrl ? (
                <Image src={tool.logoUrl} alt={t.name} width={64} height={64} className={styles.toolLogoImg} />
              ) : (
                <span className={styles.toolLogoInitial}>
                  {t.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className={styles.toolName}>{t.name}</h1>
              <p className={styles.toolCategory}>{categoryNames}</p>
              {tool.published && (
                <span className={styles.verifiedBadge}>✓ Verifiziertes Tool</span>
              )}
            </div>
          </div>

          <p className={styles.toolDesc}><InlineMarkdown text={t.shortDescription} /></p>

          {/* Badges */}
          <div className={styles.badgeRow}>
            {tool.hasFreePlan && (
              <span className={styles.badge}>✓ Free Plan</span>
            )}
            {tool.tags.map(({ tag }) => (
              <span key={tag.id} className={styles.badge}>{tag.name}</span>
            ))}
          </div>

          {/* Buttons */}
          <div className={styles.actionRow}>
            <a href={primaryUrl} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
              Zum Anbieter ↗
            </a>
            <Link href="/vergleichen" className={styles.btnSecondary}>
              Vergleichen
            </Link>
            <UseToolButton
              toolId={tool.id}
              slug={tool.slug}
              initialInStack={initialInStack}
              isLoggedIn={isLoggedIn}
            />
            <Link href={`/tools/${tool.slug}/bewerten`} className={styles.btnSecondary}>
              Tool bewerten
            </Link>
            {tool.isAffiliate && (
              <span className={styles.affiliateBadge}>Partnerlink</span>
            )}
          </div>
        </div>

        {/* Spalte 2: Preisbox — sticky auf Mobile */}
        <div className={styles.priceBox}>
          <div className={styles.priceBoxHeader}>
            <span className={styles.priceBoxTitle}>Plan & Preisdetails</span>
            {tool.hasFreePlan && (
              <span className={styles.freePlanBadge}>Kostenlos</span>
            )}
          </div>

          <p className={styles.priceAmount}>{preisFormatted}</p>
          <p className={styles.priceNote}>pro Monat (Einstiegspreis)</p>

          {planFeatures.slice(0, 4).map((feature) => (
            <div key={feature} className={styles.priceFeatureItem}>
              <span className={styles.priceFeatureCheck}>✓</span>
              <InlineMarkdown text={feature} />
            </div>
          ))}

          <a href={primaryUrl} target="_blank" rel="noopener noreferrer" className={styles.ctaBtn}>
            Zum Anbieter ↗
          </a>
          {tool.isAffiliate && (
            <p className={styles.affiliateNote}>
              Affiliate-Link · Für dich keine Mehrkosten
            </p>
          )}
        </div>

      </div>

      {/* ─── TABS ────────────────────────────────────────────── */}
      <div className={styles.tabBar}>
        {tabs.map((tab, index) => (
          <a
            key={tab}
            href="#"
            className={`${styles.tab}${index === 0 ? ` ${styles.tabActive}` : ''}`}
          >
            {tab}
          </a>
        ))}
      </div>

      {/* ─── ÜBERBLICK ───────────────────────────────────────── */}
      <div className={styles.overviewSection}>

        {/* Kurzfazit — full-width */}
        <h2 className={styles.sectionTitle}>Kurzfazit</h2>
        <p className={styles.longDesc}><InlineMarkdown text={t.longDescription ?? t.shortDescription} /></p>

        {/* Stärken / Schwächen */}
        <div className={styles.swGrid}>
          <div>
            <p className={styles.swLabel}>Stärken</p>
            {t.strengths.map((s) => (
              <div key={s} className={styles.swItem}>
                <span className={styles.swCheck}>✓</span><InlineMarkdown text={s} />
              </div>
            ))}
          </div>
          <div>
            <p className={styles.swLabelWeak}>Schwächen</p>
            {t.weaknesses.map((s) => (
              <div key={s} className={styles.swItem}>
                <span className={styles.swCross}>✗</span><InlineMarkdown text={s} />
              </div>
            ))}
          </div>
        </div>

        {/* Preise & Tarife — nur wenn PricingPlans gepflegt sind (sonst bleibt
            die Einstiegspreis-Anzeige im Hero die einzige Preisangabe) */}
        {tool.pricingPlans.length > 0 && (
          <PricingSection plans={tool.pricingPlans} toolName={t.name} />
        )}

        {/* Für wen geeignet / nicht geeignet — zwei Boxen nebeneinander */}
        <div className={styles.fitGrid}>
          <div className={styles.fitBox}>
            <h2 className={styles.sectionTitleSpaced}>Für wen geeignet?</h2>
            {t.bestFor.map((gruppe) => (
              <div key={gruppe} className={styles.bestForItem}>
                <span className={styles.bestForCheck}>✓</span>
                <span className={styles.bestForLabel}><InlineMarkdown text={gruppe} /></span>
              </div>
            ))}
          </div>
          <div className={styles.fitBox}>
            <h2 className={styles.sectionTitleSpaced}>Für wen eher nicht geeignet?</h2>
            {t.notIdealFor.map((n) => (
              <div key={n} className={styles.notIdealItem}>
                <span className={styles.notIdealCross}>✗</span><InlineMarkdown text={n} />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─── FUNKTIONEN ──────────────────────────────────────── */}
      <div className={styles.featuresSection}>
        <div className={styles.featuresHeader}>
          <h2 className={styles.sectionTitle}>Funktionen</h2>
        </div>
        <div className={styles.featuresGrid}>
          {t.features.map((feature) => (
            <div key={feature} className={styles.featureCard}>
              <div className={styles.featureIcon}>✓</div>
              <p className={styles.featureLabel}><InlineMarkdown text={feature} /></p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── BEWERTUNGEN ─────────────────────────────────────── */}
      <RatingSummary summary={ratingSummary} slug={tool.slug} />

      {/* ─── ALTERNATIVEN ────────────────────────────────────── */}
      {alternatives.length > 0 && (
        <div className={styles.altSection}>
          <h2 className={styles.sectionTitle}>Alternativen</h2>
          <div className={styles.altGrid}>
            {alternatives.map((alt) => {
              const altT = alt.translations[0]
              if (!altT) return null
              return (
                <Link key={alt.slug} href={`/tools/${alt.slug}`} className={styles.altCard}>
                  {/* backgroundColor + border: conditional auf alt.logoUrl — erlaubte Inline-Styles */}
                  <div
                    className={styles.altLogo}
                    style={{
                      backgroundColor: alt.logoUrl ? 'transparent' : 'var(--color-cta)',
                      border: alt.logoUrl ? '1px solid var(--color-border)' : 'none',
                    }}
                  >
                    {alt.logoUrl ? (
                      <Image src={alt.logoUrl} alt={altT.name} width={40} height={40} className={styles.altLogoImg} />
                    ) : (
                      <span className={styles.altLogoInitial}>{altT.name.charAt(0)}</span>
                    )}
                  </div>
                  <p className={styles.altName}>{altT.name}</p>
                  <p className={styles.altDesc}>{altT.shortDescription}</p>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ─── FAQ ─────────────────────────────────────────────── */}
      {(() => {
        const faqItems = (t.faqItems as FaqItem[] | null) ?? []
        const items: FaqItem[] = faqItems.length > 0
          ? faqItems
          : [{ question: 'Gibt es eine kostenlose Testversion?', answer: 'Viele Tools bieten eine kostenlose Testphase oder einen Free Plan an. Aktuelle Konditionen direkt beim Anbieter prüfen.' }]
        return (
          <div className={styles.faqSection}>
            <h2 className={styles.sectionTitle}>Häufige Fragen</h2>
            <ul className={styles.faqList}>
              {items.map((item, i) => (
                <li key={i} className={styles.faqItem}>
                  <p className={styles.faqQuestion}>{item.question}</p>
                  <p className={styles.faqAnswer}>{item.answer}</p>
                </li>
              ))}
            </ul>
          </div>
        )
      })()}

      {/* ─── PREISE ──────────────────────────────────────────── */}
      <div className={styles.priceSection}>
        <h2 className={styles.priceSectionTitle}>Preise</h2>
        <p className={styles.priceSectionDesc}>
          {tool.startingPriceCents != null
            ? <>Einstieg ab {preisFormatted} / Monat.{tool.hasFreePlan ? ' Kostenloser Plan verfügbar.' : ''}</>
            : <>{preisFormatted}.</>
          }
          {' '}Aktuelle Preise und Tarife direkt beim Anbieter prüfen.
        </p>
        <a href={primaryUrl} target="_blank" rel="noopener noreferrer" className={styles.priceSectionCta}>
          Alle Preispläne ansehen ↗
        </a>
      </div>

    </main>
    </>
  )
}
