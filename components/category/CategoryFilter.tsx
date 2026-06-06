/**
 * Datei: components/category/CategoryFilter.tsx
 *
 * Zweck: Client-seitiges Filter-Widget für die Kategorien-Übersichtsseite.
 * Empfängt alle Kategorien als Prop und filtert live nach Tipp-Input.
 * Client Component wegen useState.
 *
 * Design-Referenz:
 * - design-refs/4_Alle_Kategorien.png
 *
 * Wichtig:
 * Kein Prisma-Call — Daten kommen vom Server-Parent.
 */

'use client'

import { useState } from 'react'
import IconRenderer from '@/components/ui/IconRenderer'
import styles from './CategoryFilter.module.css'

type CategoryTranslation = {
  name: string
  description: string | null
}

type ToolTranslation = {
  name: string | null
}

type CategoryTool = {
  tool: {
    translations: ToolTranslation[]
  }
}

type Category = {
  id: string
  slug: string
  icon: string | null
  translations: CategoryTranslation[]
  _count: { tools: number }
  tools: CategoryTool[]
}

interface CategoryFilterProps {
  categories: Category[]
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? categories.filter((cat) =>
        cat.translations[0]?.name.toLowerCase().includes(query.toLowerCase())
      )
    : categories

  return (
    <>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Kategorie oder Aufgabe suchen ..."
        className={styles.searchInput}
      />

      {filtered.length === 0 ? (
        <p className={styles.empty}>Keine Kategorien gefunden für &bdquo;{query}&ldquo;.</p>
      ) : (
        <div className={styles.catGrid}>
          {filtered.map((cat) => {
            const t = cat.translations[0]
            if (!t) return null

            const toolNames = cat.tools
              .map((tc) => tc.tool.translations[0]?.name ?? '')
              .filter(Boolean)
              .join(' · ')

            return (
              <a
                key={cat.id}
                href={`/kategorien/${cat.slug}`}
                className={`category-card ${styles.catCard}`}
              >
                <div className={`category-card-icon ${styles.catIcon}`}>
                  <IconRenderer icon={cat.icon} size={28} />
                </div>

                <p className={styles.catName}>{t.name}</p>
                <p className={styles.catDesc}>{t.description}</p>

                {toolNames && (
                  <p className={styles.catTools}>{toolNames}</p>
                )}

                <div className={styles.catFooter}>
                  <span className={styles.catCount}>{cat._count.tools} Tools</span>
                  <span className={styles.catArrow}>→</span>
                </div>
              </a>
            )
          })}
        </div>
      )}
    </>
  )
}
