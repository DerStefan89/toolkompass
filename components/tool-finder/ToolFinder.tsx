/**
 * Datei: components/tool-finder/ToolFinder.tsx
 *
 * Zweck: Interaktiver 3-Schritt-Wizard für den Tool-Finder.
 *   Schritt 1: Kategorie wählen (Props vom Server)
 *   Schritt 2: Budget wählen
 *   Schritt 3: Ergebnisse (geladen über Server Action getFinderResults)
 * Client Component wegen useState / Interaktion.
 *
 * Design-Referenz:
 * - Keine eigene Screenshot-Referenz vorhanden — folgt dem bestehenden
 *   Design-System (Tokens, Card-Muster wie /suche und /kategorien).
 *
 * Wichtig:
 * - Kein direkter Prisma-Call — Daten kommen via Props (Kategorien) und
 *   Server Action (Ergebnisse).
 * - <button> für Wizard-Aktionen, <a>/<Link> nur für Navigation.
 */

'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import IconRenderer from '@/components/ui/IconRenderer'
import { formatPreis } from '@/lib/utils/format'
import { getFinderResults } from '@/app/tool-finder/actions'
import type { FinderBudget, FinderCategory, FinderTool } from '@/lib/data/tool-finder'
import styles from './ToolFinder.module.css'

interface ToolFinderProps {
  categories: FinderCategory[]
}

/** Die 4 Budget-Stufen mit Label und erläuterndem Hinweis. */
const BUDGETS: { value: FinderBudget; label: string; hint: string }[] = [
  { value: 'kostenlos', label: 'Kostenlos', hint: 'Nur Tools mit Free-Plan' },
  { value: 'bis20', label: 'Bis 20 € / Monat', hint: 'Günstige Einsteiger-Tools' },
  { value: 'bis50', label: 'Bis 50 € / Monat', hint: 'Mehr Funktionsumfang' },
  { value: 'egal', label: 'Egal', hint: 'Preis ist nicht entscheidend' },
]

const STEP_LABELS = ['Kategorie', 'Budget', 'Ergebnisse']

