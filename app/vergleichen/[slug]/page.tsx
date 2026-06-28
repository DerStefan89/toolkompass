/**
 * Datei: app/vergleichen/[slug]/page.tsx
 *
 * Zweck: Vergleichs-Detailseite — lädt echte Daten aus Prisma.
 * Vergleichstabelle aus ComparisonRow, Stärken/Schwächen aus ToolTranslation.
 *
 * Design-Referenz:
 * - design-refs/3_Vergleichsseite.png
 *
 * Wichtig:
 * Tool-Farben sind nicht in der DB — A bekommt CTA-Farbe, B eine Kontrastfarbe.
 * Erlaubte Inline-Styles: backgroundColor auf Icon-Divs (tool.farbe — Laufzeitwert).
 */

import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { formatPreis } from '@/lib/utils/format'
import { comparisonJsonLd, breadcrumbJsonLd, faqPageJsonLd } from '@/lib/seo/json-ld'
import { SITE_URL } from '@/lib/config/site'
import InlineMarkdown from '@/components/ui/InlineMarkdown'
import styles from './page.module.css'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const comparison = await prisma.comparison.findUnique({
    where: { slug },
    include: {
      toolA: { include: { translations: { where: { locale: 'de' } } } },
      toolB: { include: { translations: { where: { locale: 'de' } } } },
    },
  })
  if (!comparison) return {}
  const nameA = comparison.toolA.translations[0]?.name ?? comparison.toolA.slug
  const nameB = comparison.toolB.translations[0]?.name ?? comparison.toolB.slug
  const title = comparison.title
    ? `${comparison.title} | ToolSucher`
    : `${nameA} vs ${nameB}: Vergleich | ToolSucher`
  const description = `${nameA} oder ${nameB}? Unterschiede, Preise und Entscheidungshilfen für Selbstständige und kleine Teams.`
  return {
    title,
    description,
    alternates: { canonical: `/vergleichen/${slug}` },
    openGraph: { title: `${nameA} vs ${nameB}: Was passt besser?`, description: `Direkter Vergleich: ${nameA} vs ${nameB}. Mit klaren Unterschieden und einer ehrlichen Einschätzung.` },
    twitter: { card: 'summary_large_image', title: `${nameA} vs ${nameB}: Was passt besser?`, description: `Direkter Vergleich: ${nameA} vs ${nameB}. Mit klaren Unterschieden und einer ehrlichen Einschätzung.` },
  }
}


const TOOL_FARBEN = ['var(--color-cta)', '#c8a96e'] as const

/** Funktionscheck-Zelle: "Ja" → grünes ✓, "Nein" → graues –, sonst gelber Punkt + Text. */
function FeatureValue({ value }: { value: string }) {
  const v = value.trim().toLowerCase()
  if (v === 'ja') return <span className={styles.featYes} aria-label="Ja">✓</span>
  if (v === 'nein') return <span className={styles.featNo} aria-label="Nein">–</span>
  return (
    <span className={styles.featPartial}>
      <span className={styles.featDot} aria-hidden="true" />
      {value}
    </span>
  )
}

/** Tool-Logo mit Initialen-Fallback. size bestimmt die Dimension (px). */
function ToolLogo({ logoUrl, name, kuerzel, farbe, size, className }: {
  logoUrl: string | null; name: string; kuerzel: string; farbe: string; size: number; className?: string
}) {
  if (logoUrl) {
    return <Image src={logoUrl} alt={name} width={size} height={size} className={className} style={{ borderRadius: '8px', objectFit: 'contain' }} />
  }
  return (
    <div className={className} style={{ backgroundColor: farbe, width: size, height: size, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.4, flexShrink: 0 }}>
      {kuerzel}
    </div>
  )
}

