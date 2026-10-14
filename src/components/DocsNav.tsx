"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface DocLink {
  slug: string;
  title: string;
}

/** The docs page list: a sidebar on desktop, a compact dropdown on phones. Marks the current page. */
export function DocsNav({ docs }: { docs: readonly DocLink[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = docs.find((d) => pathname === `/docs/${d.slug}`);

  // Close the dropdown after navigating to another page.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const list = (onPick?: () => void) => (
    <ul className="flex flex-col gap-0.5 text-sm">
      {docs.map((doc) => {
        const active = doc === current;
        return (
          <li key={doc.slug}>
            <Link
              href={`/docs/${doc.slug}`}
              onClick={onPick}
              aria-current={active ? "page" : undefined}
              className={`block rounded-md px-3 py-2 transition-colors md:px-2 md:py-1.5 ${
                active ? "bg-surface font-medium text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {doc.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav aria-label="Docs">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-muted">Documentation</p>
        {list()}
      </div>

      {/* Phones: one row that opens the list */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface/50 px-4 py-3 text-left text-sm"
        >
          <span className="text-muted">Docs</span>
          <span className="text-muted">·</span>
          <span className="min-w-0 flex-1 truncate font-medium">{current?.title ?? "All pages"}</span>
          <motion.svg
            viewBox="0 0 16 16"
            className="h-4 w-4 shrink-0 text-muted"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
          >
            <path d="M4 6l4 4 4-4" />
          </motion.svg>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              className="overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="mt-2 rounded-lg border border-border p-1.5">{list(() => setOpen(false))}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
