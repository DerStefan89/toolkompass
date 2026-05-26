/**
 * Datei: components/admin/LogoUpload.tsx
 *
 * Zweck: Logo-Upload-Widget für die Tool-Bearbeitungsseite.
 * Sendet die Datei per Server Action (uploadToolLogo) — der Upload läuft
 * serverseitig mit Service Role Key, wodurch RLS-Probleme vermieden werden.
 *
 * Wichtig:
 * - Kein direkter Supabase-Client im Browser — kein RLS-Problem.
 * - Bucket "tool-logos" muss in Supabase als public markiert sein.
 * - Pfad-Format: {toolId}/logo.{ext} — wird per upsert überschrieben.
 * - Nur PNG, JPG und SVG erlaubt, max. 1 MB.
 */

'use client'

import { useRef, useState, useEffect, useActionState } from 'react'
import { uploadToolLogo, type LogoActionState } from '@/app/admin/tools/logo-action'

const BUCKET_NAME = 'tool-logos'

type Props = {
  toolId: string
  currentLogoUrl: string | null
}

export default function LogoUpload({ toolId, currentLogoUrl }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl)
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef  = useRef<HTMLFormElement>(null)

  // toolId vorab binden, damit useActionState die generische Signatur erhält
  const boundAction = uploadToolLogo.bind(null, toolId)
  const [state, formAction, isPending] = useActionState<LogoActionState, FormData>(boundAction, {})

  useEffect(() => {
    if (state.publicUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(state.publicUrl)
      if (inputRef.current) inputRef.current.value = ''
    }
  }, [state.publicUrl])

  // Datei ausgewählt → Formular sofort absenden
  function handleFileChange() {
    formRef.current?.requestSubmit()
  }

  return (
    <div style={{
      marginTop: '24px',
      backgroundColor: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg)',
      }}>
        <p style={{ fontWeight: '700', fontSize: '15px', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
          Logo
        </p>
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          PNG, JPG oder SVG · max. 1 MB · Supabase Bucket: {BUCKET_NAME}
        </p>
      </div>

      {/* Body */}
      <form ref={formRef} action={formAction}>
        <div style={{
          padding: '20px 24px',
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
        }}>

          {/* Vorschau */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-badge-bg)',
            overflow: 'hidden',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Logo Vorschau"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <span style={{ fontSize: '28px' }}>🖼</span>
            )}
          </div>

          {/* Aktionen */}
          <div>
            {/* Versteckter File-Input — Trigger ist das Label */}
            <input
              ref={inputRef}
              id={`logo-input-${toolId}`}
              type="file"
              name="logo"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={handleFileChange}
              disabled={isPending}
              style={{ display: 'none' }}
            />
            <label
              htmlFor={`logo-input-${toolId}`}
              style={{
                display: 'inline-block',
                padding: '7px 16px',
                backgroundColor: isPending ? 'var(--color-text-secondary)' : 'var(--color-cta)',
                color: 'white',
                borderRadius: 'var(--radius-btn)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {isPending ? 'Wird hochgeladen…' : previewUrl ? 'Logo ersetzen' : 'Logo hochladen'}
            </label>

            {!isPending && state.publicUrl && (
              <p style={{ fontSize: '12px', color: 'var(--color-success-text)', marginTop: '8px' }}>
                ✓ Logo gespeichert
              </p>
            )}
            {!isPending && state.error && (
              <p style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '8px' }}>
                {state.error}
              </p>
            )}
            {previewUrl && (
              <p style={{
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                marginTop: '6px',
                maxWidth: '320px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {previewUrl}
              </p>
            )}
          </div>

        </div>
      </form>
    </div>
  )
}
