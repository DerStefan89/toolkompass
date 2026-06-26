/**
 * Datei: app/admin/anfragen/[id]/StatusChanger.tsx
 *
 * Zweck: Client-Komponente zum Ändern des Anfrage-Status (Select + Submit).
 */

'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateInquiryStatus } from '@/app/admin/anfragen/actions'

export default function StatusChanger({ id, currentStatus }: { id: string; currentStatus: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', id)
      fd.set('status', e.target.value)
      const res = await updateInquiryStatus(fd)
      if (res.error) alert(res.error)
      else router.refresh()
    })
  }

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      style={{
        padding: '7px 12px', fontSize: '13px', fontWeight: 600,
        border: '1px solid var(--color-border)', borderRadius: 'var(--radius-btn)',
        backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-primary)',
        cursor: isPending ? 'not-allowed' : 'pointer',
      }}
    >
      <option value="neu">Neu</option>
      <option value="beantwortet">Beantwortet</option>
      <option value="abgelehnt">Abgelehnt</option>
    </select>
  )
}