export default function ToolFinder({ categories }: ToolFinderProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [budget, setBudget] = useState<FinderBudget | null>(null)
  const [tools, setTools] = useState<FinderTool[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  /** Schritt 1 → 2: Kategorie merken und weiter. */
  function handleSelectCategory(cat: FinderCategory) {
    setCategoryId(cat.id)
    setCategoryName(cat.translations[0]?.name ?? '')
    setStep(2)
  }

  /** Schritt 2 → 3: Budget merken, Ergebnisse laden. */
  function handleSelectBudget(value: FinderBudget) {
    if (!categoryId) return
    setBudget(value)
    setError(null)
    startTransition(async () => {
      const res = await getFinderResults(categoryId, value)
      if (res.ok) {
        setTools(res.tools)
      } else {
        setTools([])
        setError(res.error)
      }
      setStep(3)
    })
  }

  /** Zurück zur Kategorie-Auswahl, alles zurücksetzen. */
  function handleRestart() {
    setStep(1)
    setCategoryId(null)
    setCategoryName('')
    setBudget(null)
    setTools([])
    setError(null)
  }

  return (
    <div className={styles.wizard}>
      {/* ─── Fortschritts-Anzeige ──────────────────────────────── */}
      <ol className={styles.progress} aria-label="Fortschritt">
        {STEP_LABELS.map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3
          const state =
            n === step ? styles.progressActive : n < step ? styles.progressDone : ''
          return (
            <li key={label} className={`${styles.progressItem} ${state}`}>
              <span className={styles.progressNr}>{n}</span>
              <span className={styles.progressLabel}>{label}</span>
            </li>
          )
        })}
      </ol>

      {/* ─── Schritt 1: Kategorie ──────────────────────────────── */}
      {step === 1 && (
        <section className={styles.stepSection} aria-label="Kategorie wählen">
          <h2 className={styles.stepTitle}>Wofür suchst du ein Tool?</h2>
          <p className={styles.stepLead}>Wähle eine Kategorie.</p>

          {categories.length === 0 ? (
            <p className={styles.empty}>Aktuell sind keine Kategorien verfügbar.</p>
          ) : (
            <div className={styles.optionGrid}>
              {categories.map((cat) => {
                const t = cat.translations[0]
                if (!t) return null
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={styles.optionCard}
                    onClick={() => handleSelectCategory(cat)}
                  >
                    <span className={styles.optionIcon}>
                      <IconRenderer icon={cat.icon} size={24} />
                    </span>
                    <span className={styles.optionName}>{t.name}</span>
                    <span className={styles.optionHint}>{t.description}</span>
                  </button>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* ─── Schritt 2: Budget ─────────────────────────────────── */}
      {step === 2 && (
        <section className={styles.stepSection} aria-label="Budget wählen">
          <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>
            ← Zurück
          </button>
          <h2 className={styles.stepTitle}>Wie hoch ist dein Budget?</h2>
          <p className={styles.stepLead}>
            Kategorie: <strong>{categoryName}</strong>
          </p>

          <div className={styles.optionGrid}>
            {BUDGETS.map((b) => (
              <button
                key={b.value}
                type="button"
                className={styles.optionCard}
                onClick={() => handleSelectBudget(b.value)}
                disabled={isPending}
              >
                <span className={styles.optionName}>{b.label}</span>
                <span className={styles.optionHint}>{b.hint}</span>
              </button>
            ))}
          </div>

          {isPending && <p className={styles.loading}>Empfehlungen werden geladen …</p>}
        </section>
      )}

      {/* ─── Schritt 3: Ergebnisse ─────────────────────────────── */}
      {step === 3 && (
        <section className={styles.stepSection} aria-label="Ergebnisse">
          <button type="button" className={styles.backBtn} onClick={() => setStep(2)}>
            ← Budget ändern
          </button>

          <h2 className={styles.stepTitle}>
            {tools.length > 0 ? 'Das passt zu dir' : 'Keine Treffer'}
          </h2>
          <p className={styles.stepLead}>
            {categoryName}
            {budget && ` · ${BUDGETS.find((b) => b.value === budget)?.label}`}
          </p>

          {error ? (
            <p className={styles.errorBox}>{error}</p>
          ) : tools.length === 0 ? (
            <p className={styles.empty}>
              Für diese Kombination haben wir aktuell kein passendes Tool.
              Probiere ein höheres Budget oder eine andere Kategorie.
            </p>
          ) : (
            <div className={styles.resultGrid}>
              {tools.map((tool) => {
                const t = tool.translations[0]
                const name = t?.name ?? tool.slug
                const vendorUrl = tool.affiliateLinks[0]?.url
                const preis = formatPreis(tool.startingPriceCents, {
                  prefix: 'ab',
                  suffix: '/ Monat',
                  hasFreePlan: tool.hasFreePlan,
                })
                return (
                  <div key={tool.id} className={styles.toolCard}>
                    {/* backgroundColor + border: conditional auf logoUrl — erlaubte Inline-Styles */}
                    <div
                      className={styles.toolLogoWrap}
                      style={{
                        backgroundColor: tool.logoUrl ? 'transparent' : 'var(--color-cta)',
                        border: tool.logoUrl ? '1px solid var(--color-border)' : 'none',
                      }}
                    >
                      {tool.logoUrl ? (
                        <Image
                          src={tool.logoUrl}
                          alt={name}
                          width={44}
                          height={44}
                          className={styles.toolLogoImg}
                        />
                      ) : (
                        <span className={styles.toolLogoInitial}>
                          {name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <p className={styles.toolName}>{name}</p>
                    <p className={styles.toolDesc}>{t?.shortDescription}</p>

                    {tool.hasFreePlan && (
                      <span className={styles.freeBadge}>Free Plan</span>
                    )}

                    <p className={styles.toolPrice}>{preis}</p>

                    <Link href={`/tools/${tool.slug}`} className={styles.detailBtn}>
                      Details ansehen
                    </Link>
                    {vendorUrl && (
                      <a
                        href={vendorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.vendorLink}
                      >
                        Zum Anbieter →
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <button type="button" className={styles.restartBtn} onClick={handleRestart}>
            Neu starten
          </button>
        </section>
      )}
    </div>
  )
}
