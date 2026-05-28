/**
 * Datei: app/tools/[slug]/loading.tsx
 *
 * Zweck: Skeleton-Ladeansicht für die Tool-Detailseite.
 * Spiegelt das responsive Layout der echten Seite (page.tsx).
 *
 * Design-Referenz:
 * - design-refs/2_Tool_Detailseite.png
 */

import styles from './loading.module.css'

// width, height, borderRadius sind dynamische Props — bleiben inline
function Skel({ w = '100%', h = '16px', radius = '4px' }: { w?: string; h?: string; radius?: string }) {
  return (
    <div
      className={styles.skel}
      style={{ width: w, height: h, borderRadius: radius }}
    />
  )
}

export default function ToolDetailLoading() {
  return (
    <main className={styles.main}>

      {/* Breadcrumb */}
      <Skel w="260px" h="12px" />

      {/* ─── HERO: 3 Spalten → Mobile: einspaltig ─── */}
      <div className={styles.heroGrid}>

        {/* Spalte 1: Tool-Info */}
        <div>
          <div className={styles.logoRow}>
            <Skel w="64px" h="64px" radius="12px" />
            <div className={styles.logoMeta}>
              <Skel w="60%" h="22px" />
              <Skel w="40%" h="14px" />
              <Skel w="100px" h="24px" radius="20px" />
            </div>
          </div>
          <div className={styles.descSkels}>
            <Skel h="14px" />
            <Skel w="90%" h="14px" />
            <Skel w="75%" h="14px" />
          </div>
          <div className={styles.badgeSkels}>
            <Skel w="80px" h="24px" radius="20px" />
            <Skel w="80px" h="24px" radius="20px" />
            <Skel w="80px" h="24px" radius="20px" />
          </div>
          <div className={styles.btnSkels}>
            <Skel w="130px" h="40px" radius="6px" />
            <Skel w="110px" h="40px" radius="6px" />
          </div>
        </div>

        {/* Spalte 2: Screenshot */}
        <Skel h="220px" radius="8px" />

        {/* Spalte 3: Preisbox */}
        <div className={styles.priceBoxSkel}>
          <Skel w="70%" h="16px" />
          <Skel w="50%" h="36px" />
          <Skel w="80%" h="12px" />
          {[1, 2, 3, 4].map(i => <Skel key={i} h="14px" />)}
          <Skel h="44px" radius="6px" />
        </div>

      </div>

      {/* ─── TABS ─── */}
      <div className={styles.tabBar}>
        {[80, 80, 60, 80, 90, 50].map((w, i) => (
          <div key={i} className={styles.tabPad}>
            <Skel w={`${w}px`} h="14px" />
          </div>
        ))}
      </div>

      {/* ─── ÜBERBLICK: 3 Spalten → Mobile: einspaltig ─── */}
      <div className={styles.overviewGrid}>
        {[1, 2, 3].map(col => (
          <div key={col} className={styles.overviewCol}>
            <Skel w="55%" h="20px" />
            <Skel h="14px" />
            <Skel h="14px" />
            <Skel w="85%" h="14px" />
            <Skel w="85%" h="14px" />
            <Skel w="70%" h="14px" />
          </div>
        ))}
      </div>

      {/* ─── FUNKTIONEN: 4 Spalten → Mobile: 2-spaltig ─── */}
      <div className={styles.featuresGrid}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className={styles.featureCardSkel}>
            <Skel w="28px" h="28px" radius="4px" />
            <Skel h="14px" />
            <Skel w="70%" h="14px" />
          </div>
        ))}
      </div>

      {/* ─── PREISE: Volle Breite ─── */}
      <div className={styles.priceSectionSkel}>
        <Skel w="30%" h="20px" />
        <Skel h="14px" />
        <Skel w="60%" h="14px" />
        <Skel w="160px" h="40px" radius="6px" />
      </div>

    </main>
  )
}
