-- Migration: add_plan_features_to_tool_translation
-- Fügt das String[]-Feld planFeatures zur ToolTranslation-Tabelle hinzu.
-- Separates Feld für die "Plan & Preisdetails"-Box auf der Tool-Detailseite,
-- unabhängig von features[] (das weiterhin im "Funktionen"-Grid erscheint).
--
-- Spaltentyp TEXT[] ohne NOT NULL/DEFAULT — identisch zu den bestehenden
-- Array-Feldern (features, strengths, weaknesses, bestFor, notIdealFor),
-- siehe 20260523202524_init/migration.sql.
--
-- Ausführen über Supabase SQL Editor — NICHT via prisma migrate
-- (Datasource ist direkt mit der Supabase-DB verbunden, kein lokales Ziel).

ALTER TABLE "ToolTranslation" ADD COLUMN "planFeatures" TEXT[];
