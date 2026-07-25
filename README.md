# Resume Intelligence Platform

Production-oriented Next.js application for resume parsing, deterministic job matching, AI-assisted LaTeX tailoring, semantic search, and application tracking.

## Docker stack

Production uses `Dockerfile.prod` and `compose.prod.yaml`. The production Dockerfile has two runtime targets:

- `runner`: minimal Next.js standalone web image.
- `worker`: BullMQ worker image with the source/runtime required for background AI jobs.

`compose.prod.yaml` runs:

- `app` — Next.js web application on port 3000.
- `worker` — background AI job processor.
- `redis` — durable BullMQ queue storage.
- `postgres` — PostgreSQL 17 with pgvector 0.8.2.
- `migrate` — one-shot Prisma migration service that must succeed before app/worker startup.

Both application images include a restricted `pdflatex` runtime for LaTeX resume previews. File storage remains external through Supabase Storage.

### Start locally

1. Copy the container environment template:

```powershell
Copy-Item .env.docker.example .env.docker
```

2. Set a strong `AUTH_SECRET`, Supabase credentials, and at least one Gemini or Groq key in `.env.docker`.

3. Build and start the stack:

```powershell
docker compose -f compose.prod.yaml --env-file .env.docker up --build -d
```

4. Check service status and logs:

```powershell
docker compose -f compose.prod.yaml --env-file .env.docker ps
docker compose -f compose.prod.yaml --env-file .env.docker logs -f app worker migrate
```

Open [http://localhost:3000](http://localhost:3000). The application health endpoint is [http://localhost:3000/api/health](http://localhost:3000/api/health).

### Common operations

```powershell
# Stop containers but preserve PostgreSQL and Redis data
docker compose -f compose.prod.yaml --env-file .env.docker down

# Stop containers and permanently remove local database/queue volumes
docker compose -f compose.prod.yaml --env-file .env.docker down --volumes

# Rebuild only the web and worker images
docker compose -f compose.prod.yaml --env-file .env.docker build app worker

# Run migrations manually
docker compose -f compose.prod.yaml --env-file .env.docker run --rm migrate
```

### Development stack

`Dockerfile.dev` and `compose.dev.yaml` bind-mount the source tree, preserve container dependencies in named volumes, and enable Next.js hot reload:

```powershell
docker compose -f compose.dev.yaml --env-file .env.docker up --build
```

The `down --volumes` command deletes local container data and cannot be undone.

## Running without Docker

Install Node.js 24, PostgreSQL with pgvector, Redis, and a TeX Live distribution containing `pdflatex`. Then run:

```powershell
npm ci
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Run the worker in a second terminal:

```powershell
npm run workers
```

## Production notes

- Put a reverse proxy or managed load balancer in front of port 3000.
- Do not use the example database password or `AUTH_SECRET` outside local development.
- Do not bake API keys into images; provide them at container runtime.
- Back up the PostgreSQL volume and Supabase Storage independently.
- The built-in request limiter is per web process. Multi-replica deployments should move rate-limit counters to Redis or an edge gateway.
- Scale workers independently from the web service when AI queue volume grows.

### Vercel web + Docker document processor

Vercel should host the web application and API orchestration only. PDF parsing
and LaTeX compilation depend on native binaries and should run in the production
Docker image.

1. Deploy `Dockerfile.prod` to a container host with a public HTTPS URL.
2. Set strong, identical `DOCUMENT_PROCESSOR_TOKEN` and
   `LATEX_COMPILER_TOKEN` values on the container and Vercel.
3. On Vercel, set:

```text
DOCUMENT_PROCESSOR_URL=https://your-processor.example.com
DOCUMENT_PROCESSOR_TOKEN=...
LATEX_COMPILER_URL=https://your-processor.example.com
LATEX_COMPILER_TOKEN=...
```

The Vercel application forwards PDF extraction to
`/api/internal/documents/parse` and LaTeX compilation to
`/api/internal/latex/compile`. Both endpoints reject requests without their
shared bearer token. Docker and local development continue to process documents
locally when the URL variables are absent.

#### Run the processor directly on EC2

Docker is optional. On the EC2 machine that already runs `worker.ts`, install
the Node dependencies and TeX runtime, then start a second process:

```bash
sudo apt-get update
sudo apt-get install -y texlive-latex-base texlive-latex-recommended \
  texlive-latex-extra texlive-fonts-recommended
npm ci
npm run processor
```

Set `PROCESSOR_HOST=127.0.0.1`, `PROCESSOR_PORT=3001`,
`DOCUMENT_PROCESSOR_TOKEN`, and `LATEX_COMPILER_TOKEN` in the EC2 process
environment. Keep `npm run workers` running as its own process; it handles
BullMQ and does not serve HTTP.

Put Nginx or Caddy in front of `127.0.0.1:3001`, enable HTTPS, and point both
Vercel URL variables at that public HTTPS origin. Only port 443 needs to be
open in the EC2 security group.

Use `npx prisma generate && npm run build` as the Vercel build command. Keep
uploaded resumes small enough for the hosting platform's request-body limit;
the application limit is controlled by `MAX_UPLOAD_SIZE_MB`.
