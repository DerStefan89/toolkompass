/**
 * Datei: app/admin/anfragen/page.tsx
 *
 * Zweck: Admin-Übersicht aller Tool-Entwicklungs-Anfragen.
 * Status-Filter: Alle / Neu / Beantwortet / Abgelehnt (URL-basiert).
 */

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth/require-admin'
import { parsePageParams, PAGE_SIZE } from '@/lib/utils/pagination'
import Pagination from '@/components/admin/Pagination'
import styles from './page.module.css'

type Status = 'alle' | 'neu' | 'beantwortet' | 'abgelehnt'
const TABS: { value: Status; label: string }[] = [
  { value: 'alle', label: 'Alle' },
  { value: 'neu', label: 'Neu' },
  { value: 'beantwortet', label: 'Beantwortet' },
  { value: 'abgelehnt', label: 'Abgelehnt' },
]

const dateFmt = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

type Props = { searchParams: Promise<{ page?: string; status?: string }> }

export default async function AdminAnfragenPage({ searchParams }: Props) {
  await requireAdmin()
  const sp = await searchParams
  const status: Status = (sp.status as Status) ?? 'alle'
  const { page, skip, take } = parsePageParams(sp)

  const where = status === 'alle' ? {} : { status }

  const [items, total] = await Promise.all([
    prisma.inquiry.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.inquiry.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (page > totalPages) redirect(`/admin/anfragen?status=${status}&page=${totalPages}`)

  return (
    <div>
      <h1 className={styles.title}>Anfragen</h1>
      <p className={styles.subtitle}>{total} {total === 1 ? 'Anfrage' : 'Anfragen'}</p>

      {/* Filter-Tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <a
            key={tab.value}
            href={`/admin/anfragen?status=${tab.value}`}
            className={`${styles.tab} ${tab.value === status ? styles.tabActive : ''}`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>Keine Anfragen{status !== 'alle' ? ` mit Status "${status}"` : ''}.</p>
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <a key={item.id} href={`/admin/anfragen/${item.id}`} className={styles.row}>
              <span className={styles.rowName}>{item.name}</span>
              <span className={styles.rowEmail}>{item.email}</span>
              <span className={styles.rowType}>{item.companyType ?? '–'}</span>
              <span className={styles.rowBudget}>{item.budget ?? '–'}</span>
              <span className={item.status === 'neu' ? styles.badgeNeu : item.status === 'beantwortet' ? styles.badgeOk : styles.badgeAbg}>
                {item.status}
              </span>
              <span className={styles.rowDate}>{dateFmt.format(item.createdAt)}</span>
            </a>
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} basePath={`/admin/anfragen?status=${status}`} />
    </div>
  )
}
