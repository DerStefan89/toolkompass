/**
 * Datei: components/rating/StarInput.tsx
 *
 * Zweck: Zugängliche 1–5-Sterne-Auswahl auf Radio-Basis (fieldset + 5 radios,
 * visuell als Sterne). Tastatur-bedienbar (Pfeiltasten wählen im Radio-Set).
 *
 * Wird aufgerufen von:
 * - components/rating/RatingForm.tsx
 *
 * Wichtig:
 * - Kein Prisma-/Server-Import — reine UI-Komponente.
 * - Der gewählte Wert wird über das (versteckte) radio-value übermittelt.
 */

'use client'

import { useState } from 'react'
import styles from './StarInput.module.css'

interface StarInputProps {
  name: string
  label: string
  description?: string
  defaultValue?: number
  required?: boolean
}

const STARS = [1, 2, 3, 4, 5]

export default function StarInput({
  name,
  label,
  description,
  defaultValue = 0,
  required = false,
}: StarInputProps) {
  const [selected, setSelected] = useState(defaultValue)
  const [hovered, setHovered] = useState(0)

  const active = hovered || selected

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </legend>
      {description && <p className={styles.description}>{description}</p>}

      <div className={styles.stars} onMouseLeave={() => setHovered(0)}>
        {STARS.map((value) => (
          <label
            key={value}
            className={styles.starLabel}
            onMouseEnter={() => setHovered(value)}
          >
            <input
              type="radio"
              name={name}
              value={value}
              checked={selected === value}
              onChange={() => setSelected(value)}
              required={required}
              className={styles.srOnly}
            />
            <span className={styles.star} aria-hidden="true">
              {active >= value ? '★' : '☆'}
            </span>
            <span className={styles.srOnly}>{value} von 5 Sternen</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
