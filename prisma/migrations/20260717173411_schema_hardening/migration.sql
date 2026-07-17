/*
  Warnings:

  - A unique constraint covering the columns `[userId,provider]` on the table `integrations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[resumeId,tag,resumeVersionId]` on the table `resume_tags` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `provider` on the `integrations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `jd_analyses` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `scope` on the `resume_tags` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ResumeTagScope" AS ENUM ('RESUME', 'VERSION');

-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('GOOGLE_DRIVE');

-- DropForeignKey
ALTER TABLE "ai_suggestions" DROP CONSTRAINT "ai_suggestions_resumeVersionId_fkey";

-- DropForeignKey
ALTER TABLE "application_status_history" DROP CONSTRAINT "application_status_history_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_resumeVersionId_fkey";

-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_userId_fkey";

-- DropForeignKey
ALTER TABLE "file_assets" DROP CONSTRAINT "file_assets_userId_fkey";

-- DropForeignKey
ALTER TABLE "integrations" DROP CONSTRAINT "integrations_userId_fkey";

-- DropForeignKey
ALTER TABLE "jd_analyses" DROP CONSTRAINT "jd_analyses_userId_fkey";

-- DropForeignKey
ALTER TABLE "match_results" DROP CONSTRAINT "match_results_jdAnalysisId_fkey";

-- DropForeignKey
ALTER TABLE "match_results" DROP CONSTRAINT "match_results_resumeVersionId_fkey";

-- DropForeignKey
ALTER TABLE "resume_tags" DROP CONSTRAINT "resume_tags_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "resume_tags" DROP CONSTRAINT "resume_tags_resumeVersionId_fkey";

-- DropForeignKey
ALTER TABLE "resume_versions" DROP CONSTRAINT "resume_versions_resumeId_fkey";

-- DropForeignKey
ALTER TABLE "resumes" DROP CONSTRAINT "resumes_userId_fkey";

-- DropIndex
DROP INDEX "resume_tags_resumeId_tag_key";

-- AlterTable
ALTER TABLE "integrations" DROP COLUMN "provider",
ADD COLUMN     "provider" "IntegrationProvider" NOT NULL;

-- AlterTable
ALTER TABLE "jd_analyses" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "resume_tags" DROP COLUMN "scope",
ADD COLUMN     "scope" "ResumeTagScope" NOT NULL;

-- CreateIndex
CREATE INDEX "ai_suggestions_provider_idx" ON "ai_suggestions"("provider");

-- CreateIndex
CREATE INDEX "ai_suggestions_resumeVersionId_idx" ON "ai_suggestions"("resumeVersionId");

-- CreateIndex
CREATE INDEX "application_status_history_applicationId_idx" ON "application_status_history"("applicationId");

-- CreateIndex
CREATE INDEX "applications_userId_createdAt_idx" ON "applications"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "applications_resumeVersionId_idx" ON "applications"("resumeVersionId");

-- CreateIndex
CREATE INDEX "file_assets_userId_idx" ON "file_assets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "integrations_userId_provider_key" ON "integrations"("userId", "provider");

-- CreateIndex
CREATE INDEX "jd_analyses_company_idx" ON "jd_analyses"("company");

-- CreateIndex
CREATE INDEX "jd_analyses_roleTitle_idx" ON "jd_analyses"("roleTitle");

-- CreateIndex
CREATE INDEX "match_results_resumeVersionId_idx" ON "match_results"("resumeVersionId");

-- CreateIndex
CREATE INDEX "resume_tags_resumeId_idx" ON "resume_tags"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "resume_tags_resumeId_tag_resumeVersionId_key" ON "resume_tags"("resumeId", "tag", "resumeVersionId");

-- CreateIndex
CREATE INDEX "resume_versions_resumeId_idx" ON "resume_versions"("resumeId");

-- CreateIndex
CREATE INDEX "resume_versions_parentVersionId_idx" ON "resume_versions"("parentVersionId");

-- CreateIndex
CREATE INDEX "resume_versions_jdSnapshotId_idx" ON "resume_versions"("jdSnapshotId");

-- CreateIndex
CREATE INDEX "resumes_userId_idx" ON "resumes"("userId");

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_versions" ADD CONSTRAINT "resume_versions_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_tags" ADD CONSTRAINT "resume_tags_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_tags" ADD CONSTRAINT "resume_tags_resumeVersionId_fkey" FOREIGN KEY ("resumeVersionId") REFERENCES "resume_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jd_analyses" ADD CONSTRAINT "jd_analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_jdAnalysisId_fkey" FOREIGN KEY ("jdAnalysisId") REFERENCES "jd_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_resumeVersionId_fkey" FOREIGN KEY ("resumeVersionId") REFERENCES "resume_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_resumeVersionId_fkey" FOREIGN KEY ("resumeVersionId") REFERENCES "resume_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_resumeVersionId_fkey" FOREIGN KEY ("resumeVersionId") REFERENCES "resume_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_status_history" ADD CONSTRAINT "application_status_history_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
