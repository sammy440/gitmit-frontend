import Link from "next/link";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center">
        <p>
          {SITE.name} is open source under the MIT license.
        </p>
        <div className="flex gap-5 sm:ml-auto">
          <Link href="/docs/getting-started" className="hover:text-foreground">
            Docs
          </Link>
          <Link href="/docs/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <a href={SITE.github} className="hover:text-foreground" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={SITE.npm} className="hover:text-foreground" target="_blank" rel="noreferrer">
            npm
          </a>
        </div>
      </div>
    </footer>
  );
}
