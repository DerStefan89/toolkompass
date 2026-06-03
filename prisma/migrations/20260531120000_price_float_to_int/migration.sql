-- Migration: startingPriceMonthly (Float) → startingPriceCents (Int)
-- Ein Backup der Originalwerte liegt in backup_tool_preise.
--
-- Regel: 0 → NULL  (kostenlos = kein Cent-Wert, nicht "0 Cent")
--        NULL → NULL
--        sonst → ROUND(startingPriceMonthly * 100)::INTEGER

-- Schritt 1: Neue Spalte hinzufügen
ALTER TABLE "Tool" ADD COLUMN "startingPriceCents" INTEGER;

-- Schritt 2: Daten umrechnen
UPDATE "Tool"
SET "startingPriceCents" =
  CASE
    WHEN "startingPriceMonthly" IS NULL THEN NULL
    WHEN "startingPriceMonthly" = 0     THEN NULL
    ELSE ROUND("startingPriceMonthly" * 100)::INTEGER
  END;

-- Schritt 3: Alte Spalte entfernen
ALTER TABLE "Tool" DROP COLUMN "startingPriceMonthly";
