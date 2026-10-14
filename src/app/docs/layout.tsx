import { DocsNav } from "@/components/DocsNav";
import { DOCS } from "@/content/docs";

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[210px_minmax(0,1fr)] md:gap-10 md:py-10">
      <div className="md:sticky md:top-20 md:self-start">
        <DocsNav docs={DOCS.map(({ slug, title }) => ({ slug, title }))} />
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