export default async function VergleichDetailSeite({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const comparison = await prisma.comparison.findUnique({
    where: { slug },
    include: {
      toolA: {
        include: {
          translations: { where: { locale: 'de' } },
          affiliateLinks: { where: { isActive: true }, orderBy: { isPrimary: 'desc' }, take: 1 },
          categories: {
            include: { category: { include: { translations: { where: { locale: 'de' } } } } },
            take: 1,
          },
        },
      },
      toolB: {
        include: {
          translations: { where: { locale: 'de' } },
          affiliateLinks: { where: { isActive: true }, orderBy: { isPrimary: 'desc' }, take: 1 },
        },
      },
      rows: { orderBy: { sortOrder: 'asc' } },
      sections: { orderBy: { sortOrder: 'asc' } },
      features: { orderBy: { sortOrder: 'asc' } },
      alternatives: {
        orderBy: { sortOrder: 'asc' },
        include: {
          tool: {
            include: {
              translations: { where: { locale: 'de' } },
              affiliateLinks: { where: { isActive: true, isPrimary: true }, take: 1 },
            },
          },
        },
      },
    },
  })

  if (!comparison || !comparison.published) notFound()

  const tA = comparison.toolA.translations[0]
  const tB = comparison.toolB.translations[0]
  if (!tA || !tB) notFound()

  const kategorieName = comparison.toolA.categories[0]?.category.translations[0]?.name ?? 'Tools'

  const tools = [
    {
      name: tA.name,
      kuerzel: tA.name.charAt(0).toUpperCase(),
      logoUrl: comparison.toolA.logoUrl,
      farbe: TOOL_FARBEN[0],
      preis: formatPreis(comparison.toolA.startingPriceCents, { prefix: 'ab', suffix: '/ Monat', hasFreePlan: comparison.toolA.hasFreePlan }),
      beschreibung: tA.shortDescription,
      vorteile: tA.strengths,
      nachteile: tA.weaknesses,
      passendeWenn: tA.bestFor,
      url: comparison.toolA.affiliateLinks[0]?.url ?? '#',
    },
    {
      name: tB.name,
      kuerzel: tB.name.charAt(0).toUpperCase(),
      logoUrl: comparison.toolB.logoUrl,
      farbe: TOOL_FARBEN[1],
      preis: formatPreis(comparison.toolB.startingPriceCents, { prefix: 'ab', suffix: '/ Monat', hasFreePlan: comparison.toolB.hasFreePlan }),
      beschreibung: tB.shortDescription,
      vorteile: tB.strengths,
      nachteile: tB.weaknesses,
      passendeWenn: tB.bestFor,
      url: comparison.toolB.affiliateLinks[0]?.url ?? '#',
    },
  ]

  const [toolA, toolB] = tools

  // ── V3: neue Artikel-Felder (alle optional) ──
  const decisionGuide = comparison.decisionGuide as unknown as
    { toolA?: string[]; toolB?: string[]; alternatives?: string[] } | null
  const targetGroups = comparison.targetGroups as unknown as
    { toolA?: string[]; toolB?: string[] } | null

  const dgA = decisionGuide?.toolA ?? []
  const dgB = decisionGuide?.toolB ?? []
  const dgAlt = decisionGuide?.alternatives ?? []
  const hasDecision = dgA.length + dgB.length + dgAlt.length > 0

  const tgA = targetGroups?.toolA ?? []
  const tgB = targetGroups?.toolB ?? []
  const hasTargetGroups = tgA.length + tgB.length > 0

  // Affiliate-Tracking: aktiver Primär-Link → /api/track/[id], sonst Tool-Detailseite
  const altLink = (alt: (typeof comparison.alternatives)[number]) => {
    const link = alt.tool.affiliateLinks[0]
    return link ? `/api/track/${link.id}` : `/tools/${alt.tool.slug}`
  }

  const jsonLd = comparisonJsonLd({
    slug: comparison.slug,
    verdict: comparison.verdict,
    updatedAt: comparison.updatedAt,
    toolAName: tA.name,
    toolBName: tB.name,
  }, SITE_URL)

  const crumbLd = breadcrumbJsonLd([
    { name: 'Startseite', url: SITE_URL },
    { name: 'Vergleichen', url: `${SITE_URL}/vergleichen` },
    { name: `${tA.name} vs ${tB.name}`, url: `${SITE_URL}/vergleichen/${comparison.slug}` },
  ])

  // FAQ (optional) — Plain Text; faqPageJsonLd nur bei echten Items für Rich Snippets
  const faqItems = (comparison.faqItems as unknown as { question: string; answer: string }[] | null) ?? []
  const faqLd = faqItems.length > 0 ? faqPageJsonLd(faqItems) : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: crumbLd }} />
      {faqLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqLd }} />
      )}
      <main className={styles.main}>

      {/* Breadcrumb */}
      <p className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Startseite</Link>
        {' › '}
        <Link href="/vergleichen" className={styles.breadcrumbLink}>Vergleichen</Link>
        {' › '}
        {toolA.name} vs {toolB.name}
      </p>

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <div className={styles.heroRow}>
        <div className={styles.heroLeft}>
          <h1 className={styles.heroTitle}>
            {comparison.title ?? `${toolA.name} vs ${toolB.name}`}
          </h1>
          <p className={styles.heroDesc}>
            {comparison.subtitle ??
              `${kategorieName}-Tools im Vergleich: Welche Lösung passt besser zu Selbstständigen, Freelancern und kleinen Teams?`}
          </p>
        </div>

        {/* vs-Box: Mobile ausgeblendet */}
        <div className={styles.heroVsBox}>
          <ToolLogo logoUrl={toolA.logoUrl} name={toolA.name} kuerzel={toolA.kuerzel} farbe={toolA.farbe} size={48} />
          <span className={styles.vsLabel}>vs</span>
          <ToolLogo logoUrl={toolB.logoUrl} name={toolB.name} kuerzel={toolB.kuerzel} farbe={toolB.farbe} size={48} />
          <div>
            <p className={styles.vsKategorie}>{kategorieName}</p>
          </div>
        </div>
      </div>

      {/* ─── UNSER URTEIL ─────────────────────────────────────── */}
      <div className={styles.verdictCard}>
        <h2 className={styles.verdictTitle}>Unser Urteil kurz gesagt</h2>
        <p className={styles.verdictText}>{comparison.verdict}</p>

        {/* CTA-Buttons: untereinander Mobile, nebeneinander Desktop */}
        <div className={styles.ctaRow}>
          <a href={toolA.url} target="_blank" rel="noopener noreferrer" className={styles.btnPrimary}>
            {toolA.name} ansehen
          </a>
          <a href={toolB.url} target="_blank" rel="noopener noreferrer" className={styles.btnSecondary}>
            {toolB.name} ansehen
          </a>
          <span className={styles.affiliateNote}>Affiliate-Link · Für dich keine Mehrkosten</span>
        </div>
      </div>

      {/* ─── SCHNELLE ENTSCHEIDUNG ────────────────────────────── */}
      {hasDecision && (
        <div className={styles.decisionCards}>
          {dgA.length > 0 && (
            <div className={`${styles.decisionCard} ${styles.decisionCardA}`}>
              <p className={styles.decisionCardTitle}>Nimm {toolA.name}, wenn …</p>
              <ul className={styles.decisionList}>
                {dgA.map((p) => (
                  <li key={p} className={styles.decisionItem}><span className={styles.decisionCheck}>✓</span>{p}</li>
                ))}
              </ul>
            </div>
          )}
          {dgB.length > 0 && (
            <div className={`${styles.decisionCard} ${styles.decisionCardB}`}>
              <p className={styles.decisionCardTitle}>Nimm {toolB.name}, wenn …</p>
              <ul className={styles.decisionList}>
                {dgB.map((p) => (
                  <li key={p} className={styles.decisionItem}><span className={styles.decisionCheck}>✓</span>{p}</li>
                ))}
              </ul>
            </div>
          )}
          {dgAlt.length > 0 && (
            <div className={`${styles.decisionCard} ${styles.decisionCardAlt}`}>
              <p className={styles.decisionCardTitle}>Schau dir Alternativen an, wenn …</p>
              <ul className={styles.decisionList}>
                {dgAlt.map((p) => (
                  <li key={p} className={styles.decisionItem}><span className={styles.decisionCheck}>✓</span>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ─── DER WICHTIGSTE UNTERSCHIED ────────────────────────── */}
      {comparison.keyDifference && (
        <div className={styles.keyDiffCallout}>
          <p className={styles.keyDiffLabel}>Der wichtigste Unterschied</p>
          <p className={styles.keyDiffText}>{comparison.keyDifference}</p>
        </div>
      )}

      {/* ─── WELCHES TOOL PASST BESSER? ───────────────────────── */}
      <h2 className={styles.sectionTitle}>Für wen ist welches Tool besser geeignet?</h2>
      <div className={styles.twoColGrid}>
        {tools.map((tool) => (
          <div key={tool.name} className={styles.fitCard}>
            <div className={styles.fitCardHeader}>
              <ToolLogo logoUrl={tool.logoUrl} name={tool.name} kuerzel={tool.kuerzel} farbe={tool.farbe} size={36} />
              <p className={styles.fitCardTitle}>{tool.name} passt besser, wenn du ...</p>
            </div>
            {tool.passendeWenn.map((punkt) => (
              <div key={punkt} className={styles.fitItem}>
                <span className={styles.fitCheck}>✓</span>{punkt}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ─── DIREKTVERGLEICH TABELLE ──────────────────────────── */}
      <h2 className={styles.sectionTitle}>Funktionen im Vergleich</h2>
      <div className={styles.tableSection}>
        {/* overflow-x: auto — horizontale Scrollbar auf Mobile */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeadRow}>
                <th className={styles.thLabel}>Kriterium</th>
                <th className={styles.thTool}>{toolA.name}</th>
                <th className={styles.thToolLast}>{toolB.name}</th>
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((zeile) => (
                <tr key={zeile.id} className={styles.tableRow}>
                  <td className={styles.tdLabel}>{zeile.criterion}</td>
                  <td className={styles.tdA}>{zeile.toolAValue}</td>
                  <td className={styles.tdB}>{zeile.toolBValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.tableNote}>
          Preise und Funktionen können sich ändern. Prüfe die aktuellen Angaben auf der Website des Anbieters.
        </p>
      </div>

      {/* ─── FUNKTIONSCHECK ───────────────────────────────────── */}
      {comparison.features.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>Funktionscheck</h2>
          <div className={styles.tableSection}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.tableHeadRow}>
                    <th className={styles.thLabel}>Funktion</th>
                    <th className={styles.thTool}>{toolA.name}</th>
                    <th className={styles.thToolLast}>{toolB.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.features.map((f) => (
                    <tr key={f.id} className={styles.tableRow}>
                      <td className={styles.tdLabel}>{f.feature}</td>
                      <td className={styles.tdA}><FeatureValue value={f.toolAValue} /></td>
                      <td className={styles.tdB}><FeatureValue value={f.toolBValue} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ─── PREISE ───────────────────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Preise im Vergleich</h2>
      <div className={styles.twoColGrid}>
        {tools.map((tool) => (
          <div key={tool.name} className={styles.priceCard}>
            <div className={styles.priceCardLeft}>
              <ToolLogo logoUrl={tool.logoUrl} name={tool.name} kuerzel={tool.kuerzel} farbe={tool.farbe} size={28} />
              <div>
                <p className={styles.priceCardName}>{tool.name}</p>
                <p className={styles.priceCardAmount}>{tool.preis}</p>
                <p className={styles.priceCardDesc}>{tool.beschreibung}</p>
              </div>
            </div>
            <a href={tool.url} target="_blank" rel="noopener noreferrer" className={styles.vendorBtn}>
              Zum Anbieter
            </a>
          </div>
        ))}
      </div>
      <p className={styles.priceNote}>
        Preisangaben können sich ändern. Bitte prüfe die aktuellen Konditionen beim Anbieter.
      </p>

      {/* ─── VORTEILE & NACHTEILE ─────────────────────────────── */}
      <h2 className={styles.sectionTitle}>Vorteile und Nachteile</h2>
      <div className={styles.twoColGrid}>
        {tools.map((tool) => (
          <div key={tool.name} className={styles.prosConsCard}>
            <div className={styles.prosConsHeader}>
              <ToolLogo logoUrl={tool.logoUrl} name={tool.name} kuerzel={tool.kuerzel} farbe={tool.farbe} size={36} />
              <p className={styles.prosConsTitle}>{tool.name}</p>
            </div>
            <div className={styles.prosConsGrid}>
              <div>
                <p className={styles.prosConsLabel}>Vorteile</p>
                {tool.vorteile.map((v) => (
                  <div key={v} className={styles.prosConsItem}>
                    <span className={styles.proCheck}>✓</span>{v}
                  </div>
                ))}
              </div>
              <div>
                <p className={styles.prosConsLabel}>Nachteile</p>
                {tool.nachteile.map((n) => (
                  <div key={n} className={styles.prosConsItem}>
                    <span className={styles.conCross}>✗</span>{n}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── TEXTABSCHNITTE ───────────────────────────────────── */}
      {comparison.sections.map((sec) => (
        <section key={sec.id} className={styles.textSection}>
          <h2 className={styles.sectionTitle}>{sec.heading}</h2>
          <div className={styles.textSectionBody}><InlineMarkdown text={sec.content} /></div>
        </section>
      ))}

      {/* ─── FÜR WEN (ZIELGRUPPEN) ─────────────────────────────── */}
      {hasTargetGroups && (
        <>
          <h2 className={styles.sectionTitle}>Wer sollte eher zu welchem Tool greifen?</h2>
          <div className={styles.twoColGrid}>
            <div className={styles.targetBox}>
              <p className={styles.targetTitle}>{toolA.name} ist die bessere Wahl für …</p>
              {tgA.map((g) => (
                <div key={g} className={styles.fitItem}><span className={styles.fitCheck}>✓</span>{g}</div>
              ))}
            </div>
            <div className={styles.targetBox}>
              <p className={styles.targetTitle}>{toolB.name} ist die bessere Wahl für …</p>
              {tgB.map((g) => (
                <div key={g} className={styles.fitItem}><span className={styles.fitCheck}>✓</span>{g}</div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ─── ALTERNATIVEN ─────────────────────────────────────── */}
      {comparison.alternatives.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>Alternativen zu beiden Tools</h2>
          <div className={styles.altGrid}>
            {comparison.alternatives.map((alt) => {
              const at = alt.tool.translations[0]
              const name = at?.name ?? alt.tool.slug
              return (
                <a
                  key={alt.id}
                  href={altLink(alt)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.altCard}
                >
                  {/* backgroundColor + border: conditional auf logoUrl — erlaubte Inline-Styles */}
                  <div
                    className={styles.altLogoWrap}
                    style={{
                      backgroundColor: alt.tool.logoUrl ? 'transparent' : 'var(--color-cta)',
                      border: alt.tool.logoUrl ? '1px solid var(--color-border)' : 'none',
                    }}
                  >
                    {alt.tool.logoUrl ? (
                      <Image src={alt.tool.logoUrl} alt={name} width={40} height={40} className={styles.altLogoImg} />
                    ) : (
                      <span className={styles.altLogoInitial}>{name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <p className={styles.altName}>{name}</p>
                  <p className={styles.altReason}>{alt.reason}</p>
                  <span className={styles.altLink}>Ansehen →</span>
                </a>
              )
            })}
          </div>
        </>
      )}

      {/* ─── HÄUFIGE FRAGEN ───────────────────────────────────── */}
      {faqItems.length > 0 && (
        <div className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>Häufige Fragen</h2>
          <ul className={styles.faqList}>
            {faqItems.map((item, i) => (
              <li key={i} className={styles.faqItem}>
                {/* Plain Text — keine Markdown-Verarbeitung für FAQ */}
                <p className={styles.faqQuestion}>{item.question}</p>
                <p className={styles.faqAnswer}>{item.answer}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

    </main>
    </>
  )
}
