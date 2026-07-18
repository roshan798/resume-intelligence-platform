# Authentication Integration Audit

This report is based on a codebase inspection only. No implementation changes were made.

## 1. API Routes Missing Authentication

| Route | Protected? | Current Status | Required Changes |
|------|------|------|------|
| /api/auth/[...nextauth] | Yes | NextAuth handler; authentication infrastructure is present. | No change required. |
| /api/register | No | Public registration endpoint. | Keep public. |
| /api/health | No | Public health check. | Keep public. |
| /api/dashboard | Yes | Uses auth() and checks session.user before calling the dashboard service. | No change required. |
| /api/applications/board | Yes | Uses auth() and passes session.user.id to the service. | No change required. |
| /api/jd/analyze | No | Does not call auth(); uses a placeholder user id string. | Add auth guard, use authenticated user id, and ensure the created JD analysis is scoped to the current user. |
| /api/resumes/upload | Yes | Uses auth() and session.user.id. | No change required. |
| /api/resumes/[id]/versions | No | No auth guard and no ownership validation for the resume id param. | Add auth, verify the resume belongs to the current user, and return 404/403 if not. |
| /api/resumes/versions/[id] | No | No auth guard and no version ownership validation. | Add auth and verify the version belongs to the authenticated user. |
| /api/resumes/versions/[id]/fork | No | No auth guard and no ownership validation for the source version. | Add auth and ensure the source version is owned by the current user. |
| /api/resumes/versions/[id]/finalize | No | No auth guard and no ownership validation. | Add auth and verify the version belongs to the current user. |
| /api/resumes/versions/[id]/archive | No | No auth guard and no ownership validation. | Add auth and verify the version belongs to the current user. |
| /api/applications/[id]/status | No | No auth guard; updates by application id without ownership check. | Add auth and verify the application belongs to the current user. |
| /api/applications/[id]/history | No | No auth guard; exposes history by application id without ownership check. | Add auth and verify the application belongs to the current user. |
| /api/applications/move | No | No auth guard; accepts applicationId from the body without ownership verification. | Add auth and verify the application belongs to the current user. |
| /api/match/[jdId] | No | No auth and no ownership check for the JD analysis id. | Add auth and ensure the JD analysis belongs to the current user. |
| /api/search/resumes | No | No auth; no user scoping. | Add auth and scope search to the current user’s resumes. |
| /api/search/recommend-resume | No | No auth; no user scoping. | Add auth and scope recommendations to the current user’s data. |
| /api/search/jds | No | No auth; no user scoping. | Add auth and scope JD search to the current user’s JD analyses. |
| /api/ai/tailored-draft | No | No auth; uses raw content without user ownership context. | Add auth and bind the request to the current user’s owned resume/JD context. |
| /api/ai/summary | No | No auth; uses raw content without user ownership context. | Add auth and bind the request to the current user’s owned resume/JD context. |
| /api/ai/missing-keywords | No | No auth; no user context. | Add auth and bind the request to the current user’s owned resume data. |
| /api/ai/rewrite-bullets | No | No auth; no user context. | Add auth and bind the request to the current user’s owned resume/JD context. |

## 2. Services That Still Accept userId

| File | Method | Current Signature | Suggested Signature |
|------|------|------|------|
| src/modules/resumes/services/upload-resume.service.ts | execute | execute(userId, dto) | execute(currentUser, dto) |
| src/modules/jd/services/analyze-jd.service.ts | execute | execute(userId, request) | execute(currentUser, request) |
| src/modules/dashboard/services/dashboard.service.ts | execute | execute(userId) | execute(currentUser) |
| src/modules/dashboard/services/get-dashboard-stats.service.ts | execute | execute(userId) | execute(currentUser) |
| src/modules/applications/services/get-kanban-board.service.ts | execute | execute(userId) | execute(currentUser) |
| src/modules/match/services/run-match-analysis.service.ts | execute | execute(jdAnalysisId, parsedKeywords, userId) | execute(jdAnalysisId, parsedKeywords, currentUser) |

## 3. Repositories

Repository methods that are user-scoped and should continue to receive the authenticated user id:

- src/modules/applications/repositories/application.repository.ts
  - findByUserId(userId) — correctly scoped for the current user.
- src/modules/dashboard/repositories/dashboard.repository.ts
  - getStats(userId), getRecentResumes(userId), getRecentApplications(userId) — correctly scoped.
- src/modules/resumes/repositories/resume.repository.ts
  - createResume(userId, ...) — correctly scoped.
  - getActiveVersions(userId) — correctly scoped.
- src/modules/resumes/repositories/resume-version.repository.ts
  - getActiveVersions(userId) — correctly scoped.
  - findById(id) — should eventually be replaced with a current-user-aware lookup.
  - getLineage(resumeId) — should always be scoped to the authenticated user’s resume.
  - updateDraft(id, data) — should enforce ownership before update.
