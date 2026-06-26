-- CreateTable Inquiry (Tool-Entwicklungs-Anfragen)
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "companyType" TEXT,
    "description" TEXT NOT NULL,
    "targetUsers" TEXT,
    "features" TEXT,
    "examples" TEXT,
    "budget" TEXT,
    "timeline" TEXT,
    "status" TEXT NOT NULL DEFAULT 'neu',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Inquiry_createdAt_idx" ON "Inquiry"("createdAt");
CREATE INDEX "Inquiry_status_idx" ON "Inquiry"("status");
