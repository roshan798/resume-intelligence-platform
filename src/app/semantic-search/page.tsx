import { SemanticSearchPanel } from "@/components/search/semantic-search-panel";

export default function SemanticSearchPage() {
    return (
        <main className="container mx-auto max-w-5xl space-y-8 px-4 py-8">
            <div>
                <h1 className="text-3xl font-bold">Semantic search</h1>
                <p className="mt-2 text-muted-foreground">
                    Find conceptually similar resumes and job descriptions using Gemini embeddings. Deterministic match scores remain separate.
                </p>
            </div>
            <SemanticSearchPanel />
        </main>
    );
}
