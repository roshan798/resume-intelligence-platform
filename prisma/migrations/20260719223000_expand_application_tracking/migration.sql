ALTER TABLE "applications"
ADD COLUMN "applicationUrl" TEXT,
ADD COLUMN "location" TEXT,
ADD COLUMN "nextAction" TEXT,
ADD COLUMN "nextActionDate" TIMESTAMP(3);

CREATE INDEX "applications_userId_nextActionDate_idx"
ON "applications"("userId", "nextActionDate");
