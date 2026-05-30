/**
 * Datei: lib/seo/json-ld.ts
 *
 * Zweck: JSON-LD Structured Data Helpers für Google Rich Snippets.
 * Jede Funktion gibt einen fertigen JSON-String zurück der direkt
 * in <script type="application/ld+json"> eingesetzt werden kann.
 */

export function toolJsonLd(
  tool: {
    name: string
    description: string
    url: string
    logoUrl: string | null
    startingPriceMonthly: number | null
    hasFreePlan: boolean
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _siteUrl: string,
): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: tool.url,
    ...(tool.logoUrl && { image: tool.logoUrl }),
    offers: {
      '@type': 'Offer',
      price: tool.hasFreePlan ? '0' : (tool.startingPriceMonthly?.toString() ?? '0'),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/OnlineOnly',
    },
  })
}

export function articleJsonLd(
  article: {
    title: string
    subtitle: string
    publishedAt: Date | null
    updatedAt: Date
    slug: string
  },
  siteUrl: string,
): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.subtitle,
    datePublished: article.publishedAt?.toISOString() ?? article.updatedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    url: `${siteUrl}/ratgeber/${article.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'ToolSucher',
      url: siteUrl,
    },
  })
}

export function comparisonJsonLd(
  comparison: {
    slug: string
    verdict: string
    updatedAt: Date
    toolAName: string
    toolBName: string
  },
  siteUrl: string,
): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${comparison.toolAName} vs ${comparison.toolBName} — Vergleich`,
    description: comparison.verdict,
    dateModified: comparison.updatedAt.toISOString(),
    url: `${siteUrl}/vergleichen/${comparison.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'ToolSucher',
      url: siteUrl,
    },
  })
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  })
}

export function organizationJsonLd(siteUrl: string): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ToolSucher',
    url: siteUrl,
    description: 'Deutsche Plattform für digitale Business-Tools',
  })
}
