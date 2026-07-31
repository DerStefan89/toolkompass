---
name: tool-anlegen
description: Legt ein neues Tool auf ToolSucher vollständig an — Recherche, Text nach Format-A-Template in Content_Website/, Import per Script mit Dry-Run, Logo-Upload, Pricing, Live-Verifikation. Nutzen, wenn der Nutzer sagt "neues Tool anlegen", "Tool hinzufügen", "[Toolname] aufnehmen" oder einen Tool-Namen mit Website/Affiliate-Link liefert. NICHT nutzen für Änderungen an bestehenden Tools, Vergleiche, Kategorien oder Ratgeber.
---

# Tool anlegen

## Instructions
0. **Duplikat-Check ZUERST, bevor irgendetwas recherchiert oder geschrieben wird:**
   `npx tsx scripts/check-tool-exists.ts "<Toolname>" [websiteDomain]`
   - 🟥 **Exakter Treffer** (Tool existiert bereits in der DB) → NICHT neu anlegen. Dem Nutzer den
     bestehenden Status melden (Name, Slug, published ja/nein, Admin-Link) und fragen, ob er es so
     lassen will ("braucht man nicht") oder ob das bestehende Tool aktualisiert/überschrieben werden
     soll. Erst nach expliziter Bestätigung weitermachen — dann ab Schritt 1, aber mit Update statt
     Neuanlage (Import-Script upserted per Slug — dabei werden vorhandene Texte überschrieben und das Tool auf unpublished gesetzt.)
   - 🟨 **Ähnlicher Treffer** (Vendor-Name/Domain ähnlich, aber kein exakter Slug-Match) → dem Nutzer
     die Kandidaten zeigen und klären, ob es dasselbe Tool ist, bevor weitergemacht wird.
   - 🟩 **Kein Treffer** → normal mit Schritt 1 fortfahren.
1. Recherche auf der offiziellen Website: Kernfunktionen, Zielgruppe, Free-Plan (ja/nein), Preise (NUR von der offiziellen Pricing-Seite, Datum notieren)
2. Text nach `references/tool-text-template.md` (Format A) verfassen und in die passende Datei in `Content_Website/` einfügen. Harte Regeln: Tagline ≤ 160 Zeichen, Stärken/Funktionen nie leer, Trenner ist " · "
3. Dry-Run: `npx tsx scripts/import-tools.ts --dry-run` → Report prüfen: neues Tool gelistet? Keine Warnungen? Kategorie vorhanden?
4. Echtlauf NUR nach sauberem Dry-Run: `npx tsx scripts/import-tools.ts`
5. Logo: PNG mit transparentem Hintergrund, primär von offizieller Website/Press-Kit (Google nur Fallback, vor Upload mit Website abgleichen) → Upload via Admin-UI (landet in Supabase-Bucket `tool-logos`, URL in `Tool.logoUrl`)
6. Pricing im Admin als PricingPlan erfassen (Beträge als Int in Cent, ARCHITECTURE §5) und mit der **Preise:**-Zeile im Text abgleichen
7. Tool im Admin auf published setzen
8. Verifikation: Live-Seite aufrufen, Tracking-Link (/api/track/…) klicken und testen, Textformat gegen die Gold-Standard-Seite tools/calendly vergleichen vergleichen

## Common Issues
- Duplikat-Check übersprungen → nie direkt mit Recherche/Content starten, ohne vorher Schritt 0 laufen zu lassen; sonst entstehen doppelte Vendor/Tool-Einträge mit unterschiedlichen Slugs für dasselbe Produkt
- Import-Script setzt `published: false` AUCH bei bestehenden Tools → nach jedem Import prüfen, ob betroffene Tools noch published sind
- Text weicht vom Bestandsformat ab → Dry-Run-Warnungen lesen; gegen Template + Gold-Standard-Seite prüfen
- Falsches Logo → nie ungeprüft aus Google übernehmen; immer mit offizieller Website abgleichen
- Pricing falsch → PricingPlan (DB) und **Preise:**-Zeile (Text) sind zwei Orte; beide gegen die offizielle Pricing-Seite prüfen