import Link from "next/link";
import { SITE } from "@/lib/site";
import { GitHubIcon, NpmIcon } from "./icons";
import { MobileNav } from "./MobileNav";
import { NavLink } from "./NavLink";

/** Links shared by the desktop nav and the mobile menu. */
export const NAV_LINKS = [
  { href: "/#demo", label: "Demo" },
  { href: "/#vscode", label: "VS Code" },
  { href: "/docs/getting-started", label: "Docs", match: "/docs" },
  { href: "/account", label: "Account", match: "/account" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <nav aria-label="Main" className="relative mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 text-sm">
        <Link href="/" aria-label={`${SITE.name} home`} className="flex shrink-0 items-center transition-opacity hover:opacity-80">
          {/* The transparent logo used as a mask, so its color follows the theme. */}
          <span
            aria-hidden="true"
            className="block h-7 w-[105px] bg-logo [mask-image:url(/logo-wordmark.png)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
          />
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-5 whitespace-nowrap text-muted md:flex">
          {NAV_LINKS.slice(0, 3).map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </div>
        <div className="ml-auto hidden items-center gap-1 text-muted md:flex">
          <NavLink {...NAV_LINKS[3]} className="mr-2 rounded-md px-2 py-1" />
          <BrandLinks />
        </div>

        {/* Mobile */}
        <MobileNav links={NAV_LINKS}>
          <BrandLinks labelled />
        </MobileNav>
      </nav>
    </header>
  );
}

function BrandLinks({ labelled = false }: { labelled?: boolean }) {
  const base = labelled
    ? "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-base transition hover:bg-surface"
    : "grid h-9 w-9 place-items-center rounded-md transition hover:bg-surface";
  return (
    <>
      <a href={SITE.npm} target="_blank" rel="noreferrer" aria-label={labelled ? undefined : "gitmit on npm"} title="npm" className={base}>
        <NpmIcon className="h-[18px] w-[18px]" />
        {labelled && <span>npm</span>}
      </a>
      <a
        href={SITE.github}
        target="_blank"
        rel="noreferrer"
        aria-label={labelled ? undefined : "gitmit on GitHub"}
        title="GitHub"
        className={`${base} hover:text-foreground`}
      >
        <GitHubIcon className="h-5 w-5" />
        {labelled && <span>GitHub</span>}
      </a>
    </>
  );
}
