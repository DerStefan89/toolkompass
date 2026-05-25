import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const BASE_URL = 'https://toolkompass.de'

const staticRoutes: MetadataRoute.Sitemap = [
  { url: BASE_URL,                        changeFrequency: 'weekly',  priority: 1.0 },
  { url: `${BASE_URL}/kategorien`,        changeFrequency: 'weekly',  priority: 0.9 },
  { url: `${BASE_URL}/vergleichen`,       changeFrequency: 'weekly',  priority: 0.8 },
  { url: `${BASE_URL}/ratgeber`,          changeFrequency: 'weekly',  priority: 0.8 },
  { url: `${BASE_URL}/tool-stacks`,       changeFrequency: 'weekly',  priority: 0.7 },
  { url: `${BASE_URL}/impressum`,         changeFrequency: 'yearly',  priority: 0.1 },
  { url: `${BASE_URL}/datenschutz`,       changeFrequency: 'yearly',  priority: 0.1 },
  { url: `${BASE_URL}/affiliate-hinweis`, changeFrequency: 'yearly',  priority: 0.1 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tools, categories, articles, comparisons, stacks] = await Promise.all([
    prisma.tool.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    prisma.article.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    prisma.comparison.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    prisma.toolStack.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ])

  const toolRoutes: MetadataRoute.Sitemap = tools.map((t) => ({
    url:             `${BASE_URL}/tools/${t.slug}`,
    lastModified:    t.updatedAt,
    changeFrequency: 'monthly',
    priority:        0.8,
  }))

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url:             `${BASE_URL}/kategorien/${c.slug}`,
    lastModified:    c.updatedAt,
    changeFrequency: 'weekly',
    priority:        0.7,
  }))

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url:             `${BASE_URL}/ratgeber/${a.slug}`,
    lastModified:    a.updatedAt,
    changeFrequency: 'monthly',
    priority:        0.7,
  }))

  const comparisonRoutes: MetadataRoute.Sitemap = comparisons.map((c) => ({
    url:             `${BASE_URL}/vergleichen/${c.slug}`,
    lastModified:    c.updatedAt,
    changeFrequency: 'monthly',
    priority:        0.7,
  }))

  const stackRoutes: MetadataRoute.Sitemap = stacks.map((s) => ({
    url:             `${BASE_URL}/tool-stacks/${s.slug}`,
    lastModified:    s.updatedAt,
    changeFrequency: 'monthly',
    priority:        0.6,
  }))

  return [
    ...staticRoutes,
    ...toolRoutes,
    ...categoryRoutes,
    ...articleRoutes,
    ...comparisonRoutes,
    ...stackRoutes,
  ]
}
