import type { Metadata } from "next";
import Link from "next/link";
import { DOCS } from "@/content/docs";

export const metadata: Metadata = { title: "Documentation" };

export default function DocsIndex() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Documentation</h1>
      <p className="mt-2 text-muted">Everything about installing, configuring and using gitmit.</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {DOCS.map((doc) => (
          <li key={doc.slug}>
            <Link href={`/docs/${doc.slug}`} className="block h-full rounded-lg border border-border p-4 transition hover:border-accent">
              <p className="font-medium">{doc.title}</p>
              <p className="mt-1 text-sm text-muted">{doc.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
