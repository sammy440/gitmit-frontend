import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { DOCS, findDoc } from "@/content/docs";

export function generateStaticParams() {
  return DOCS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps<"/docs/[slug]">): Promise<Metadata> {
  const doc = findDoc((await params).slug);
  return doc ? { title: doc.title, description: doc.description } : {};
}

export default async function DocPage({ params }: PageProps<"/docs/[slug]">) {
  const { slug } = await params;
  const doc = findDoc(slug);
  if (!doc) notFound();
  const index = DOCS.indexOf(doc);
  const previous = DOCS[index - 1];
  const next = DOCS[index + 1];

  return (
    <article>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{doc.title}</h1>
      <p className="mt-2 text-muted">{doc.description}</p>
      <div className="mt-8">
        <Markdown source={doc.body} />
      </div>
      <nav className="mt-12 flex flex-wrap gap-4 border-t border-border pt-6 text-sm">
        {previous && (
          <Link href={`/docs/${previous.slug}`} className="text-muted hover:text-foreground">
            ← {previous.title}
          </Link>
        )}
        {next && (
          <Link href={`/docs/${next.slug}`} className="ml-auto text-muted hover:text-foreground">
            {next.title} →
          </Link>
        )}
      </nav>
    </article>
  );
}
