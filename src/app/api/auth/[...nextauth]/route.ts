// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

// Explicitly lock this endpoint execution to a Node server environment
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const { GET, POST } = handlers;
