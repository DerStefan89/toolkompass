-- Rating-Modell nachschärfen
-- 1. userId NOT NULL (DB ist leer, kein Datenrisiko)
ALTER TABLE "Rating" ALTER COLUMN "userId" SET NOT NULL;

-- 2. updatedAt ergänzen
ALTER TABLE "Rating" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 3. Unique-Constraint: ein Nutzer bewertet ein Tool nur einmal
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_toolId_userId_key" UNIQUE ("toolId", "userId");

-- 4. CHECK: Gesamt-Score zwischen 1 und 5
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_score_check" CHECK ("score" >= 1 AND "score" <= 5);

-- RatingCriterion
CREATE TABLE "RatingCriterion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RatingCriterion_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RatingCriterion_slug_key" ON "RatingCriterion"("slug");

-- ToolRatingCriterion (Zuweisung)
CREATE TABLE "ToolRatingCriterion" (
    "toolId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    CONSTRAINT "ToolRatingCriterion_pkey" PRIMARY KEY ("toolId", "criterionId")
);
CREATE INDEX "ToolRatingCriterion_toolId_idx" ON "ToolRatingCriterion"("toolId");
CREATE INDEX "ToolRatingCriterion_criterionId_idx" ON "ToolRatingCriterion"("criterionId");

-- RatingScore (Sterne pro Kriterium)
CREATE TABLE "RatingScore" (
    "id" TEXT NOT NULL,
    "ratingId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    CONSTRAINT "RatingScore_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "RatingScore_score_check" CHECK ("score" >= 1 AND "score" <= 5)
);
CREATE UNIQUE INDEX "RatingScore_ratingId_criterionId_key" ON "RatingScore"("ratingId", "criterionId");
CREATE INDEX "RatingScore_ratingId_idx" ON "RatingScore"("ratingId");
CREATE INDEX "RatingScore_criterionId_idx" ON "RatingScore"("criterionId");

-- ForeignKeys
ALTER TABLE "ToolRatingCriterion" ADD CONSTRAINT "ToolRatingCriterion_toolId_fkey"
    FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ToolRatingCriterion" ADD CONSTRAINT "ToolRatingCriterion_criterionId_fkey"
    FOREIGN KEY ("criterionId") REFERENCES "RatingCriterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RatingScore" ADD CONSTRAINT "RatingScore_ratingId_fkey"
    FOREIGN KEY ("ratingId") REFERENCES "Rating"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RatingScore" ADD CONSTRAINT "RatingScore_criterionId_fkey"
    FOREIGN KEY ("criterionId") REFERENCES "RatingCriterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Rating.userId FK auf Cascade umstellen (war vorher optional/SetNull)
-- Erst alten FK droppen falls vorhanden, dann neu mit Cascade
ALTER TABLE "Rating" DROP CONSTRAINT IF EXISTS "Rating_userId_fkey";
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
