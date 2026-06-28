/**
 * Datei: app/meine-tools/page.tsx
 *
 * Zweck: Geschütztes Dashboard — alle Tools im Stack des Nutzers, die
 * monatlichen Kosten und eine Gesamtsumme.
 * Server Component, geschützt via requireUser() (zusätzlich zu proxy.ts).
 *
 * Design-Referenz:
 * - Kein eigener Screenshot — Card-Optik wie /kategorien, Design-Tokens.
 *
 * Wichtig:
 * - robots: noindex — eingeloggter Bereich, nicht indexieren.
 * - Preislogik gekapselt in lib/utils/stack-costs.ts.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth/require-user'
import { getUserTools } from '@/lib/data/user-tools'
import { formatPreis } from '@/lib/utils/format'
import { calculateStackCosts, getEffectivePrice } from '@/lib/utils/stack-costs'
import RemoveToolButton from '@/components/tools/RemoveToolButton'
import ToolPriceEditor from '@/components/tools/ToolPriceEditor'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Meine Tools | ToolSucher',
  description: 'Verwalte deinen persönlichen Tool-Stack. Speichere genutzte Tools, hinterlege Preise und behalte deine monatlichen Software-Kosten im Blick.',
  robots: { index: false },
}

/** Suffix hinter dem Preis je Abrechnungszyklus (nur bei Preis > 0). */
const CYCLE_SUFFIX = {
  monthly: '/ Monat',
  yearly: '/ Jahr',
  one_time: 'einmalig',
} as const

export default async function MeineToolsSeite() {
  let session
  try {
    session = await requireUser()
  } catch {
    redirect('/einloggen?next=/meine-tools')
  }

  const userTools = await getUserTools(session.userId)
  const costs = calculateStackCosts(userTools)

  return (
    <main className={styles.main}>
      {/* Breadcrumb */}
      <p className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Startseite</Link>
        {' › '}
        Meine Tools
      </p>

      <div className={styles.titleRow}>
        <h1 className={styles.title}>Meine Tools</h1>
        <Link href="/konto" className={styles.kontoLink}>Konto-Einstellungen →</Link>
      </div>

      {userTools.length === 0 ? (
        /* ─── Empty State ─────────────────────────────────────── */
        <div className={styles.empty}>
          <p className={styles.emptyText}>Du hast noch keine Tools in deinem Stack gespeichert. Entdecke Tools und markiere sie als genutzt.</p>
          <div className={styles.emptyActions}>
            <Link href="/tool-finder" className={styles.emptyBtnPrimary}>Tools entdecken</Link>
            <Link href="/kategorien" className={styles.emptyBtnSecondary}>Alle Kategorien</Link>
          </div>
        </div>
      ) : (
        <>
          {/* ─── Kostenübersicht ──────────────────────────────── */}
          <div className={styles.costCard}>
            <p className={styles.costLabel}>Geschätzte monatliche Kosten</p>
            <p className={styles.costAmount}>
              {formatPreis(costs.monthlyCents)} <span className={styles.costUnit}>/ Monat</span>
            </p>
            {costs.oneTimeCents > 0 && (
              <p className={styles.costOneTime}>
                Einmalige Kosten: {formatPreis(costs.oneTimeCents)}
              </p>
            )}
            <p className={styles.costCount}>
              {userTools.length} {userTools.length === 1 ? 'Tool' : 'Tools'} in deinem Stack
            </p>
          </div>

          {/* ─── Tool-Liste ───────────────────────────────────── */}
          <div className={styles.toolList}>
            {userTools.map((ut) => {
              const name = ut.tool.translations[0]?.name ?? ut.tool.slug
              const { cents, cycle } = getEffectivePrice(ut)
              const priceStr = formatPreis(cents)
              const suffix = cents > 0 ? CYCLE_SUFFIX[cycle] : ''
              const planLabel = ut.pricingPlan
                ? `Tarif: ${ut.pricingPlan.name}`
                : ut.customPriceCents != null
                  ? 'Eigener Preis'
                  : 'Standardpreis'

              const availablePlans = ut.tool.pricingPlans.map((p) => ({
                id: p.id,
                name: p.name,
                priceCents: p.priceCents,
                billingCycle: p.billingCycle,
              }))

              return (
                <div key={ut.id} className={styles.toolRow}>
                  <div className={styles.toolRowMain}>
                    {/* Logo */}
                    <div
                      className={styles.toolLogoWrap}
                      style={{
                        backgroundColor: ut.tool.logoUrl ? 'transparent' : 'var(--color-cta)',
                        border: ut.tool.logoUrl ? '1px solid var(--color-border)' : 'none',
                      }}
                    >
                      {ut.tool.logoUrl ? (
                        <Image src={ut.tool.logoUrl} alt={name} width={40} height={40} className={styles.toolLogoImg} />
                      ) : (
                        <span className={styles.toolLogoInitial}>{name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className={styles.toolInfo}>
                      <Link href={`/tools/${ut.tool.slug}`} className={styles.toolName}>{name}</Link>
                      <p className={styles.toolPlan}>{planLabel}</p>
                    </div>

                    {/* Preis */}
                    <div className={styles.toolPrice}>
                      <span className={styles.toolPriceAmount}>{priceStr}</span>
                      {suffix && <span className={styles.toolPriceCycle}>{suffix}</span>}
                    </div>

                    {/* Entfernen */}
                    <RemoveToolButton userToolId={ut.id} toolName={name} />
                  </div>

                  {/* Preis anpassen (einklappbar) */}
                  <ToolPriceEditor
                    userToolId={ut.id}
                    toolId={ut.tool.id}
                    availablePlans={availablePlans}
                    currentPricingPlanId={ut.pricingPlanId}
                    currentCustomPriceCents={ut.customPriceCents}
                    currentBillingCycle={ut.billingCycle}
                  />
                </div>
              )
            })}
          </div>
        </>
      )}
    </main>
  )
}
