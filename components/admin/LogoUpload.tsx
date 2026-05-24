/**
 * Datei: components/admin/LogoUpload.tsx
 *
 * Zweck: Logo-Upload-Widget für die Tool-Bearbeitungsseite.
 * Lädt das Bild direkt aus dem Browser in den Supabase-Storage-Bucket "tool-logos"
 * und speichert die resultierende Public-URL via Server Action in der DB.
 *
 * Wichtig:
 * - Upload läuft vollständig client-seitig (kein Durchlaufen des Next.js-Servers).
 * - Der Bucket "tool-logos" muss in Supabase als public markiert sein,
 *   damit getPublicUrl() eine aufrufbare URL liefert.
 * - Pfad-Format im Bucket: {toolId}/logo.{ext} — wird per upsert überschrieben.
 * - Nur PNG, JPG und SVG erlaubt, max. 1 MB.
 */

'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateToolLogo } from '@/app/admin/tools/logo-action'

const MAX_BYTES   = 1 * 1024 * 1024 // 1 MB
const ACCEPTED    = ['image/png', 'image/jpeg', 'image/svg+xml']
const BUCKET_NAME = 'tool-logos'

type Props = {
  toolId: string
  currentLogoUrl: string | null
}

type Status = 'idle' | 'uploading' | 'success' | 'error'

export default function LogoUpload({ toolId, currentLogoUrl }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl)
  const [status, setStatus]         = useState<Status>('idle')
  const [errorMsg, setErrorMsg]     = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-seitige Validierung vor dem Upload
    if (!ACCEPTED.includes(file.type)) {
      setErrorMsg('Nur PNG, JPG und SVG sind erlaubt.')
      setStatus('error')
      return
    }
    if (file.size > MAX_BYTES) {
      setErrorMsg('Die Datei ist größer als 1 MB.')
      setStatus('error')
      return
    }

    setStatus('uploading')
    setErrorMsg('')

    const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'png'
    const path = `${toolId}/logo.${ext}`

    // Upload direkt vom Browser in den Supabase Storage Bucket
    const supabase = createClient()
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      setErrorMsg(`Upload fehlgeschlagen: ${uploadError.message}`)
      setStatus('error')
      return
    }

    // Public-URL aus dem Bucket lesen
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path)

    // URL in der DB persistieren (Server Action)
    const result = await updateToolLogo(toolId, publicUrl)
    if (result.error) {
      setErrorMsg(result.error)
      setStatus('error')
      return
    }

    setPreviewUrl(publicUrl)
    setStatus('success')
    // Input zurücksetzen, damit dieselbe Datei erneut hochgeladen werden kann
    if (inputRef.current) inputRef.current.value = ''
  }

  const isUploading = status === 'uploading'

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
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={handleFileChange}
            disabled={isUploading}
            style={{ display: 'none' }}
          />
          <label
            htmlFor={`logo-input-${toolId}`}
            style={{
              display: 'inline-block',
              padding: '7px 16px',
              backgroundColor: isUploading ? 'var(--color-text-secondary)' : 'var(--color-cta)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-btn)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: isUploading ? 'not-allowed' : 'pointer',
            }}
          >
            {isUploading ? 'Wird hochgeladen…' : previewUrl ? 'Logo ersetzen' : 'Logo hochladen'}
          </label>

          {status === 'success' && (
            <p style={{ fontSize: '12px', color: 'var(--color-success-text)', marginTop: '8px' }}>
              ✓ Logo gespeichert
            </p>
          )}
          {status === 'error' && (
            <p style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '8px' }}>
              {errorMsg}
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
    </div>
  )
}
