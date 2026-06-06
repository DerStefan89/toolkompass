/**
 * Datei: components/SearchInput.tsx
 *
 * Zweck: Suchfeld mit Autocomplete-Dropdown.
 * - Tippen (≥ 2 Zeichen, 300 ms Debounce) → GET /api/search?q=... → Vorschläge
 * - Klick auf Vorschlag → /tools/[slug]
 * - ArrowUp/Down navigiert im Dropdown, Enter auf Auswahl → /tools/[slug]
 * - Enter ohne Auswahl → /suche?q=...
 * - Blur → Dropdown schließt; mouseDown auf Item verhindert Blur
 * Client Component wegen useState, useRef, useRouter.
 *
 * Design-Referenz:
 * - design-refs/1_Landing_Page.png
 *
 * Wichtig:
 * Kein direkter Prisma-Call — nutzt /api/search Route Handler.
 * Styling des <input> kommt via className vom Aufrufer.
 * Wrapper-Breite via wrapperClassName steuerbar (z. B. für max-width).
 */

'use client'

import { useState, useRef, useId } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { SearchSuggestion } from '@/app/api/search/route'
import styles from './SearchInput.module.css'

interface SearchInputProps {
  className?: string
  wrapperClassName?: string
  placeholder?: string
  initialValue?: string
}

export default function SearchInput({
  className,
  wrapperClassName,
  placeholder = 'Nach Tool, Kategorie oder Anwendungsfall suchen ...',
  initialValue = '',
}: SearchInputProps) {
  const [value, setValue] = useState(initialValue)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const listboxId = useId()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    setValue(newValue)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    const trimmed = newValue.trim()
    if (trimmed.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      setActiveIndex(-1)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        if (res.ok) {
          const data: SearchSuggestion[] = await res.json()
          setSuggestions(data)
          setShowDropdown(true)
          setActiveIndex(-1)
        }
      } catch {
        // Netzwerkfehler — Dropdown leer lassen
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) {
      if (e.key === 'Enter' && value.trim()) {
        router.push(`/suche?q=${encodeURIComponent(value.trim())}`)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      setActiveIndex(-1)
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        router.push(`/tools/${suggestions[activeIndex].slug}`)
        setShowDropdown(false)
      } else if (value.trim()) {
        router.push(`/suche?q=${encodeURIComponent(value.trim())}`)
        setShowDropdown(false)
      }
    }
  }

  function handleBlur() {
    setShowDropdown(false)
    setActiveIndex(-1)
  }

  function handleFocus() {
    if (suggestions.length > 0 && value.trim().length >= 2) {
      setShowDropdown(true)
    }
  }

  const hasDropdown = showDropdown && value.trim().length >= 2

  return (
    <div className={`${styles.wrapper}${wrapperClassName ? ` ${wrapperClassName}` : ''}`}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        role="combobox"
        aria-expanded={hasDropdown}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-controls={listboxId}
      />

      {hasDropdown && (
        <div id={listboxId} className={styles.dropdown} role="listbox">
          {loading && (
            <p className={styles.dropdownEmpty}>Suche ...</p>
          )}

          {!loading && suggestions.length === 0 && (
            <p className={styles.dropdownEmpty}>Kein Tool gefunden.</p>
          )}

          {!loading && suggestions.map((s, i) => (
            <a
              key={s.slug}
              href={`/tools/${s.slug}`}
              role="option"
              aria-selected={i === activeIndex}
              className={`${styles.dropdownItem}${i === activeIndex ? ` ${styles.dropdownItemActive}` : ''}`}
              onMouseDown={(e) => e.preventDefault()}
            >
              {s.logoUrl ? (
                <Image
                  src={s.logoUrl}
                  alt={s.name}
                  width={24}
                  height={24}
                  className={styles.itemLogo}
                />
              ) : (
                <span className={styles.itemLogoInitial} aria-hidden="true">
                  {s.name.charAt(0).toUpperCase()}
                </span>
              )}

              <span className={styles.itemText}>
                <span className={styles.itemName}>{s.name}</span>
                {s.categoryName && (
                  <span className={styles.itemCategory}>{s.categoryName}</span>
                )}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
