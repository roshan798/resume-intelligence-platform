"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SearchResult {
    id: string;
    resumeId?: string;
    jobDescriptionId?: string | null;
    title?: string;
    versionNumber?: number;
    roleTitle?: string | null;
    company?: string | null;
    similarity: number;
}

export function SemanticSearchPanel() {
    const [kind, setKind] = useState<"resumes" | "jds">("resumes");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isBusy, setIsBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function search(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsBusy(true);
        setError(null);
        const query = String(new FormData(event.currentTarget).get("query") || "");
        try {
            const response = await fetch(`/api/search/${kind}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            });
            const body = await response.json() as SearchResult[] | { message?: string };
            if (!response.ok || !Array.isArray(body)) {
                throw new Error(!Array.isArray(body) && body.message ? body.message : "Search failed.");
            }
            setResults(body);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Search failed.");
            setResults([]);
        } finally {
            setIsBusy(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                <Button variant={kind === "resumes" ? "default" : "outline"} onClick={() => { setKind("resumes"); setResults([]); }}>Resumes</Button>
                <Button variant={kind === "jds" ? "default" : "outline"} onClick={() => { setKind("jds"); setResults([]); }}>Job descriptions</Button>
            </div>
            <form onSubmit={search} className="space-y-3">
                <textarea name="query" required minLength={3} rows={8} className="w-full resize-y rounded border bg-background p-4 text-sm" placeholder={kind === "resumes" ? "Describe the experience, technologies, and role you need…" : "Describe a role to find semantically similar saved job descriptions…"} />
                <Button type="submit" disabled={isBusy}>{isBusy ? "Indexing and searching…" : "Semantic search"}</Button>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </form>
            <div className="space-y-3">
                {results.map((result) => (
                    <Card key={result.id}>
                        <CardHeader className="flex-row items-center justify-between gap-3">
                            <CardTitle>{result.title || result.roleTitle || "Untitled"}</CardTitle>
                            <Badge>{Math.max(0, result.similarity * 100).toFixed(1)}% similar</Badge>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                            <span>{result.title ? `Resume version ${result.versionNumber}` : result.company || "Company not specified"}</span>
                            {result.resumeId ? <Link className="underline" href={`/resumes/${result.resumeId}/versions/${result.id}`}>Open version</Link> : null}
                            {result.jobDescriptionId ? <Link className="underline" href={`/job-descriptions/${result.jobDescriptionId}`}>Open JD</Link> : null}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
