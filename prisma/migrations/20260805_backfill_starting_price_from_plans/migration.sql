-- Migration: Tool.startingPriceCents nach Einführung der Preis-Ableitung angleichen
-- (ARCHITECTURE.md, "Preis-Ableitung"; state/plan-v2-pricing.md).
--
-- Betrifft nur Tools, die bereits vor dieser Regel PricingPlan-Zeilen hatten und deren
-- startingPriceCents dadurch vom Stand abweichen kann, den syncStartingPrice() ab jetzt
-- bei jeder PricingPlan-Mutation herstellt.
--
-- WICHTIG — NICHT ungeprüft ausführen:
-- Schritt 1 ist ein reiner Lese-Audit. Ergebnis manuell sichten (jede Zeile ist ein Tool,
-- dessen sichtbarer Preis sich durch Schritt 2 ändert), erst danach Schritt 2 ausführen.
-- Ausführung nach ARCHITECTURE.md §5: manuell im Supabase SQL Editor, kein `prisma migrate`.
--
-- Stand dieser Datei: NICHT ausgeführt. Schritt 2 läuft erst nach Freigabe der
-- Audit-Ergebnisse aus Schritt 1 (state/plan-v2-pricing.md, Migrationsschritt).

-- ============================================================
-- Schritt 1 — Audit (read-only)
-- ============================================================
SELECT
  t.id, t.slug, t."startingPriceCents" AS current_value,
  sub.min_monthly AS would_derive_to
FROM "Tool" t
JOIN (
  SELECT "toolId", MIN("priceCents") AS min_monthly
  FROM "PricingPlan"
  WHERE "billingCycle" = 'monthly'
  GROUP BY "toolId"
) sub ON sub."toolId" = t.id
WHERE t."startingPriceCents" IS DISTINCT FROM sub.min_monthly;

-- ============================================================
-- Schritt 2 — Backfill (erst nach manueller Freigabe der Audit-Ergebnisse)
-- ============================================================

-- Tools mit mindestens einem monatlichen Tarif: auf den günstigsten setzen
UPDATE "Tool" t
SET "startingPriceCents" = sub.min_price
FROM (
  SELECT "toolId", MIN("priceCents") AS min_price
  FROM "PricingPlan"
  WHERE "billingCycle" = 'monthly'
  GROUP BY "toolId"
) sub
WHERE t.id = sub."toolId";

-- Tools mit PricingPlan, aber ohne monatlichen Tarif: auf NULL setzen
UPDATE "Tool" t
SET "startingPriceCents" = NULL
WHERE EXISTS (SELECT 1 FROM "PricingPlan" p WHERE p."toolId" = t.id)
  AND NOT EXISTS (
    SELECT 1 FROM "PricingPlan" p
    WHERE p."toolId" = t.id AND p."billingCycle" = 'monthly'
  );
