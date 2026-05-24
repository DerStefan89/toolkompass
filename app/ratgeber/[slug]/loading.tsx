/**
 * Datei: app/ratgeber/[slug]/loading.tsx
 *
 * Zweck: Skeleton-Ladeansicht für die Ratgeber-Detailseite.
 * Spiegelt das Artikel-Header + 2-Spalten-Layout (Content + Sidebar).
 *
 * Design-Referenz:
 * - design-refs/2_Tool_Detailseite.png (Artikel-Layout ähnlich)
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

export default function RatgeberDetailLoading() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <Skel w="240px" h="12px" />

      {/* ─── Artikel-Header ─── */}
      <div style={{ marginTop: '28px', marginBottom: '40px', maxWidth: '760px' }}>
        <Skel w="80px" h="24px" radius="20px" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
          <Skel w="90%" h="36px" />
          <Skel w="65%" h="36px" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
          <Skel w="75%" h="16px" />
          <Skel w="60%" h="16px" />
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
          <Skel w="100px" h="12px" />
          <Skel w="80px" h="12px" />
          <Skel w="120px" h="12px" />
        </div>
      </div>

      {/* ─── 2 Spalten: Content + Sidebar ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '48px' }}>

        {/* CONTENT */}
        <div>
          {/* 4 Artikel-Sections */}
          {[1, 2, 3, 4].map(section => (
            <div key={section} style={{ marginBottom: '36px' }}>
              <Skel w="55%" h="20px" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
                <Skel h="14px" />
                <Skel h="14px" />
                <Skel w="90%" h="14px" />
                <Skel w="80%" h="14px" />
                {section % 2 === 0 && (
                  <>
                    <Skel h="14px" />
                    <Skel w="70%" h="14px" />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Empfohlene Tools Box */}
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <Skel w="65%" h="16px" />
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 0',
                borderBottom: i < 3 ? '1px solid var(--color-border)' : 'none',
              }}>
                <Skel w="36px" h="36px" radius="8px" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Skel w="60%" h="14px" />
                  <Skel w="80%" h="12px" />
                </div>
              </div>
            ))}
          </div>

          {/* Inhaltsverzeichnis-Box */}
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <Skel w="55%" h="16px" />
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Skel w="6px" h="6px" radius="50%" />
                <Skel w={`${60 + i * 8}%`} h="13px" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
