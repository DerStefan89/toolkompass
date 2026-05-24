/**
 * Datei: app/tools/[slug]/loading.tsx
 *
 * Zweck: Skeleton-Ladeansicht für die Tool-Detailseite.
 * Spiegelt das 3-Spalten-Hero + Tabs + Überblick-Layout der echten Seite.
 *
 * Design-Referenz:
 * - design-refs/2_Tool_Detailseite.png
 */

// Wiederverwendbarer Skeleton-Block
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

export default function ToolDetailLoading() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Breadcrumb */}
      <Skel w="260px" h="12px" />

      {/* ─── HERO: 3 Spalten ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', gap: '32px', marginTop: '28px', marginBottom: '32px' }}>

        {/* Spalte 1: Tool-Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <Skel w="64px" h="64px" radius="12px" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Skel w="60%" h="22px" />
              <Skel w="40%" h="14px" />
              <Skel w="100px" h="24px" radius="20px" />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            <Skel h="14px" />
            <Skel w="90%" h="14px" />
            <Skel w="75%" h="14px" />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <Skel w="80px" h="24px" radius="20px" />
            <Skel w="80px" h="24px" radius="20px" />
            <Skel w="80px" h="24px" radius="20px" />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Skel w="130px" h="40px" radius="6px" />
            <Skel w="110px" h="40px" radius="6px" />
          </div>
        </div>

        {/* Spalte 2: Screenshot */}
        <Skel h="220px" radius="8px" />

        {/* Spalte 3: Preisbox */}
        <div style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <Skel w="70%" h="16px" />
          <Skel w="50%" h="36px" />
          <Skel w="80%" h="12px" />
          {[1, 2, 3, 4].map(i => <Skel key={i} h="14px" />)}
          <Skel h="44px" radius="6px" />
        </div>

      </div>

      {/* ─── TABS ─── */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid var(--color-border)', marginBottom: '40px' }}>
        {[80, 80, 60, 80, 90, 50].map((w, i) => (
          <div key={i} style={{ padding: '12px 20px' }}>
            <Skel w={`${w}px`} h="14px" />
          </div>
        ))}
      </div>

      {/* ─── ÜBERBLICK: 3 Spalten ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px', marginBottom: '48px' }}>
        {[1, 2, 3].map(col => (
          <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Skel w="55%" h="20px" />
            <Skel h="14px" />
            <Skel h="14px" />
            <Skel w="85%" h="14px" />
            <Skel w="85%" h="14px" />
            <Skel w="70%" h="14px" />
          </div>
        ))}
      </div>

      {/* ─── FUNKTIONEN: 4 Spalten ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '48px' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <Skel w="28px" h="28px" radius="4px" />
            <Skel h="14px" />
            <Skel w="70%" h="14px" />
          </div>
        ))}
      </div>

      {/* ─── PREISE: Volle Breite ─── */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <Skel w="30%" h="20px" />
        <Skel h="14px" />
        <Skel w="60%" h="14px" />
        <Skel w="160px" h="40px" radius="6px" />
      </div>

    </main>
  )
}
