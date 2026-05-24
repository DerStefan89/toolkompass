/**
 * Datei: app/vergleichen/[slug]/loading.tsx
 *
 * Zweck: Skeleton-Ladeansicht für die Vergleichs-Detailseite.
 * Spiegelt das 2-Tool-Header + Tabelle + Stärken/Schwächen-Layout.
 *
 * Design-Referenz:
 * - design-refs/3_Vergleichsseite.png
 */

function Skel({ w = '100%', h = '16px', radius = '4px' }: { w?: string; h?: string; radius?: string }) {
  return (
    <div style={{
      width: w,
      height: h,
      backgroundColor: 'var(--color-badge-bg)',
      borderRadius: radius,
      flexShrink: 0,
    }} />
  )
}

export default function VergleichDetailLoading() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <Skel w="280px" h="12px" />

      {/* ─── 2 Tool-Header-Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '28px', marginBottom: '32px' }}>
        {[1, 2].map(i => (
          <div key={i} style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Skel w="52px" h="52px" radius="10px" />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Skel w="55%" h="20px" />
                <Skel w="75%" h="13px" />
              </div>
            </div>
            <Skel h="13px" />
            <Skel w="85%" h="13px" />
            <Skel w="70%" h="13px" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <Skel w="80px" h="20px" />
              <Skel w="120px" h="38px" radius="6px" />
            </div>
          </div>
        ))}
      </div>

      {/* ─── Vergleichstabelle ─── */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        marginBottom: '32px',
      }}>
        {/* Tabellen-Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          padding: '14px 20px',
          backgroundColor: 'var(--color-bg)',
          borderBottom: '1px solid var(--color-border)',
          gap: '16px',
        }}>
          <Skel w="80px" h="14px" />
          <Skel w="70px" h="14px" />
          <Skel w="70px" h="14px" />
        </div>
        {/* Tabellenzeilen */}
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            padding: '14px 20px',
            borderBottom: i < 5 ? '1px solid var(--color-border)' : 'none',
            gap: '16px',
            alignItems: 'center',
          }}>
            <Skel w="90px" h="14px" />
            <Skel w="60px" h="14px" />
            <Skel w="60px" h="14px" />
          </div>
        ))}
      </div>

      {/* ─── Verdict-Box ─── */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '24px',
        marginBottom: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}>
        <Skel w="40%" h="20px" />
        <Skel h="14px" />
        <Skel h="14px" />
        <Skel w="80%" h="14px" />
      </div>

      {/* ─── Stärken / Schwächen: 2 Spalten ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {[1, 2].map(col => (
          <div key={col}>
            {/* Tool-Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Skel w="40px" h="40px" radius="8px" />
              <Skel w="120px" h="18px" />
            </div>
            {/* Stärken */}
            <Skel w="60px" h="14px" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', marginBottom: '20px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', gap: '8px' }}>
                  <Skel w="14px" h="14px" radius="50%" />
                  <Skel h="14px" />
                </div>
              ))}
            </div>
            {/* Schwächen */}
            <Skel w="80px" h="14px" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              {[1, 2].map(i => (
                <div key={i} style={{ display: 'flex', gap: '8px' }}>
                  <Skel w="14px" h="14px" radius="50%" />
                  <Skel w="80%" h="14px" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </main>
  )
}
