/**
 * Datei: components/admin/CriterionAssigner.tsx
 *
 * Zweck: Weist ein Bewertungskriterium den Tools einer Kategorie zu.
 * Admin wählt eine Kategorie, hakt Tools an/ab und speichert. Die Daten aller
 * Kategorien sind vorab geladen (kleine Menge) — Filtern passiert client-seitig.
 *
 * Wird aufgerufen von:
 * - app/admin/bewertungskriterien/[id]/page.tsx
 *
 * Wichtig:
 * - Kein Prisma-Import — die Action kommt als RPC-Referenz; die Kategorie-
 *   Zugehörigkeit der Tools wird serverseitig erneut geprüft.
 */

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { assignCriterionToTools } from '@/app/admin/bewertungskriterien/assign-actions'

export type AssignerTool = { id: string; name: string; isAssigned: boolean }
export type AssignerCategory = {
  categoryId: string
  categoryName: string
  tools: AssignerTool[]
}

interface CriterionAssignerProps {
  criterionId: string
  toolsByCategory: AssignerCategory[]
}

export default function CriterionAssigner({ criterionId, toolsByCategory }: CriterionAssignerProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [catId, setCatId] = useState('')
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentCat = toolsByCategory.find((c) => c.categoryId === catId) ?? null

  function handleCatChange(id: string) {
    setCatId(id)
    setSaved(false)
    setError(null)
    const cat = toolsByCategory.find((c) => c.categoryId === id)
    const init: Record<string, boolean> = {}
    cat?.tools.forEach((t) => {
      init[t.id] = t.isAssigned
    })
    setChecked(init)
  }

  function toggle(toolId: string) {
    setSaved(false)
    setChecked((prev) => ({ ...prev, [toolId]: !prev[toolId] }))
  }

  function setAll(value: boolean) {
    if (!currentCat) return
    setSaved(false)
    const next: Record<string, boolean> = {}
    currentCat.tools.forEach((t) => {
      next[t.id] = value
    })
    setChecked(next)
  }

  function handleSave() {
    if (!currentCat) return
    setError(null)
    const ids = currentCat.tools.filter((t) => checked[t.id]).map((t) => t.id)
    startTransition(async () => {
      const res = await assignCriterionToTools(criterionId, currentCat.categoryId, ids)
      if (res.success) {
        setSaved(true)
        router.refresh()
      } else {
        setError(res.error ?? 'Speichern fehlgeschlagen.')
      }
    })
  }

  const selectStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '320px',
    padding: '8px 12px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-btn)',
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-bg-card)',
    boxSizing: 'border-box',
  }

  const smallBtn: React.CSSProperties = {
    padding: '5px 12px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    backgroundColor: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-btn)',
    cursor: 'pointer',
  }

  return (
    <div>
      {/* Kategorie-Auswahl */}
      <label style={{
        display: 'block',
        fontSize: '13px',
        fontWeight: 600,
        marginBottom: '6px',
        color: 'var(--color-text-primary)',
      }}>
        Kategorie wählen
      </label>
      <select
        value={catId}
        onChange={(e) => handleCatChange(e.target.value)}
        style={selectStyle}
      >
        <option value="">— Kategorie wählen —</option>
        {toolsByCategory.map((c) => (
          <option key={c.categoryId} value={c.categoryId}>
            {c.categoryName} ({c.tools.length})
          </option>
        ))}
      </select>

      {/* Tool-Liste */}
      {currentCat && (
        <div style={{ marginTop: '20px' }}>
          {currentCat.tools.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Keine Tools in dieser Kategorie.
            </p>
          ) : (
            <>
              {/* Massen-Aktionen */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button type="button" onClick={() => setAll(true)} style={smallBtn}>
                  Alle auswählen
                </button>
                <button type="button" onClick={() => setAll(false)} style={smallBtn}>
                  Alle abwählen
                </button>
              </div>

              {/* Checkboxen */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '8px',
                marginBottom: '16px',
              }}>
                {currentCat.tools.map((tool) => (
                  <label
                    key={tool.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      color: 'var(--color-text-primary)',
                      cursor: 'pointer',
                      padding: '6px 8px',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-btn)',
                      backgroundColor: 'var(--color-bg-card)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!checked[tool.id]}
                      onChange={() => toggle(tool.id)}
                      style={{ width: '15px', height: '15px', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tool.name}
                    </span>
                  </label>
                ))}
              </div>

              {/* Speichern + Feedback */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending}
                  style={{
                    padding: '9px 20px',
                    backgroundColor: isPending ? 'var(--color-text-secondary)' : 'var(--color-cta)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 'var(--radius-btn)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isPending ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isPending ? 'Wird gespeichert…' : 'Zuweisung speichern'}
                </button>
                {saved && (
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-success)' }}>
                    ✓ Gespeichert
                  </span>
                )}
                {error && (
                  <span style={{ fontSize: '13px', color: 'var(--color-error)' }}>{error}</span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
