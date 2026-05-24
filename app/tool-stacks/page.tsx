/**
 * Datei: app/tool-stacks/page.tsx
 *
 * Zweck: Übersicht aller publizierten Tool-Stacks — lädt echte Daten aus Prisma.
 * Zeigt Tool-Anzahl und Zielgruppe pro Stack.
 *
 * Design-Referenz:
 * - design-refs/5_Tool_Stacks.png
 */

import { prisma } from '@/lib/prisma'

export const revalidate = 3600

export default async function ToolStacksSeite() {
  const stacks = await prisma.toolStack.findMany({
    where: { published: true },
    include: {
      translations: { where: { locale: 'de' } },
      tags: { include: { tag: true } },
      _count: { select: { tools: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <main>

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section style={{
        padding: '60px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        gap: '48px',
        alignItems: 'flex-start',
      }}>

        {/* Linke Seite */}
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '42px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            lineHeight: '1.2',
            marginBottom: '16px',
          }}>
            Tool-Stacks für dein Business
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'var(--color-text-secondary)',
            marginBottom: '24px',
            lineHeight: '1.6',
          }}>
            Bewährte Tool-Stacks und Tool-Kombinationen für Freelancer,
            Gründer, Creator und kleine Teams entdecken und speichern.
          </p>

          {stacks.length === 0 && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-badge-bg)',
              border: '1px solid var(--color-border)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
            }}>
              Im Aufbau 🛠
            </span>
          )}
        </div>

        {/* Rechte Seite — Info Box */}
        <div style={{
          width: '320px',
          flexShrink: 0,
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          padding: '28px',
        }}>
          <div style={{ fontSize: '28px', marginBottom: '16px' }}>🚀</div>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '12px',
          }}>
            Kuratierte Stacks
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.6',
            marginBottom: '20px',
          }}>
            Jeder Stack ist ein durchdachtes Tool-Set für einen bestimmten
            Anwendungsfall — keine zufälligen Listen.
          </p>
          <a href="/kategorien" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-cta)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: 'var(--radius-btn)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
          }}>
            Alle Kategorien ansehen
          </a>
        </div>

      </section>

      {/* ─── STACKS ───────────────────────────────────────────── */}
      <section style={{
        padding: '0 24px 60px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>

        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '24px',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          marginBottom: '24px',
        }}>
          {stacks.length > 0 ? 'Aktuelle Stacks' : 'Geplante Stacks'}
        </h2>

        {stacks.length === 0 ? (
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Noch keine Stacks veröffentlicht.
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '48px',
          }}>
            {stacks.map((stack) => {
              const t = stack.translations[0]
              const name = t?.name ?? stack.slug
              const tagLine = stack.tags.length > 0
                ? stack.tags.map((st) => st.tag.name).join(' · ')
                : t?.targetAudience ?? ''

              return (
                <a
                  key={stack.id}
                  href={`/tool-stacks/${stack.slug}`}
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-card)',
                    padding: '24px',
                    textDecoration: 'none',
                    color: 'var(--color-text-primary)',
                    display: 'block',
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '44px',
                    height: '44px',
                    backgroundColor: 'var(--color-badge-bg)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    marginBottom: '16px',
                  }}>
                    ⊕
                  </div>

                  {/* Name */}
                  <p style={{ fontWeight: '700', fontSize: '16px', marginBottom: '8px' }}>
                    {name}
                  </p>

                  {/* Tags / Zielgruppe */}
                  {tagLine && (
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                      {tagLine}
                    </p>
                  )}

                  {/* Tool-Anzahl Badge */}
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: 'var(--color-badge-bg)',
                    border: '1px solid var(--color-border)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                  }}>
                    {stack._count.tools} Tools
                  </span>
                </a>
              )
            })}
          </div>
        )}

        {/* CTA Box unten */}
        <div style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          padding: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
        }}>
          <div style={{ fontSize: '60px' }}>🧭</div>
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '8px',
            }}>
              Nicht sicher, welche Tools du brauchst?
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
              Starte über die Tool-Suche und Vergleiche.
              Der Tool-Finder hilft dir bei der Auswahl.
            </p>
          </div>
          <a href="/kategorien" style={{
            backgroundColor: 'var(--color-cta)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: 'var(--radius-btn)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
          }}>
            Tools entdecken
          </a>
        </div>

      </section>

    </main>
  )
}
