import Link from "next/link";
import { DOCS } from "@/content/docs";

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-[200px_minmax(0,1fr)]">
      <nav aria-label="Docs" className="md:sticky md:top-20 md:self-start">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Documentation</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm md:flex-col">
          {DOCS.map((doc) => (
            <li key={doc.slug}>
              <Link href={`/docs/${doc.slug}`} className="text-muted hover:text-foreground">
                {doc.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
