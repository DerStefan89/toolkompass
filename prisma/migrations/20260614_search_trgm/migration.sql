-- pg_trgm Extension aktivieren (für ILIKE-Index)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN-Trigram-Index auf name und shortDescription der deutschen Translations
CREATE INDEX IF NOT EXISTS "ToolTranslation_name_trgm_idx"
  ON "ToolTranslation" USING gin ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "ToolTranslation_shortDesc_trgm_idx"
  ON "ToolTranslation" USING gin ("shortDescription" gin_trgm_ops);
