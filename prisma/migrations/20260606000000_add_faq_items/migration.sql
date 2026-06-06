-- Migration: add_faq_items
-- Fügt das JSONB-Feld faqItems zur ToolTranslation-Tabelle hinzu.
-- Ausführen über Supabase SQL Editor — NICHT via prisma migrate.

ALTER TABLE "ToolTranslation" ADD COLUMN "faqItems" JSONB;
