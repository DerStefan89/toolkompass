// ============================================
// IMPORTS — Werkzeuge die wir benutzen
// ============================================

// Metadata = ermöglicht uns Titel und Beschreibung
// für Google und Browser-Tab zu setzen
import type { Metadata, Viewport } from "next";
import { organizationJsonLd } from '@/lib/seo/json-ld'
import { SITE_URL } from '@/lib/config/site'

const orgLd = organizationJsonLd(SITE_URL)

// Die zwei Schriften die wir von Google laden
// Playfair Display = die Serif-Schrift für Headlines
// Inter = die normale Schrift für Fließtext
import { Playfair_Display, Inter } from "next/font/google";

// Das CSS mit allen Farben und Grundregeln
import "./globals.css";

// Unser Header — die Datei die wir gerade gebaut haben
import PublicHeader from '@/components/layout/PublicHeader';
import PublicFooter from '@/components/layout/PublicFooter';
import FeedbackWidget from '@/components/layout/FeedbackWidget';
import GoogleAnalytics from '@/components/layout/GoogleAnalytics';
import ConsentBanner from '@/components/layout/ConsentBanner';


// ============================================
// SCHRIFTEN EINRICHTEN
// ============================================

// Playfair wird als CSS-Variable verfügbar gemacht.
// "--font-playfair" kannst du dann überall im Code nutzen
// z.B. style={{ fontFamily: "var(--font-playfair)" }}
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],  // nur lateinische Zeichen (kein Arabisch etc.)
  display: "swap",     // Seite lädt erst, Schrift kommt nach — kein Flackern
  weight: ["400", "500", "600", "700"],  // nur die genutzten Gewichte
});

// Dasselbe für Inter
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});


// ============================================
// SEO — Was Google und der Browser-Tab sehen
// ============================================

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ToolSucher — Digitale Business-Tools entdecken & vergleichen",
  description: "ToolSucher hilft Gründern, Selbstständigen und kleinen Teams, passende Business-Tools für Buchhaltung, Marketing, Produktivität und mehr zu vergleichen.",
  alternates: { canonical: '/' },
};


// ============================================
// DAS GERÜST — gilt für JEDE Seite
// ============================================

// "children" = der Inhalt der jeweiligen Seite.
// Auf der Startseite ist children = page.tsx
// Auf der Tools-Seite ist children = tools/page.tsx
// Das wechselt automatisch — du musst nichts tun.

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // lang="de" = Browser weiß: das ist Deutsch
    // className= gibt beiden Schriften Zugriff auf die ganze Seite
    <html lang="de" className={`${playfair.variable} ${inter.variable} h-full antialiased`}>

      <body style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

        <GoogleAnalytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: orgLd }} />

        {/* Header erscheint auf JEDER Seite oben */}
        <PublicHeader />

        {/* Hier erscheint der Inhalt der jeweiligen Seite */}
        {children}

        <FeedbackWidget />
        <PublicFooter />
        <ConsentBanner />

      </body>
    </html>
  );
}