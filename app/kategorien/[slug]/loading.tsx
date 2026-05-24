/**
 * Datei: app/kategorien/[slug]/loading.tsx
 *
 * Zweck: Skeleton-Ladeansicht für die Kategorie-Detailseite.
 * Spiegelt das 2-Spalten-Layout (Main + Sidebar) der echten Seite.
 *
 * Design-Referenz:
 * - design-refs/4_Alle_Kategorien.png
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

export default function KategorieDetailLoading() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <Skel w="220px" h="12px" />

      {/* ─── 2 Spalten: Main + Sidebar ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '48px', marginTop: '28px' }}>

        {/* MAIN */}
        <div>
          {/* Kategorie-Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <Skel w="52px" h="52px" radius="8px" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Skel w="50%" h="28px" />
              <Skel w="80%" h="14px" />
            </div>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
            {[90, 70, 80, 100, 75].map((w, i) => (
              <Skel key={i} w={`${w}px`} h="30px" radius="20px" />
            ))}
          </div>

          {/* Tool-Cards Grid: 3 Spalten */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Skel w="40px" h="40px" radius="8px" />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Skel w="65%" h="14px" />
                    <Skel w="80%" h="12px" />
                  </div>
                </div>
                <Skel h="12px" />
                <Skel w="85%" h="12px" />
                <Skel w="70%" h="12px" />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <Skel w="60px" h="22px" radius="20px" />
                  <Skel w="50px" h="22px" radius="20px" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Skel w="70px" h="16px" />
                  <Skel w="80px" h="32px" radius="6px" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Filter-Box */}
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <Skel w="60%" h="16px" />
            {[1, 2, 3, 4].map(i => (
              <Skel key={i} h="30px" radius="20px" />
            ))}
          </div>

          {/* Worauf achten? Box */}
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <Skel w="70%" h="16px" />
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Skel w="16px" h="16px" radius="50%" />
                <Skel h="14px" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
