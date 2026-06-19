-- Comparison erweitern (neue optionale Spalten)
ALTER TABLE "Comparison" ADD COLUMN "title" TEXT;
ALTER TABLE "Comparison" ADD COLUMN "subtitle" TEXT;
ALTER TABLE "Comparison" ADD COLUMN "decisionGuide" JSONB;
ALTER TABLE "Comparison" ADD COLUMN "targetGroups" JSONB;
ALTER TABLE "Comparison" ADD COLUMN "keyDifference" TEXT;

-- ComparisonSection
CREATE TABLE "ComparisonSection" (
    "id" TEXT NOT NULL,
    "heading" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "comparisonId" TEXT NOT NULL,
    CONSTRAINT "ComparisonSection_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ComparisonSection_comparisonId_idx" ON "ComparisonSection"("comparisonId");

-- ComparisonFeature
CREATE TABLE "ComparisonFeature" (
    "id" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "toolAValue" TEXT NOT NULL,
    "toolBValue" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "comparisonId" TEXT NOT NULL,
    CONSTRAINT "ComparisonFeature_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ComparisonFeature_comparisonId_idx" ON "ComparisonFeature"("comparisonId");

-- ComparisonAlternative
CREATE TABLE "ComparisonAlternative" (
    "id" TEXT NOT NULL,
    "comparisonId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ComparisonAlternative_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ComparisonAlternative_comparisonId_toolId_key" ON "ComparisonAlternative"("comparisonId", "toolId");
CREATE INDEX "ComparisonAlternative_comparisonId_idx" ON "ComparisonAlternative"("comparisonId");
CREATE INDEX "ComparisonAlternative_toolId_idx" ON "ComparisonAlternative"("toolId");

-- Foreign Keys
ALTER TABLE "ComparisonSection" ADD CONSTRAINT "ComparisonSection_comparisonId_fkey"
    FOREIGN KEY ("comparisonId") REFERENCES "Comparison"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ComparisonFeature" ADD CONSTRAINT "ComparisonFeature_comparisonId_fkey"
    FOREIGN KEY ("comparisonId") REFERENCES "Comparison"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ComparisonAlternative" ADD CONSTRAINT "ComparisonAlternative_comparisonId_fkey"
    FOREIGN KEY ("comparisonId") REFERENCES "Comparison"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ComparisonAlternative" ADD CONSTRAINT "ComparisonAlternative_toolId_fkey"
    FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
