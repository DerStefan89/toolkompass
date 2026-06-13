/**
 * Datei: app/tools/[slug]/bewerten/page.tsx
 *
 * Zweck: Geschützte Bewertungsseite — eingeloggter Nutzer bewertet ein Tool.
 * Server Component: lädt Tool, zugewiesene Kriterien und eine evtl. bestehende
 * Bewertung und rendert das RatingForm.
 *
 * Design-Referenz:
 * - design-refs/6 _Tool_bewerten.png (Sterne-Layout, Card, Info-Spalte rechts).
 *   NICHT umgesetzt: Nutzertyp/Persona/Nutzung (kein Datenmodell).
 *
 * Wichtig:
 * - robots: noindex — eingeloggter Bereich.
 * - Gäste werden zum Login mit next=-Rücksprung geleitet.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { getToolBySlug } from '@/lib/data/tools'
import { getToolCriteria, getUserRatingForTool } from '@/lib/data/ratings'
import RatingForm from '@/components/rating/RatingForm'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tool = await getToolBySlug(slug)
  const name = tool?.translations[0]?.name ?? 'Tool'
  return {
    title: `${name} bewerten — ToolSucher`,
    robots: { index: false },
  }
}

export default async function BewertenSeite({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const tool = await getToolBySlug(slug)
  if (!tool || !tool.published) notFound()

  const t = tool.translations[0]
  if (!t) notFound()

  // Auth: Gäste zum Login mit Rücksprung
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/einloggen?next=/tools/${slug}/bewerten`)

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    select: { id: true },
  })
  if (!dbUser) redirect(`/einloggen?next=/tools/${slug}/bewerten`)

  // Zugewiesene Kriterien (optional — Tool kann auch keine haben)
  const criteria = (await getToolCriteria(tool.id)).map((c) => ({ id: c.id, name: c.name }))
  const existingRating = await getUserRatingForTool(dbUser.id, tool.id)

  return (
    <main className={styles.main}>
      {/* Breadcrumb */}
      <p className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>Startseite</Link>
        {' › '}
        <Link href="/kategorien" className={styles.breadcrumbLink}>Tools</Link>
        {' › '}
        <Link href={`/tools/${slug}`} className={styles.breadcrumbLink}>{t.name}</Link>
        {' › '}
        Bewerten
      </p>

      <h1 className={styles.title}>{t.name} bewerten</h1>
      <p className={styles.intro}>
        Teile deine Erfahrung — deine Bewertung hilft anderen bei der Auswahl.
      </p>

      <div className={styles.layout}>
        {/* Formular */}
        <div className={styles.formCard}>
          <RatingForm
            toolId={tool.id}
            slug={tool.slug}
            criteria={criteria}
            existingRating={
              existingRating
                ? {
                    score: existingRating.score,
                    comment: existingRating.comment,
                    scores: existingRating.scores.map((s) => ({
                      criterionId: s.criterionId,
                      score: s.score,
                    })),
                  }
                : null
            }
          />
        </div>

        {/* Info-Spalte */}
        <aside className={styles.aside}>
          <div className={styles.infoCard}>
            <p className={styles.infoTitle}>Was macht eine gute Bewertung aus?</p>
            <ul className={styles.infoList}>
              <li>Konkret statt pauschal</li>
              <li>Stärken und Schwächen nennen</li>
              <li>Fair und sachlich bleiben</li>
            </ul>
          </div>
          <div className={styles.infoCard}>
            <p className={styles.infoTitle}>Moderationshinweis</p>
            <p className={styles.infoText}>
              Jede Bewertung wird vor der Veröffentlichung manuell geprüft.
              Beleidigungen oder Spam werden nicht freigegeben.
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}
