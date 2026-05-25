/**
 * Datei: components/admin/ScreenshotUpload.tsx
 *
 * Zweck: Screenshot-Upload-Widget für die Tool-Bearbeitungsseite.
 * Sendet die Datei per Server Action (uploadToolScreenshot) — der Upload läuft
 * serverseitig mit Service Role Key, wodurch RLS-Probleme vermieden werden.
 *
 * Wichtig:
 * - Kein direkter Supabase-Client im Browser — kein RLS-Problem.
 * - Bucket "tool-screenshots" muss in Supabase als public markiert sein.
 * - Pfad-Format: {toolId}/screenshot.{ext} — wird per upsert überschrieben.
 * - Nur PNG und JPG erlaubt, max. 3 MB.
 */

'use client'

import { useRef, useState, useEffect, useActionState } from 'react'
import { uploadToolScreenshot, type ScreenshotActionState } from '@/app/admin/tools/screenshot-action'

const BUCKET_NAME = 'tool-screenshots'

type Props = {
  toolId: string
  currentScreenshotUrl: string | null
}

export default function ScreenshotUpload({ toolId, currentScreenshotUrl }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentScreenshotUrl)
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef  = useRef<HTMLFormElement>(null)

  const boundAction = uploadToolScreenshot.bind(null, toolId)
  const [state, formAction, isPending] = useActionState<ScreenshotActionState, FormData>(boundAction, {})

  useEffect(() => {
    if (state.publicUrl) {
      setPreviewUrl(state.publicUrl)
      if (inputRef.current) inputRef.current.value = ''
    }
  }, [state.publicUrl])

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
          Screenshot
        </p>
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          PNG oder JPG · max. 3 MB · Supabase Bucket: {BUCKET_NAME}
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
            width: '240px',
            height: '140px',
            borderRadius: '8px',
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
                alt="Screenshot Vorschau"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Kein Screenshot</span>
            )}
          </div>

          {/* Aktionen */}
          <div>
            <input
              ref={inputRef}
              id={`screenshot-input-${toolId}`}
              type="file"
              name="screenshot"
              accept="image/png,image/jpeg"
              onChange={handleFileChange}
              disabled={isPending}
              style={{ display: 'none' }}
            />
            <label
              htmlFor={`screenshot-input-${toolId}`}
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
              {isPending ? 'Wird hochgeladen…' : previewUrl ? 'Screenshot ersetzen' : 'Screenshot hochladen'}
            </label>

            {!isPending && state.publicUrl && (
              <p style={{ fontSize: '12px', color: 'var(--color-success-text)', marginTop: '8px' }}>
                ✓ Screenshot gespeichert
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
