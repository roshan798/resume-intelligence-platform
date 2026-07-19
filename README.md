# Resume Intelligence Platform

Production-oriented Next.js application for resume parsing, deterministic job matching, AI-assisted LaTeX tailoring, semantic search, and application tracking.

## Docker stack

The repository includes one multi-stage `Dockerfile` with two runtime targets:

- `runner`: minimal Next.js standalone web image.
- `worker`: BullMQ worker image with the source/runtime required for background AI jobs.

`compose.yaml` runs:

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
docker compose --env-file .env.docker up --build -d
```

4. Check service status and logs:

```powershell
docker compose --env-file .env.docker ps
docker compose --env-file .env.docker logs -f app worker migrate
```

Open [http://localhost:3000](http://localhost:3000). The application health endpoint is [http://localhost:3000/api/health](http://localhost:3000/api/health).

### Common operations

```powershell
# Stop containers but preserve PostgreSQL and Redis data
docker compose --env-file .env.docker down

# Stop containers and permanently remove local database/queue volumes
docker compose --env-file .env.docker down --volumes

# Rebuild only the web and worker images
docker compose --env-file .env.docker build app worker

# Run migrations manually
docker compose --env-file .env.docker run --rm migrate
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
