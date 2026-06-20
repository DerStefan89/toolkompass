/**
 * Datei: components/ui/InlineMarkdown.tsx
 *
 * Zweck: Rendert Markdown (fett/kursiv/unterstrichen) aus dem Admin-Bereich inline,
 * ohne den Block-Wrapper <p>, den react-markdown standardmäßig erzeugt — der würde
 * in Listen-Items und neben Icons zu ungültigem verschachteltem HTML und gebrochenem
 * Inline-Layout führen.
 *
 * Wird aufgerufen von:
 * - app/tools/[slug]/page.tsx
 * - app/vergleichen/[slug]/page.tsx
 *
 * Wichtig:
 * - Server Component (kein 'use client').
 * - rehypeRaw erlaubt rohes HTML (für <u>…</u>, da Markdown kein natives Underline
 *   kennt). Unbedenklich, weil der Inhalt ausschließlich aus dem eigenen Admin-Bereich
 *   stammt — KEIN nutzergenerierter Content.
 */

import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

export default function InlineMarkdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      components={{ p: ({ children }) => <>{children}</> }}
    >
      {text}
    </ReactMarkdown>
  )
}
