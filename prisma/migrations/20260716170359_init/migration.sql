-- CreateEnum
CREATE TYPE "ResumeVersionStatus" AS ENUM ('MASTER', 'TAILORED_DRAFT', 'FINAL', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SourceFormat" AS ENUM ('PDF', 'DOCX', 'LATEX');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SAVED', 'APPLIED', 'OA', 'INTERVIEW', 'REJECTED', 'OFFER', 'CLOSED');

-- CreateEnum
CREATE TYPE "AIProvider" AS ENUM ('GROQ', 'GEMINI', 'OPENAI', 'ANTHROPIC');

-- CreateEnum
CREATE TYPE "AISuggestionStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AISuggestionType" AS ENUM ('MISSING_KEYWORDS', 'REWRITE_BULLETS', 'SECTION_RECOMMENDATIONS', 'TAILORED_DRAFT', 'CHANGE_SUMMARY');

-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('SUPABASE', 'GOOGLE_DRIVE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "primaryStack" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_versions" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "parentVersionId" TEXT,
    "versionNumber" INTEGER NOT NULL,
    "status" "ResumeVersionStatus" NOT NULL,
    "sourceFormat" "SourceFormat" NOT NULL,
    "rawText" TEXT NOT NULL,
    "latexSource" TEXT,
    "parsedSections" JSONB NOT NULL,
    "canonicalKeywords" JSONB NOT NULL,
    "fingerprintHash" TEXT NOT NULL,
    "fileAssetId" TEXT,
    "jdSnapshotId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_tags" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "resumeVersionId" TEXT,

    CONSTRAINT "resume_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jd_analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "company" TEXT,
    "roleTitle" TEXT,
    "parsedKeywords" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jd_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_results" (
    "id" TEXT NOT NULL,
    "jdAnalysisId" TEXT NOT NULL,
    "resumeVersionId" TEXT NOT NULL,
    "overallScore" DECIMAL(5,2) NOT NULL,
    "sectionScores" JSONB NOT NULL,
    "matchedKeywords" JSONB NOT NULL,
    "missingKeywords" JSONB NOT NULL,
    "weakKeywords" JSONB NOT NULL,
    "formattingHealth" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_suggestions" (
    "id" TEXT NOT NULL,
    "resumeVersionId" TEXT NOT NULL,
    "jdAnalysisId" TEXT,
    "featureType" "AISuggestionType" NOT NULL,
    "inputPayload" JSONB NOT NULL,
    "outputPayload" JSONB NOT NULL,
    "status" "AISuggestionStatus" NOT NULL,
    "provider" "AIProvider" NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jdAnalysisId" TEXT,
    "resumeVersionId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL,
    "appliedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_status_history" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_assets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storageProvider" "StorageProvider" NOT NULL,
    "storageRef" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "scopes" TEXT[],
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "resumes_userId_title_idx" ON "resumes"("userId", "title");

-- CreateIndex
CREATE INDEX "resume_versions_resumeId_status_idx" ON "resume_versions"("resumeId", "status");

-- CreateIndex
CREATE INDEX "resume_versions_resumeId_versionNumber_idx" ON "resume_versions"("resumeId", "versionNumber");

-- CreateIndex
CREATE INDEX "resume_tags_tag_idx" ON "resume_tags"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "resume_tags_resumeId_tag_key" ON "resume_tags"("resumeId", "tag");

-- CreateIndex
CREATE INDEX "jd_analyses_userId_createdAt_idx" ON "jd_analyses"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "match_results_jdAnalysisId_overallScore_idx" ON "match_results"("jdAnalysisId", "overallScore");

-- CreateIndex
CREATE INDEX "ai_suggestions_resumeVersionId_featureType_idx" ON "ai_suggestions"("resumeVersionId", "featureType");

-- CreateIndex
CREATE INDEX "applications_userId_status_idx" ON "applications"("userId", "status");

-- CreateIndex
CREATE INDEX "applications_userId_company_idx" ON "applications"("userId", "company");

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_versions" ADD CONSTRAINT "resume_versions_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_versions" ADD CONSTRAINT "resume_versions_parentVersionId_fkey" FOREIGN KEY ("parentVersionId") REFERENCES "resume_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_versions" ADD CONSTRAINT "resume_versions_fileAssetId_fkey" FOREIGN KEY ("fileAssetId") REFERENCES "file_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_versions" ADD CONSTRAINT "resume_versions_jdSnapshotId_fkey" FOREIGN KEY ("jdSnapshotId") REFERENCES "jd_analyses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_tags" ADD CONSTRAINT "resume_tags_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_tags" ADD CONSTRAINT "resume_tags_resumeVersionId_fkey" FOREIGN KEY ("resumeVersionId") REFERENCES "resume_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jd_analyses" ADD CONSTRAINT "jd_analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_jdAnalysisId_fkey" FOREIGN KEY ("jdAnalysisId") REFERENCES "jd_analyses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_resumeVersionId_fkey" FOREIGN KEY ("resumeVersionId") REFERENCES "resume_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_resumeVersionId_fkey" FOREIGN KEY ("resumeVersionId") REFERENCES "resume_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_suggestions" ADD CONSTRAINT "ai_suggestions_jdAnalysisId_fkey" FOREIGN KEY ("jdAnalysisId") REFERENCES "jd_analyses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_jdAnalysisId_fkey" FOREIGN KEY ("jdAnalysisId") REFERENCES "jd_analyses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_resumeVersionId_fkey" FOREIGN KEY ("resumeVersionId") REFERENCES "resume_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_status_history" ADD CONSTRAINT "application_status_history_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
