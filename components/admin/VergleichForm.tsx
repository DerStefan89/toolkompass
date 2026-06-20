/**
 * Datei: components/admin/VergleichForm.tsx
 *
 * Zweck: Gemeinsames Formular-Client-Component für Vergleich-Erstellen und -Bearbeiten.
 *
 * Wichtig:
 * - Tool A und Tool B sind kontrollierte Selects, weil der Slug auto-generiert wird
 *   und Tool B die gewählte Tool-A-Option ausfiltert.
 * - Dynamische Listen (rows, decisionGuide, targetGroups, features, sections,
 *   alternatives) werden in React-State verwaltet und beim Submit als parallele
 *   Arrays übertragen (gleicher name = eine Spalte; gleicher Index = eine Zeile).
 * - published ist kontrolliert (Checkbox-Reset-Bug nach Validation-Fehler).
 * - Einfache Textfelder (verdict, title, subtitle, keyDifference) sind unkontrolliert
 *   (defaultValue) — kein programmatischer Zugriff nötig.
 * - Kein Prisma-Import — Daten kommen via Props.
 */

'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import type { ActionState } from '@/lib/types/admin'

// ─── Typen ──────────────────────────────────────────────────────────────────

export type ToolOption = {
  id: string
  name: string
  slug: string
}

type RowData = {
  key: string
  criterion: string
  toolAValue: string
  toolBValue: string
}

type FeatureData = {
  key: string
  feature: string
  toolAValue: string
  toolBValue: string
}

type SectionData = {
  key: string
  heading: string
  content: string
}

type AlternativeData = {
  key: string
  toolId: string
  reason: string
}

type FaqData = {
  key: string
  question: string
  answer: string
}

type KStr = { key: string; value: string }

export type VergleichFormDefaults = {
  toolAId: string
  toolBId: string
  slug: string
  verdict: string
  published: boolean
  rows: Array<{ criterion: string; toolAValue: string; toolBValue: string }>
  // V2 — neue, optionale Felder
  title?: string | null
  subtitle?: string | null
  keyDifference?: string | null
  decisionGuide?: { toolA: string[]; toolB: string[]; alternatives: string[] } | null
  targetGroups?: { toolA: string[]; toolB: string[] } | null
  sections?: Array<{ heading: string; content: string }>
  features?: Array<{ feature: string; toolAValue: string; toolBValue: string }>
  alternatives?: Array<{ toolId: string; reason: string }>
  faqItems?: Array<{ question: string; answer: string }>
}

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>
  tools: ToolOption[]
  defaultValues?: VergleichFormDefaults
}

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

function genSlug(toolAId: string, toolBId: string, tools: ToolOption[]): string {
  const a = tools.find(t => t.id === toolAId)?.slug ?? ''
  const b = tools.find(t => t.id === toolBId)?.slug ?? ''
  return a && b ? `${a}-vs-${b}` : ''
}

let keyCounter = 0
function nextKey(): string {
  keyCounter += 1
  return `k${keyCounter}-${Date.now()}`
}

function toKStr(values?: string[]): KStr[] {
  return (values ?? []).map(value => ({ key: nextKey(), value }))
}

// ─── Unterkomponenten ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{
        fontSize: '13px',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--color-text-secondary)',
        marginBottom: '16px',
        paddingBottom: '8px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {children}
      </div>
    </div>
  )
}