- src/modules/match/repositories/match-result.repository.ts
  - getByAnalysis(jdAnalysisId) — should be scoped to the current user’s JD analysis.
  - getById(id) — should require ownership validation.
- src/modules/search/repositories/semantic-search.repository.ts
  - findSimilarResumes(...) and findSimilarJDs(...) — currently not scoped to the current user and should receive the authenticated user id.
- src/modules/background-jobs/repositories/background-job.repository.ts
  - create/findById/findByQueueId/update/... — should be user-aware when reading or updating a job for the current user.

## 4. Hardcoded User IDs

Application-source occurrences found:

- src/app/api/jd/analyze/route.ts
  - Uses the literal string "temporary-user-id".

No other hardcoded user-id values such as "user-1" or "demo-user" were found in the application source. Generated Prisma artifacts contain UUID defaults and schema references, but they are not application-level hardcoded user ids.

## 5. Route Params vs Session

Endpoints that use route params and need ownership validation:

- src/app/api/resumes/[id]/versions/route.ts
  - Uses params.id as a resume id. Missing ownership verification.
- src/app/api/resumes/versions/[id]/route.ts
  - Uses params.id as a version id. Missing ownership verification.
- src/app/api/resumes/versions/[id]/fork/route.ts
  - Uses params.id as a version id. Missing ownership verification.
- src/app/api/resumes/versions/[id]/finalize/route.ts
  - Uses params.id as a version id. Missing ownership verification.
- src/app/api/resumes/versions/[id]/archive/route.ts
  - Uses params.id as a version id. Missing ownership verification.
- src/app/api/applications/[id]/status/route.ts
  - Uses params.id as an application id. Missing ownership verification.
- src/app/api/applications/[id]/history/route.ts
  - Uses params.id as an application id. Missing ownership verification.
- src/app/api/applications/move/route.ts
  - Uses applicationId from the request body. Missing ownership verification.
- src/app/api/match/[jdId]/route.ts
  - Uses params.jdId as a JD analysis id. Missing ownership verification.

## 6. Dashboard

Inspection result:

- Dashboard queries are already scoped by authenticated user in src/modules/dashboard/repositories/dashboard.repository.ts.
- The dashboard route in src/app/api/dashboard/route.ts correctly requires auth and passes the current session user id.
- No missing dashboard filters were found in the repository layer.

## 7. Resume Module

Resume operations inspected:

- upload — protected and uses the authenticated user id.
- archive — missing auth and missing ownership verification.
- fork — missing auth and missing ownership verification.
- finalize — missing auth and missing ownership verification.
- update — missing auth and missing ownership verification.
- lineage — missing auth and missing ownership verification.

The highest-risk gap is that resume-version operations are currently keyed only by id and do not prove that the resource belongs to the current user.

## 8. JD Module

JD operations inspected:

- analyze — missing auth and uses a placeholder id.
- match — missing auth and missing ownership validation for the JD analysis.
- search — missing auth and no current-user scoping.
- recommend — missing auth and no current-user scoping.

All of these should be tied to the current user and should only return data that belongs to that user.

## 9. Match Module

Match services and repositories currently do not enforce user ownership:

- src/modules/match/services/run-match-analysis.service.ts uses userId in the service signature, but the match result routes do not enforce that the JD analysis and match results belong to the current user.
- src/modules/match/repositories/match-result.repository.ts exposes data by analysis id and id without user scoping.
- src/app/api/match/[jdId]/route.ts can expose another user’s match results if the id is known.

## 10. Search Module

Semantic search is not currently scoped to the authenticated user:

- src/modules/search/repositories/semantic-search.repository.ts runs raw SQL against resume_versions and jd_analyses without filtering by user.
- src/modules/search/services/search-similar-resumes.service.ts and search-similar-jds.service.ts do not receive current-user context.

This is a direct data leakage risk for private resume and JD content.

## 11. Applications Module

Applications operations inspected:

- kanban/board — protected and uses the authenticated user id.
- history — missing auth and missing ownership verification for the application id.
- move — missing auth and missing ownership verification for the application id.
- status — missing auth and missing ownership verification for the application id.

The application update services should verify that the target application belongs to the current user before changing status or reading history.

## 12. AI Module

All AI endpoints are currently unauthenticated and operate on raw request content rather than user-owned resources.

Required changes:

- AI Suggestions — should require auth and attach the current user when resolving the relevant resume/JD context.
- Tailored Drafts — should require auth and only use the current user’s owned resume/JD data.
- Summaries — should require auth and use the current user’s owned resume/JD data.
- Missing Keywords — should require auth and use the current user’s owned resume content.

## 13. Background Jobs

Background jobs should carry an owner:

