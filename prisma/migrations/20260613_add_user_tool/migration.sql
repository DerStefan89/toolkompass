-- CreateTable UserTool
CREATE TABLE "UserTool" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "pricingPlanId" TEXT,
    "customPriceCents" INTEGER,
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'monthly',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (Unique: ein Tool nur einmal pro Nutzer)
CREATE UNIQUE INDEX "UserTool_userId_toolId_key" ON "UserTool"("userId", "toolId");
CREATE INDEX "UserTool_userId_idx" ON "UserTool"("userId");
CREATE INDEX "UserTool_toolId_idx" ON "UserTool"("toolId");

-- AddForeignKeys
ALTER TABLE "UserTool" ADD CONSTRAINT "UserTool_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserTool" ADD CONSTRAINT "UserTool_toolId_fkey"
    FOREIGN KEY ("toolId") REFERENCES "Tool"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserTool" ADD CONSTRAINT "UserTool_pricingPlanId_fkey"
    FOREIGN KEY ("pricingPlanId") REFERENCES "PricingPlan"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
