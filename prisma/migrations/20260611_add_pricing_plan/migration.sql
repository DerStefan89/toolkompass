-- CreateEnum BillingCycle
CREATE TYPE "BillingCycle" AS ENUM ('monthly', 'yearly', 'one_time');

-- CreateTable PricingPlan
CREATE TABLE "PricingPlan" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'monthly',
    "features" TEXT[],
    "isHighlighted" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PricingPlan_toolId_idx" ON "PricingPlan"("toolId");

-- AddForeignKey
ALTER TABLE "PricingPlan" ADD CONSTRAINT "PricingPlan_toolId_fkey"
    FOREIGN KEY ("toolId") REFERENCES "Tool"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
