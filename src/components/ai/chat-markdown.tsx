"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

export function ChatMarkdown({
    content,
    inverse = false,
}: {
    content: string;
    inverse?: boolean;
}) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                h1: ({ children }) => <h1 className="mb-3 mt-5 text-xl font-bold first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="mb-2 mt-5 text-lg font-bold first:mt-0">{children}</h2>,
                h3: ({ children }) => <h3 className="mb-2 mt-4 font-semibold first:mt-0">{children}</h3>,
                p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-5">{children}</ul>,
                ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-5">{children}</ol>,
                blockquote: ({ children }) => (
                    <blockquote className={cn(
                        "my-3 border-l-2 pl-4 italic",
                        inverse ? "border-background/40" : "border-border text-muted-foreground",
                    )}>
                        {children}
                    </blockquote>
                ),
                a: ({ children, href }) => (
                    <a
                        href={href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="underline underline-offset-4">
                        {children}
                    </a>
                ),
                code: ({ children, className }) => {
                    const block = Boolean(className) || String(children).includes("\n");
                    return (
                        <code className={cn(
                            block
                                ? "block overflow-x-auto border bg-muted p-3 font-mono text-xs text-foreground"
                                : "rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground",
                            className,
                        )}>
                            {children}
                        </code>
                    );
                },
                pre: ({ children }) => <pre className="my-3 overflow-x-auto">{children}</pre>,
                table: ({ children }) => (
                    <div className="my-3 overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">{children}</table>
                    </div>
                ),
                th: ({ children }) => <th className="border bg-muted px-3 py-2 font-semibold text-foreground">{children}</th>,
                td: ({ children }) => <td className="border px-3 py-2 align-top">{children}</td>,
                hr: () => <hr className="my-5 border-border" />,
            }}>
            {content}
        </ReactMarkdown>
    );
}
