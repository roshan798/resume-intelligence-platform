CREATE TYPE "JobDescriptionStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

CREATE TABLE "job_descriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT,
    "roleTitle" TEXT NOT NULL,
    "location" TEXT,
    "sourceUrl" TEXT,
    "experienceRequirements" TEXT,
    "status" "JobDescriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_descriptions_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "jd_analyses"
ADD COLUMN "jobDescriptionId" TEXT,
ADD COLUMN "snapshotNumber" INTEGER NOT NULL DEFAULT 1;

CREATE INDEX "job_descriptions_userId_status_updatedAt_idx"
ON "job_descriptions"("userId", "status", "updatedAt");

CREATE INDEX "job_descriptions_userId_company_idx"
ON "job_descriptions"("userId", "company");

CREATE INDEX "jd_analyses_jobDescriptionId_idx"
ON "jd_analyses"("jobDescriptionId");

CREATE UNIQUE INDEX "jd_analyses_jobDescriptionId_snapshotNumber_key"
ON "jd_analyses"("jobDescriptionId", "snapshotNumber");

ALTER TABLE "job_descriptions"
ADD CONSTRAINT "job_descriptions_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "jd_analyses"
ADD CONSTRAINT "jd_analyses_jobDescriptionId_fkey"
FOREIGN KEY ("jobDescriptionId") REFERENCES "job_descriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
