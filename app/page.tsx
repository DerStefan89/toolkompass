/**
 * Datei: app/page.tsx
 *
 * Zweck: Startseite von ToolSucher.
 * Aufbau: Hero (2 Spalten) → Aufgaben-Pills → Tool-Cards → Kategorien-Scroll
 *
 * Design-Referenz:
 * - design-refs/1_Landing_Page.png
 *
 * Wichtig:
 * Tool-Cards zeigen die 6 neuesten publizierten Tools aus der DB.
 * Kategorien-Scroll zeigt alle publizierten Kategorien sortiert nach sortOrder.
 * Hero-Bereich und Tool-Stack-Box bleiben statisch (keine DB-Abfrage nötig).
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatPreis } from '@/lib/utils/format'
import IconRenderer from '@/components/ui/IconRenderer'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'ToolSucher — Digitale Business-Tools entdecken & vergleichen',
  description: 'Finde die besten digitalen Tools für dein Business.',
  openGraph: {
    title: 'ToolSucher — Digitale Business-Tools entdecken & vergleichen',
    description: 'Finde die besten digitalen Tools für dein Business.',
  },
}

export default async function Home() {
  // Promise.all: beide Queries laufen parallel
  const [tools, categories] = await Promise.all([
    prisma.tool.findMany({
      where: { published: true },
      take: 6,
      orderBy: { publishedAt: 'desc' },
      include: { translations: { where: { locale: 'de' } } },
    }),
    prisma.category.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        translations: { where: { locale: 'de' } },
        _count: { select: { tools: true } },
      },
    }),
  ])

  return (
    <main>

      {/* ─── HERO: Zwei Spalten ─────────────────────────────── */}
      <section style={{
        padding: '60px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        gap: '48px',
        alignItems: 'flex-start',
      }}>

        {/* LINKE SPALTE */}
        <div style={{ flex: 1 }}>

          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '52px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            lineHeight: '1.2',
            marginBottom: '20px',
          }}>
            Finde und vergleiche die besten Tools für dein Business.
          </h1>

          <p style={{
            fontSize: '16px',
            color: 'var(--color-text-secondary)',
            marginBottom: '32px',
            lineHeight: '1.6',
          }}>
            ToolSucher hilft Gründern, Selbstständigen und kleinen Teams in
            Deutschland, passende Software zu finden und zu vergleichen.
          </p>

          <input
            type="text"
            placeholder="Nach Tool, Kategorie oder Anwendungsfall suchen ..."
            style={{
              width: '100%',
              padding: '14px 18px',
              borderRadius: 'var(--radius-btn)',
              border: '1px solid var(--color-border)',
              fontSize: '15px',
              backgroundColor: 'white',
              marginBottom: '16px',
            }}
          />

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <Link href="/tool-finder" style={{
              backgroundColor: 'var(--color-cta)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: 'var(--radius-btn)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
            }}>
              Tool-Finder starten →
            </Link>
            <Link href="/kategorien" style={{
              backgroundColor: 'transparent',
              color: 'var(--color-text-primary)',
              padding: '12px 24px',
              borderRadius: 'var(--radius-btn)',
              textDecoration: 'none',
              fontSize: '14px',
              border: '1px solid var(--color-border)',
            }}>
              Kategorien ansehen
            </Link>
          </div>

          {/* Was möchtest du erledigen? — direkt unter den Buttons */}
          <p style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            marginBottom: '10px',
          }}>
            Was möchtest du erledigen?
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { icon: '🧾', label: 'Unternehmen verwalten' },
              { icon: '📅', label: 'Termine buchen' },
              { icon: '🎙', label: 'KI Tools einbinden' },
              { icon: '🎬', label: 'Videos erstellen' },
              { icon: '✍️', label: 'Social Media Kampagnen' },
              { icon: '💼', label: 'Sales Funnel aufbauen' },
              { icon: '📊', label: 'Präsentation erstellen' },
            ].map((aufgabe) => (
              <Link key={aufgabe.label} href="/aufgaben" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '20px',
                textDecoration: 'none',
                color: 'var(--color-text-primary)',
                fontSize: '13px',
                whiteSpace: 'nowrap',
              }}>
                <span>{aufgabe.icon}</span>
                <span>{aufgabe.label}</span>
              </Link>
            ))}
          </div>

        </div>
        {/* ENDE LINKE SPALTE */}

        {/* RECHTE SPALTE — Tool-Stack Box */}
        <div style={{
          width: '340px',
          flexShrink: 0,
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          padding: '20px',
        }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontWeight: '700', fontSize: '16px' }}>
              Vorschau: Dein Tool-Stack
            </span>
            <span style={{
              backgroundColor: 'var(--color-warning-bg)',
              color: 'var(--color-warning-text)',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: '600',
            }}>
              Bald verfügbar
            </span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
            Verwalte dein Tool-Stack an einem Ort
          </p>

          {['Tools speichern', 'Kosten im Blick behalten', 'Alternativen entdecken'].map((feature) => (
            <div key={feature} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '10px',
              fontSize: '14px',
            }}>
              <span style={{ color: 'var(--color-cta)' }}>✓</span>
              {feature}
            </div>
          ))}

          <div style={{
            backgroundColor: 'var(--color-bg)',
            borderRadius: 'var(--radius-card)',
            padding: '16px',
            margin: '16px 0',
          }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
              Dein Stack (Vorschau)
            </p>
            {['Notion', 'sevdesk', 'Calendly'].map((tool) => (
              <div key={tool} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid var(--color-border)',
                fontSize: '14px',
              }}>
                <span>{tool}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>– –</span>
              </div>
            ))}
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '12px' }}>
              Monatliche Kosten (Beispiel): – – € / Monat
            </p>
          </div>

          <Link href="/tool-stacks" style={{
            display: 'block',
            textAlign: 'center',
            backgroundColor: 'var(--color-cta)',
            color: 'white',
            padding: '12px',
            borderRadius: 'var(--radius-btn)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
          }}>
            Stack-Vorschau ansehen
          </Link>

          <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            🔔 Benachrichtigen lassen
          </p>

        </div>
        {/* ENDE RECHTE SPALTE */}

      </section>

      {/* ─── TOOL-CARDS ──────────────────────────────────────── */}
      <section style={{
        padding: '0 24px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}>
          {tools.map((tool) => {
            const t = tool.translations[0]
            const name = t?.name ?? tool.slug
            const preis = formatPreis(tool.startingPriceMonthly, { prefix: 'ab' })

            return (
              <div key={tool.id} style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                padding: '16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: tool.logoUrl ? 'transparent' : 'var(--color-cta)',
                      border: tool.logoUrl ? '1px solid var(--color-border)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      {tool.logoUrl ? (
                        <img src={tool.logoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ color: 'white', fontWeight: '700', fontSize: '16px' }}>
                          {name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '14px', margin: 0 }}>{name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                        {t?.shortDescription?.slice(0, 30) ?? ''}
                      </p>
                    </div>
                  </div>
                  <span style={{ color: 'var(--color-text-secondary)', cursor: 'pointer' }}>♡</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px', lineHeight: '1.5' }}>
                  {t?.shortDescription ?? ''}
                </p>
                {tool.hasFreePlan && (
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: 'var(--color-badge-bg)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '11px',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    marginBottom: '12px',
                  }}>
                    Free Plan
                  </span>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{preis}</span>
                  <a href={`/tools/${tool.slug}`} style={{
                    fontSize: '13px',
                    color: 'var(--color-text-primary)',
                    textDecoration: 'none',
                    border: '1px solid var(--color-border)',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-btn)',
                  }}>
                    Details
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ─── KATEGORIEN ──────────────────────────────────────── */}
      <section style={{
        padding: '0 24px 60px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '20px',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
          }}>
            Entdecke Tools nach Kategorie
          </h2>
          <Link href="/kategorien" style={{ fontSize: '14px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
            Alle Kategorien ansehen →
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
          {categories.map((cat) => {
            const t = cat.translations[0]
            const label = t?.name ?? cat.slug

            return (
              <a key={cat.id} href={`/kategorien/${cat.slug}`} className="category-card" style={{
                flexShrink: 0,
                minWidth: '140px',
                padding: '16px 14px',
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                textAlign: 'center',
                textDecoration: 'none',
                color: 'var(--color-text-primary)',
                fontSize: '12px',
                lineHeight: '1.5',
              }}>
                <div className="category-card-icon" style={{ marginBottom: '8px', color: 'var(--color-cta)', display: 'flex', justifyContent: 'center' }}>
                  <IconRenderer icon={cat.icon} size={28} />
                </div>
                {label}
              </a>
            )
          })}
        </div>
      </section>

    </main>
  )
}
