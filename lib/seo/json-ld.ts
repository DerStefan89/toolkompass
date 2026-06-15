/**
 * Datei: lib/seo/json-ld.ts
 *
 * Zweck: JSON-LD Structured Data Helpers für Google Rich Snippets.
 * Jede Funktion gibt einen fertigen JSON-String zurück der direkt
 * in <script type="application/ld+json"> eingesetzt werden kann.
 */

/**
 * Serialisiert ein Objekt als JSON-LD und escaped die Zeichen, mit denen
 * nutzergenerierte/redaktionelle Inhalte (z. B. ein "</script>" im Tool-Namen)
 * aus dem <script>-Tag ausbrechen könnten. Die \uXXXX-Escapes sind im
 * JSON-String-Kontext gültig — das Ergebnis bleibt valides JSON-LD.
 */
function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

export function toolJsonLd(
  tool: {
    name: string
    description: string
    url: string
    logoUrl: string | null
    startingPriceCents: number | null
    hasFreePlan: boolean
    // Nur setzen wenn mindestens eine freigegebene Bewertung existiert —
    // ein leeres aggregateRating wäre invalides Schema.
    rating?: { average: number; count: number }
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _siteUrl: string,
): string {
  return safeJsonLd({
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
      price: tool.hasFreePlan ? '0' : (tool.startingPriceCents != null ? (tool.startingPriceCents / 100).toFixed(2) : '0'),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/OnlineOnly',
    },
    ...(tool.rating && tool.rating.count >= 1
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: tool.rating.average,
            ratingCount: tool.rating.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
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
  return safeJsonLd({
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
  return safeJsonLd({
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
  return safeJsonLd({
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
  return safeJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ToolSucher',
    url: siteUrl,
    description: 'Deutsche Plattform für digitale Business-Tools',
  })
}

/**
 * FAQPage-JSON-LD für Rich Snippets.
 * NUR mit echten FAQ-Items aufrufen (nicht mit Platzhaltern) — sonst riskiert
 * man eine Google-Abstrafung wegen nicht dem sichtbaren Inhalt entsprechendem Markup.
 *
 * @param items - echte FAQ-Items aus der DB ({question, answer})
 * @returns JSON-LD-String oder null wenn keine Items (dann nicht einbinden)
 */
export function faqPageJsonLd(
  items: { question: string; answer: string }[],
): string | null {
  if (!items || items.length === 0) return null
  return safeJsonLd({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  })
}
