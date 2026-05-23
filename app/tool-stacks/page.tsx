// TOOL-STACKS SEITE (app/tool-stacks/page.tsx)
// Zeigt geplante Tool-Stacks für verschiedene Nutzertypen.
// URL: /tool-stacks

export default function ToolStacksSeite() {
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

          {/* "Im Aufbau" Badge */}
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
            Warum noch nicht live?
          </h2>
          <p style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.6',
            marginBottom: '20px',
          }}>
            Wir starten bewusst schlank. Tool-Stacks sollen später echte
            Orientierung bieten, statt nur Tool-Listen zu sein.
          </p>
          <a href="#" style={{
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
            🔔 Benachrichtigen lassen
          </a>
        </div>

      </section>

      {/* ─── GEPLANTE STACKS ──────────────────────────────────── */}
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
          Geplante Stacks
        </h2>

        {/* 3-spaltiges Raster */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '48px',
        }}>
          {[
            { icon: '👤', name: 'Stack für Freelancer', tags: 'Buchhaltung · Termine · Organisation · KI' },
            { icon: '💼', name: 'Stack für Gründer', tags: 'Konto · Buchhaltung · Website · CRM' },
            { icon: '🎬', name: 'Stack für Creator', tags: 'Design · Video · Social · KI' },
            { icon: '👥', name: 'Stack für kleine Teams', tags: 'Projekte · Docs · Kommunikation' },
            { icon: '📊', name: 'Stack für Berater', tags: 'Kalender · CRM · Verträge' },
            { icon: '</>', name: 'Stack für Entwickler', tags: 'Code · Hosting · Automatisierung' },
          ].map((stack) => (
            <div
              key={stack.name}
              style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                padding: '24px',
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
                {stack.icon}
              </div>

              {/* Name */}
              <p style={{ fontWeight: '700', fontSize: '16px', marginBottom: '8px' }}>
                {stack.name}
              </p>

              {/* Tags */}
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                {stack.tags}
              </p>

              {/* Badge */}
              <span style={{
                display: 'inline-block',
                backgroundColor: 'var(--color-badge-bg)',
                border: '1px solid var(--color-border)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
              }}>
                Bald verfügbar
              </span>
            </div>
          ))}
        </div>

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
              Starte bis dahin über die Tool-Suche und Vergleiche.
              Der Tool-Finder folgt später.
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
  );
}