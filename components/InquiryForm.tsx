/**
 * Datei: components/InquiryForm.tsx
 *
 * Zweck: Anfrageformular für Tool-Entwicklung auf /entwickeln.
 * Sendet parallel an Formspree (E-Mail) und eigene API (DB).
 * Client Component wegen useState/Interaktion.
 *
 * Wichtig:
 * - Promise.allSettled: mindestens ein Kanal erfolgreich → Erfolgsmeldung.
 * - Kein Prisma-Import — die API-Route ist die Brücke zur DB.
 */

'use client'

import { useState } from 'react'
import styles from '@/app/entwickeln/page.module.css'

const FORMSPREE = 'https://formspree.io/f/mwvzndgj'

type Status = 'idle' | 'sending' | 'success' | 'error'

export default function InquiryForm() {
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')

    const fd = new FormData(e.currentTarget)
    const payload = {
      type: 'tool-anfrage',
      name: fd.get('name'),
      email: fd.get('email'),
      companyType: fd.get('companyType'),
      description: fd.get('description'),
      targetUsers: fd.get('targetUsers'),
      features: fd.get('features'),
      examples: fd.get('examples'),
      budget: fd.get('budget'),
      timeline: fd.get('timeline'),
    }

    const results = await Promise.allSettled([
      fetch(FORMSPREE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      }),
      fetch('/api/anfrage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    ])

    const anyOk = results.some(
      (r) => r.status === 'fulfilled' && r.value.ok
    )
    setStatus(anyOk ? 'success' : 'error')
  }

  if (status === 'success') {
    return (
      <div className={styles.formSuccess}>
        <p className={styles.formSuccessTitle}>Danke!</p>
        <p className={styles.formSuccessText}>
          Deine Anfrage ist angekommen. Du erhältst innerhalb von 48 Stunden eine erste Einschätzung.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label htmlFor="inq-name" className={styles.formLabel}>Name *</label>
          <input id="inq-name" type="text" name="name" required className={styles.formInput} />
        </div>
        <div className={styles.formField}>
          <label htmlFor="inq-email" className={styles.formLabel}>E-Mail *</label>
          <input id="inq-email" type="email" name="email" required className={styles.formInput} />
        </div>
      </div>

      <div className={styles.formField}>
        <label htmlFor="inq-type" className={styles.formLabel}>Unternehmenstyp</label>
        <select id="inq-type" name="companyType" className={styles.formSelect}>
          <option value="">— bitte wählen —</option>
          <option value="Freelancer">Freelancer</option>
          <option value="Coach">Coach</option>
          <option value="Agentur">Agentur</option>
          <option value="Startup">Startup</option>
          <option value="Anderes">Anderes</option>
        </select>
      </div>

      <div className={styles.formField}>
        <label htmlFor="inq-desc" className={styles.formLabel}>Was soll das Tool lösen? *</label>
        <textarea id="inq-desc" name="description" rows={4} required className={styles.formTextarea} />
      </div>

      <div className={styles.formField}>
        <label htmlFor="inq-users" className={styles.formLabel}>Wer soll das Tool nutzen?</label>
        <textarea id="inq-users" name="targetUsers" rows={2} className={styles.formTextarea} />
      </div>

      <div className={styles.formField}>
        <label htmlFor="inq-feat" className={styles.formLabel}>Welche Funktionen sind wichtig?</label>
        <textarea id="inq-feat" name="features" rows={2} className={styles.formTextarea} />
      </div>

      <div className={styles.formField}>
        <label htmlFor="inq-ex" className={styles.formLabel}>Gibt es Beispiele oder bestehende Tools?</label>
        <textarea id="inq-ex" name="examples" rows={2} className={styles.formTextarea} />
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label htmlFor="inq-budget" className={styles.formLabel}>Budgetrahmen</label>
          <select id="inq-budget" name="budget" className={styles.formSelect}>
            <option value="">— bitte wählen —</option>
            <option value="bis 1.000 €">bis 1.000 €</option>
            <option value="1.000–3.000 €">1.000–3.000 €</option>
            <option value="3.000–5.000 €">3.000–5.000 €</option>
            <option value="über 5.000 €">über 5.000 €</option>
            <option value="noch unklar">noch unklar</option>
          </select>
        </div>
        <div className={styles.formField}>
          <label htmlFor="inq-time" className={styles.formLabel}>Zeitrahmen</label>
          <select id="inq-time" name="timeline" className={styles.formSelect}>
            <option value="">— bitte wählen —</option>
            <option value="so schnell wie möglich">so schnell wie möglich</option>
            <option value="2–4 Wochen">2–4 Wochen</option>
            <option value="flexibel">flexibel</option>
          </select>
        </div>
      </div>

      {status === 'error' && (
        <p className={styles.formError}>
          Etwas ist schiefgelaufen. Bitte versuche es erneut oder schreib direkt an info@toolsucher.de.
        </p>
      )}

      <button type="submit" disabled={status === 'sending'} className={styles.formSubmit}>
        {status === 'sending' ? 'Wird gesendet …' : 'Tool-Idee absenden'}
      </button>
    </form>
  )
}