- src/modules/background-jobs/dto/create-job.dto.ts already contains userId.
- src/workers/jobs/resume.job.ts also carries userId in the job payload.
- The background job repository should store and retrieve jobs with user ownership in mind.
- Processors should validate that the job belongs to the current user before reporting progress or returning results.

## 14. Middleware

Inspection of src/middleware.ts:

Protected routes:

- /dashboard
- /resumes
- /applications
- /ai
- /settings

Public routes:

- /login
- /register
- / (home)
- /api/auth
- /api/register
- /api/health

Routes missing middleware protection:

- /matches
- /match-results
- any other user-data routes that should be protected but are not listed in the matcher

## 15. Server Components

Pages that should call auth() and currently do not:

- src/app/dashboard/page.tsx — should require auth and redirect unauthenticated users.
- src/app/resumes/[resumeId]/versions/[versionId]/page.tsx — should require auth and verify the version belongs to the current user.
- src/app/matches/[matchId]/page.tsx — should require auth and verify the match belongs to the current user.
- src/app/match-results/[jdId]/page.tsx — should require auth and verify the JD analysis belongs to the current user.
- src/app/ai/draft/page.tsx — should require auth.
- src/app/ai/suggestions/page.tsx — should require auth.
- src/app/ai/rewrite/page.tsx — should require auth.

Pages that are public and do not need auth:

- src/app/page.tsx
- src/app/login/page.tsx
- src/app/register/page.tsx

## 16. Client Components

Client-side auth-related usage:

- src/components/auth/login-form.tsx — uses signIn() correctly.
- src/components/auth/register-form.tsx — uses signIn() but does not handle failed registration or 401-style errors.
- src/components/auth/logout-button.tsx — uses signOut().

Client-side fetch concerns:

- The register form calls /api/register directly and does not surface failure states clearly.
- No client components currently use useSession() or redirect on 401/403 responses.
- No client component currently demonstrates a full authenticated fetch flow with loading and error states.

## 17. NextAuth Usage

Files already using NextAuth primitives:

- auth()
  - src/auth.ts
  - src/lib/auth/session.ts
  - src/app/api/dashboard/route.ts
  - src/app/api/applications/board/route.ts
  - src/app/api/resumes/upload/route.ts
  - src/app/ai/layout.tsx
  - src/app/dashboard/layout.tsx
  - src/app/match-results/[jdId]/layout.tsx
  - src/app/matches/[matchId]/layout.tsx
  - src/app/resumes/layout.tsx
  - src/components/auth/current-user.tsx
- getServerSession()
  - Not used anywhere in the inspected codebase.
- useSession()
  - Not used anywhere in the inspected codebase.
- signIn()
  - src/components/auth/login-form.tsx
  - src/components/auth/register-form.tsx
- signOut()
  - src/components/auth/logout-button.tsx

## 18. Security Issues

| Severity | Issue | Evidence |
|------|------|------|
| Critical | Missing authentication on multiple API routes | /api/jd/analyze, /api/resumes/versions/*, /api/applications/*, /api/match/[jdId], search routes, and AI routes are not guarded by auth(). |
| Critical | Missing ownership validation for resource-id routes | Resume versions, applications, and JD analysis resources are accessed by id without verifying that the current user owns them. |
| High | IDOR risk on route params and body ids | The application and resume-version endpoints allow an attacker to supply another user’s id and read/update private data. |
| High | Semantic search exposes private data across users | Search repositories query all resume versions and JD analyses without user scoping. |
| High | Placeholder user id bypasses per-user isolation | src/app/api/jd/analyze/route.ts uses "temporary-user-id" instead of the authenticated user id. |
| Medium | Server components do not enforce auth before rendering protected data | Dashboard, resume detail, match, and AI pages do not call auth() before fetching user data. |
| Medium | Client components do not handle 401/403 flows | Protected fetch calls and auth forms lack robust error handling and redirect behavior. |
| Low | Middleware does not protect every user-data page | /matches and /match-results are not covered by the middleware matcher. |

## 19. Priority Order

### Phase 1 (Critical)
- [ ] Add auth() guards to all unauthenticated API routes.
- [ ] Replace the placeholder user id in the JD analyze route with the authenticated user id.
- [ ] Enforce ownership checks for resume-version, application, and JD-analysis routes using route params or request bodies.
- [ ] Scope semantic search and match-result queries to the authenticated user.

### Phase 2
- [ ] Refactor services to accept the current user object instead of raw userId arguments where possible.
- [ ] Add current-user filtering to repositories that read or update private data.
- [ ] Protect AI routes and bind them to user-owned resume/JD resources.
- [ ] Extend middleware protection to all pages that render private data.

### Phase 3
- [ ] Add auth-aware server component guards and redirect logic for protected pages.
- [ ] Improve client-side fetch flows with session loading and 401/403 handling.
- [ ] Standardize background job ownership validation in processors and job retrieval endpoints.

Estimated files needing modification: about 25 to 30 files.
