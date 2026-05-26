/**
 * Datei: app/admin/tags/page.tsx
 *
 * Zweck: Liste aller TagGroups mit ihren Tags im Admin-Bereich.
 * Tags sind in Gruppen organisiert (z.B. "Features", "Zielgruppe").
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { parsePageParams, PAGE_SIZE } from '@/lib/utils/pagination'
import Pagination from '@/components/admin/Pagination'

type Props = { searchParams: Promise<{ page?: string }> }

export default async function AdminTagsPage({ searchParams }: Props) {
  const { page, skip, take } = parsePageParams(await searchParams)

  const [tagGroups, total, totalTags] = await Promise.all([
    prisma.tagGroup.findMany({
      include: {
        tags: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { sortOrder: 'asc' },
      skip,
      take,
    }),
    prisma.tagGroup.count(),
    prisma.tag.count(),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (page > totalPages) redirect(`/admin/tags?page=${totalPages}`)

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '28px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            marginBottom: '4px',
          }}>
            Tags
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {total} Gruppen · {totalTags} Tags gesamt
          </p>
        </div>
        <Link
          href="/admin/tags/neu"
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--color-cta)',
            color: 'white',
            borderRadius: 'var(--radius-btn)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          + Tag anlegen
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {tagGroups.length === 0 ? (
          <div style={{
            backgroundColor: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '40px',
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
            fontSize: '14px',
          }}>
            Noch keine Tags vorhanden.
          </div>
        ) : (
          tagGroups.map((group) => (
            <div
              key={group.id}
              style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-card)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                backgroundColor: 'var(--color-bg)',
                borderBottom: '1px solid var(--color-border)',
              }}>
                <div>
                  <p style={{ fontWeight: '700', fontSize: '15px', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                    {group.name}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                    {group.slug} · {group.tags.length} Tags
                  </p>
                </div>
                <Link
                  href={`/admin/tags/${group.id}`}
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'none',
                    padding: '6px 12px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-btn)',
                  }}
                >
                  Bearbeiten
                </Link>
              </div>

              <div style={{ padding: '16px 20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {group.tags.length === 0 ? (
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    Keine Tags in dieser Gruppe.
                  </span>
                ) : (
                  group.tags.map((tag) => (
                    <span
                      key={tag.id}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: 'var(--color-badge-bg)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '20px',
                        fontSize: '13px',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                      {tag.name}
                    </span>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/tags" />
    </div>
  )
}
