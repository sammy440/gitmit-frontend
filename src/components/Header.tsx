import Link from "next/link";
import { SITE } from "@/lib/site";
import { GitHubIcon, NpmIcon } from "./icons";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 text-sm">
        <Link href="/" aria-label={`${SITE.name} home`} className="flex items-center transition-opacity hover:opacity-80">
          {/* The transparent logo used as a mask, so its color follows the theme. */}
          <span
            aria-hidden="true"
            className="block h-7 w-[105px] bg-logo [mask-image:url(/logo-wordmark.png)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
          />
        </Link>
        <div className="flex items-center gap-5 text-muted">
          <Link href="/#demo" className="hover:text-foreground">
            Demo
          </Link>
          <Link href="/docs/getting-started" className="hover:text-foreground">
            Docs
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-1 text-muted">
          <a
            href={SITE.npm}
            target="_blank"
            rel="noreferrer"
            aria-label="gitmit on npm"
            title="npm"
            className="grid h-9 w-9 place-items-center rounded-md transition hover:bg-surface"
          >
            <NpmIcon className="h-[18px] w-[18px]" />
          </a>
          <a
            href={SITE.github}
            target="_blank"
            rel="noreferrer"
            aria-label="gitmit on GitHub"
            title="GitHub"
            className="grid h-9 w-9 place-items-center rounded-md transition hover:bg-surface hover:text-foreground"
          >
            <GitHubIcon className="h-5 w-5" />
          </a>
        </div>
      </nav>
    </header>
  );
}