function Field({
  label, hint, error, required, children,
}: {
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        marginBottom: '6px',
        color: 'var(--color-text-primary)',
      }}>
        {label}
        {required && <span style={{ color: 'var(--color-error)', marginLeft: '2px' }}>*</span>}
      </label>
      {children}
      {error ? (
        <p style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '4px' }}>{error}</p>
      ) : hint ? (
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{hint}</p>
      ) : null}
    </div>
  )
}

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '8px 12px',
    border: `1px solid ${hasError ? 'var(--color-error)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-btn)',
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-bg-card)',
    boxSizing: 'border-box',
    outline: 'none',
  }
}

const removeBtnStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent',
  border: '1px solid var(--color-error)',
  borderRadius: 'var(--radius-btn)',
  color: 'var(--color-error)',
  fontSize: '16px',
  cursor: 'pointer',
  flexShrink: 0,
}

const addBtnStyle: React.CSSProperties = {
  alignSelf: 'flex-start',
  padding: '7px 16px',
  backgroundColor: 'transparent',
  color: 'var(--color-text-secondary)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-btn)',
  fontSize: '13px',
  cursor: 'pointer',
}

/** Dynamische Liste einfacher Strings — alle Inputs teilen denselben name. */
function StringList({
  label, name, items, setItems, placeholder,
}: {
  label: string
  name: string
  items: KStr[]
  setItems: React.Dispatch<React.SetStateAction<KStr[]>>
  placeholder: string
}) {
  return (
    <div>
      <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
        {label}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map(it => (
          <div key={it.key} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              name={name}
              value={it.value}
              onChange={e => setItems(prev => prev.map(x => x.key === it.key ? { ...x, value: e.target.value } : x))}
              placeholder={placeholder}
              style={inputStyle(false)}
            />
            <button type="button" onClick={() => setItems(prev => prev.filter(x => x.key !== it.key))} title="Entfernen" style={removeBtnStyle}>×</button>
          </div>
        ))}
        <button type="button" onClick={() => setItems(prev => [...prev, { key: nextKey(), value: '' }])} style={addBtnStyle}>
          + Eintrag hinzufügen
        </button>
      </div>
    </div>
  )
}

// ─── Haupt-Komponente ────────────────────────────────────────────────────────

export default function VergleichForm({ action, tools, defaultValues }: Props) {
  const [state, formAction, isPending] = useActionState(action, {})

  const [toolAId, setToolAId] = useState(defaultValues?.toolAId ?? '')
  const [toolBId, setToolBId] = useState(defaultValues?.toolBId ?? '')
  const [slug, setSlug] = useState(defaultValues?.slug ?? '')
  const [slugIsManual, setSlugIsManual] = useState(!!defaultValues)
  const [published, setPublished] = useState(defaultValues?.published ?? false)
  const [rows, setRows] = useState<RowData[]>(
    defaultValues?.rows.map((r, i) => ({ key: String(i), ...r })) ?? []
  )

  // V2-State
  const [dgToolA, setDgToolA] = useState<KStr[]>(toKStr(defaultValues?.decisionGuide?.toolA))
  const [dgToolB, setDgToolB] = useState<KStr[]>(toKStr(defaultValues?.decisionGuide?.toolB))
  const [dgAlt, setDgAlt]     = useState<KStr[]>(toKStr(defaultValues?.decisionGuide?.alternatives))
  const [tgToolA, setTgToolA] = useState<KStr[]>(toKStr(defaultValues?.targetGroups?.toolA))
  const [tgToolB, setTgToolB] = useState<KStr[]>(toKStr(defaultValues?.targetGroups?.toolB))

  const [features, setFeatures] = useState<FeatureData[]>(
    defaultValues?.features?.map((f, i) => ({ key: `f${i}`, ...f })) ?? []
  )
  const [sections, setSections] = useState<SectionData[]>(
    defaultValues?.sections?.map((s, i) => ({ key: `s${i}`, ...s })) ?? []
  )
  const [alternatives, setAlternatives] = useState<AlternativeData[]>(
    defaultValues?.alternatives?.map((a, i) => ({ key: `a${i}`, ...a })) ?? []
  )
  const [faqs, setFaqs] = useState<FaqData[]>(
    defaultValues?.faqItems?.map((f, i) => ({ key: `q${i}`, ...f })) ?? []
  )

  function handleToolAChange(id: string) {
    setToolAId(id)
    if (!slugIsManual) setSlug(genSlug(id, toolBId, tools))
  }

  function handleToolBChange(id: string) {
    setToolBId(id)
    if (!slugIsManual) setSlug(genSlug(toolAId, id, tools))
  }

  function addRow() {
    setRows(prev => [...prev, { key: nextKey(), criterion: '', toolAValue: '', toolBValue: '' }])
  }
  function removeRow(key: string) {
    setRows(prev => prev.filter(r => r.key !== key))
  }
  function updateRow(key: string, field: keyof Omit<RowData, 'key'>, value: string) {
    setRows(prev => prev.map(r => r.key === key ? { ...r, [field]: value } : r))
  }

  function addFeature() {
    setFeatures(prev => [...prev, { key: nextKey(), feature: '', toolAValue: '', toolBValue: '' }])
  }
  function removeFeature(key: string) {
    setFeatures(prev => prev.filter(f => f.key !== key))
  }
  function updateFeature(key: string, field: keyof Omit<FeatureData, 'key'>, value: string) {
    setFeatures(prev => prev.map(f => f.key === key ? { ...f, [field]: value } : f))
  }

  function addSection() {
    setSections(prev => [...prev, { key: nextKey(), heading: '', content: '' }])
  }
  function removeSection(key: string) {
    setSections(prev => prev.filter(s => s.key !== key))
  }
  function updateSection(key: string, field: keyof Omit<SectionData, 'key'>, value: string) {
    setSections(prev => prev.map(s => s.key === key ? { ...s, [field]: value } : s))
  }

  function addAlternative() {
    setAlternatives(prev => [...prev, { key: nextKey(), toolId: '', reason: '' }])
  }
  function removeAlternative(key: string) {
    setAlternatives(prev => prev.filter(a => a.key !== key))
  }
  function updateAlternative(key: string, field: keyof Omit<AlternativeData, 'key'>, value: string) {
    setAlternatives(prev => prev.map(a => a.key === key ? { ...a, [field]: value } : a))
  }

  function addFaq() {
    setFaqs(prev => [...prev, { key: nextKey(), question: '', answer: '' }])
  }
  function removeFaq(key: string) {
    setFaqs(prev => prev.filter(f => f.key !== key))
  }
  function updateFaq(key: string, field: keyof Omit<FaqData, 'key'>, value: string) {
    setFaqs(prev => prev.map(f => f.key === key ? { ...f, [field]: value } : f))
  }

  const fe = state.fieldErrors ?? {}

  const toolAName = tools.find(t => t.id === toolAId)?.name ?? 'Tool A'
  const toolBName = tools.find(t => t.id === toolBId)?.name ?? 'Tool B'

  const headerCellStyle: React.CSSProperties = {
    fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)',
    textTransform: 'uppercase', letterSpacing: '0.04em',
  }

  return (
    <form action={formAction}>

      {/* Allgemeiner Fehler */}
      {state.error && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '24px',
          backgroundColor: 'var(--color-error-bg)',
          border: '1px solid var(--color-error-border)',
          borderRadius: 'var(--radius-card)',
          color: 'var(--color-error)',
          fontSize: '14px',
        }}>
          {state.error}
        </div>
      )}

      {/* ── Verglichene Tools ── */}
      <Section title="Verglichene Tools">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          <Field label="Tool A" required error={fe.toolAId}>
            <select
              name="toolAId"
              value={toolAId}
              onChange={e => handleToolAChange(e.target.value)}
              style={inputStyle(!!fe.toolAId)}
            >
              <option value="">— Tool wählen —</option>
              {tools.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Tool B" required error={fe.toolBId}>
            <select
              name="toolBId"
              value={toolBId}
              onChange={e => handleToolBChange(e.target.value)}
              style={inputStyle(!!fe.toolBId)}
            >
              <option value="">— Tool wählen —</option>
              {tools.filter(t => t.id !== toolAId).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>

        </div>
      </Section>

      {/* ── Basisdaten ── */}
      <Section title="Basisdaten">

        <Field
          label="Slug"
          required
          hint="URL-Kennung — wird automatisch aus den Tool-Slugs generiert"
          error={fe.slug}
        >
          <input
            type="text"
            name="slug"
            value={slug}
            onChange={e => { setSlug(e.target.value); setSlugIsManual(true) }}
            placeholder="z. B. notion-vs-obsidian"
            style={{ ...inputStyle(!!fe.slug), fontFamily: 'monospace', fontSize: '13px' }}
          />
        </Field>

        <Field label="Titel" hint="Artikel-Titel (optional), z. B. „Lexware Office vs sevdesk“">
          <input
            type="text"
            name="title"
            defaultValue={defaultValues?.title ?? ''}
            placeholder="z. B. Lexware Office vs sevdesk: Welche Buchhaltung passt besser?"
            style={inputStyle(false)}
          />
        </Field>

        <Field label="Untertitel" hint="Kurzer Teaser (optional)">
          <input
            type="text"
            name="subtitle"
            defaultValue={defaultValues?.subtitle ?? ''}
            placeholder="z. B. Zwei beliebte Buchhaltungstools im direkten Vergleich"
            style={inputStyle(false)}
          />
        </Field>

      </Section>

      {/* ── Fazit & Kernunterschied ── */}
      <Section title="Fazit & Kernunterschied">

        <Field
          label="Kurzfazit (Verdict)"
          required
          hint="Markdown erlaubt — abschließende Empfehlung für den Leser"
          error={fe.verdict}
        >
          <textarea
            name="verdict"
            defaultValue={defaultValues?.verdict ?? ''}
            placeholder="Welches Tool empfehlen wir und für wen? …"
            rows={6}
            style={{ ...inputStyle(!!fe.verdict), resize: 'vertical' }}
          />
        </Field>

        <Field
          label="Der wichtigste Unterschied"
          hint="Ein hervorgehobener Callout (optional)"
        >
          <textarea
            name="keyDifference"
            defaultValue={defaultValues?.keyDifference ?? ''}
            placeholder="z. B. Lexware Office punktet bei DATEV-Anbindung, sevdesk bei der Bedienung."
            rows={3}
            style={{ ...inputStyle(false), resize: 'vertical' }}
          />
        </Field>

      </Section>

      {/* ── Schnelle Entscheidung ── */}
      <Section title="Schnelle Entscheidung">
        <StringList label={`Nimm ${toolAName}, wenn …`} name="dgToolA" items={dgToolA} setItems={setDgToolA} placeholder="z. B. du DATEV-Export brauchst" />
        <StringList label={`Nimm ${toolBName}, wenn …`} name="dgToolB" items={dgToolB} setItems={setDgToolB} placeholder="z. B. dir einfache Bedienung wichtig ist" />
        <StringList label="Schau dir Alternativen an, wenn …" name="dgAlt" items={dgAlt} setItems={setDgAlt} placeholder="z. B. du Zeiterfassung brauchst" />
      </Section>

      {/* ── Vergleichszeilen ── */}
      <Section title="Vergleichszeilen">

        {rows.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 36px', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
            <span style={headerCellStyle}>Kriterium</span>
            <span style={headerCellStyle}>{toolAName}</span>
            <span style={headerCellStyle}>{toolBName}</span>
            <span />
          </div>
        )}

        {rows.map(row => (
          <div key={row.key} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 36px', gap: '8px', alignItems: 'center' }}>
            <input type="text" name="criterion" value={row.criterion} onChange={e => updateRow(row.key, 'criterion', e.target.value)} placeholder="z. B. Preis" style={inputStyle(false)} />
            <input type="text" name="toolAValue" value={row.toolAValue} onChange={e => updateRow(row.key, 'toolAValue', e.target.value)} placeholder="Wert für Tool A" style={inputStyle(false)} />
            <input type="text" name="toolBValue" value={row.toolBValue} onChange={e => updateRow(row.key, 'toolBValue', e.target.value)} placeholder="Wert für Tool B" style={inputStyle(false)} />
            <button type="button" onClick={() => removeRow(row.key)} title="Zeile entfernen" style={removeBtnStyle}>×</button>
          </div>
        ))}

        <button type="button" onClick={addRow} style={addBtnStyle}>+ Zeile hinzufügen</button>

      </Section>

      {/* ── Funktionscheck ── */}
      <Section title="Funktionscheck (Ja / Nein / Einschränkung)">

        {features.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 36px', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
            <span style={headerCellStyle}>Funktion</span>
            <span style={headerCellStyle}>{toolAName}</span>
            <span style={headerCellStyle}>{toolBName}</span>
            <span />
          </div>
        )}

        {features.map(f => (
          <div key={f.key} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 36px', gap: '8px', alignItems: 'center' }}>
            <input type="text" name="featureName" value={f.feature} onChange={e => updateFeature(f.key, 'feature', e.target.value)} placeholder="z. B. E-Rechnungen erstellen" style={inputStyle(false)} />
            <input type="text" name="featureToolA" value={f.toolAValue} onChange={e => updateFeature(f.key, 'toolAValue', e.target.value)} placeholder="z. B. Ja" style={inputStyle(false)} />
            <input type="text" name="featureToolB" value={f.toolBValue} onChange={e => updateFeature(f.key, 'toolBValue', e.target.value)} placeholder="z. B. Ja, eingeschränkt" style={inputStyle(false)} />
            <button type="button" onClick={() => removeFeature(f.key)} title="Zeile entfernen" style={removeBtnStyle}>×</button>
          </div>
        ))}

        <button type="button" onClick={addFeature} style={addBtnStyle}>+ Funktion hinzufügen</button>

      </Section>

      {/* ── Textabschnitte ── */}
      <Section title="Textabschnitte">

        {sections.map(s => (
          <div key={s.key} style={{
            display: 'flex', flexDirection: 'column', gap: '8px',
            padding: '12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-btn)',
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" name="sectionHeading" value={s.heading} onChange={e => updateSection(s.key, 'heading', e.target.value)} placeholder="Überschrift, z. B. „Wann Lexware Office besser passt“" style={inputStyle(false)} />
              <button type="button" onClick={() => removeSection(s.key)} title="Abschnitt entfernen" style={removeBtnStyle}>×</button>
            </div>
            <textarea name="sectionContent" value={s.content} onChange={e => updateSection(s.key, 'content', e.target.value)} placeholder="Fließtext (Markdown erlaubt) …" rows={4} style={{ ...inputStyle(false), resize: 'vertical' }} />
          </div>
        ))}

        <button type="button" onClick={addSection} style={addBtnStyle}>+ Abschnitt hinzufügen</button>

      </Section>

      {/* ── Für wen ── */}
      <Section title="Für wen ist welches Tool die bessere Wahl?">
        <StringList label={`${toolAName} ist ideal für …`} name="tgToolA" items={tgToolA} setItems={setTgToolA} placeholder="z. B. Steuerberater-affine Selbstständige" />
        <StringList label={`${toolBName} ist ideal für …`} name="tgToolB" items={tgToolB} setItems={setTgToolB} placeholder="z. B. Gründer ohne Buchhaltungs-Vorkenntnisse" />
      </Section>

      {/* ── Alternativen ── */}
      <Section title="Alternativen">

        {alternatives.map(a => (
          <div key={a.key} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 36px', gap: '8px', alignItems: 'center' }}>
            <select name="altToolId" value={a.toolId} onChange={e => updateAlternative(a.key, 'toolId', e.target.value)} style={inputStyle(false)}>
              <option value="">— Tool wählen —</option>
              {tools.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <input type="text" name="altReason" value={a.reason} onChange={e => updateAlternative(a.key, 'reason', e.target.value)} placeholder="z. B. wenn du Zeiterfassung brauchst" style={inputStyle(false)} />
            <button type="button" onClick={() => removeAlternative(a.key)} title="Alternative entfernen" style={removeBtnStyle}>×</button>
          </div>
        ))}

        <button type="button" onClick={addAlternative} style={addBtnStyle}>+ Alternative hinzufügen</button>

      </Section>

      {/* ── Häufige Fragen ── */}
      <Section title="Häufige Fragen">

        {faqs.map(f => (
          <div key={f.key} style={{
            display: 'flex', flexDirection: 'column', gap: '8px',
            padding: '12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-btn)',
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" name="faqQuestion" value={f.question} onChange={e => updateFaq(f.key, 'question', e.target.value)} placeholder="Frage, z. B. „Welches Tool ist günstiger?“" style={inputStyle(false)} />
              <button type="button" onClick={() => removeFaq(f.key)} title="Frage entfernen" style={removeBtnStyle}>×</button>
            </div>
            <textarea name="faqAnswer" value={f.answer} onChange={e => updateFaq(f.key, 'answer', e.target.value)} placeholder="Antwort (einfacher Text) …" rows={3} style={{ ...inputStyle(false), resize: 'vertical' }} />
          </div>
        ))}

        <button type="button" onClick={addFaq} style={addBtnStyle}>+ Frage hinzufügen</button>

      </Section>

      {/* ── Optionen ── */}
      <Section title="Optionen">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            name="published"
            checked={published}
            onChange={e => setPublished(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          Veröffentlicht (sichtbar auf der Plattform)
        </label>
      </Section>

      {/* ── Submit ── */}
      <div style={{ display: 'flex', gap: '12px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '10px 24px',
            backgroundColor: isPending ? 'var(--color-text-secondary)' : 'var(--color-cta)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-btn)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}
        >
          {isPending ? 'Wird gespeichert…' : 'Speichern'}
        </button>

        <Link
          href="/admin/vergleiche"
          style={{
            padding: '10px 20px',
            backgroundColor: 'transparent',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-btn)',
            fontSize: '14px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Abbrechen
        </Link>
      </div>

    </form>
  )
}
