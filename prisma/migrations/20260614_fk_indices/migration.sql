-- Fehlende Foreign-Key-Indizes (Postgres legt diese nicht automatisch an)
-- IF NOT EXISTS macht die Migration idempotent / wiederholbar

CREATE INDEX IF NOT EXISTS "ToolCategory_categoryId_idx" ON "ToolCategory"("categoryId");
CREATE INDEX IF NOT EXISTS "ToolStackItem_toolId_idx" ON "ToolStackItem"("toolId");
CREATE INDEX IF NOT EXISTS "Comparison_toolAId_idx" ON "Comparison"("toolAId");
CREATE INDEX IF NOT EXISTS "Comparison_toolBId_idx" ON "Comparison"("toolBId");
CREATE INDEX IF NOT EXISTS "ArticleSection_articleId_idx" ON "ArticleSection"("articleId");
CREATE INDEX IF NOT EXISTS "ComparisonRow_comparisonId_idx" ON "ComparisonRow"("comparisonId");
CREATE INDEX IF NOT EXISTS "ArticleTool_toolId_idx" ON "ArticleTool"("toolId");
CREATE INDEX IF NOT EXISTS "UserTool_pricingPlanId_idx" ON "UserTool"("pricingPlanId");
CREATE INDEX IF NOT EXISTS "PageView_stackId_idx" ON "PageView"("stackId");
CREATE INDEX IF NOT EXISTS "PageView_articleId_idx" ON "PageView"("articleId");
CREATE INDEX IF NOT EXISTS "PageView_comparisonId_idx" ON "PageView"("comparisonId");
