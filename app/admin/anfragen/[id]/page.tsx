/**
 * Datei: app/admin/anfragen/[id]/page.tsx
 *
 * Zweck: Detail-Ansicht einer Anfrage + Status-Änderung.
 */

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/require-admin'
import StatusChanger from './StatusChanger'

const dateFmt = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

type Props = { params: Promise<{ id: string }> }

export default async function InquiryDetailPage({ params }: Props) {
  await requireAdmin()
  const { id } = await params

  const item = await prisma.inquiry.findUnique({ where: { id } })
  if (!item) notFound()

  const fields: Array<{ label: string; value: string | null }> = [
    { label: 'Name', value: item.name },
    { label: 'E-Mail', value: item.email },
    { label: 'Unternehmenstyp', value: item.companyType },
    { label: 'Was soll das Tool lösen?', value: item.description },
    { label: 'Wer soll es nutzen?', value: item.targetUsers },
    { label: 'Wichtige Funktionen', value: item.features },
    { label: 'Beispiele / bestehende Tools', value: item.examples },
    { label: 'Budget', value: item.budget },
    { label: 'Zeitrahmen', value: item.timeline },
  ]

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/admin/anfragen" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
          ← Zurück zur Anfragenliste
        </Link>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '8px' }}>
          Anfrage von {item.name}
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          {dateFmt.format(item.createdAt)} · ID: {id}
        </p>
      </div>

      {/* Status */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)', padding: '20px 24px', boxShadow: 'var(--shadow-card)',
        marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Status:</span>
        <StatusChanger id={item.id} currentStatus={item.status} />
      </div>

      {/* Felder */}
      <div style={{
        backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)', padding: '24px', boxShadow: 'var(--shadow-card)',
      }}>
        {fields.map((f) => (
          <div key={f.label} style={{ marginBottom: '18px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
              {f.label}
            </p>
            <p style={{ fontSize: '14px', color: f.value ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {f.value || '–'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
