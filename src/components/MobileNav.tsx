"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { NavLink } from "./NavLink";

/** The mobile menu: closes on link tap, Escape, page change, or when the screen grows to desktop. */
export function MobileNav({
  links,
  children,
}: {
  links: readonly { href: string; label: string; match?: string }[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();

  // Close when the page changes (resetting state during render, as React recommends).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const desktop = window.matchMedia("(min-width: 768px)");
    const onResize = () => desktop.matches && setOpen(false);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <div className="ml-auto md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        className="relative grid h-10 w-10 place-items-center rounded-md text-foreground transition hover:bg-surface"
      >
        {/* Two bars that turn into an X. */}
        <motion.span
          className="absolute h-0.5 w-5 rounded bg-current"
          animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          className="absolute h-0.5 w-5 rounded bg-current"
          animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 4 }}
          transition={{ duration: 0.2 }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Dim the page behind; tapping it closes the menu. (Positioned from the nav: the header's
                backdrop blur makes `fixed` children relative to the header, not the screen.) */}
            <motion.div
              className="absolute inset-x-0 top-full z-20 h-[calc(100dvh-3.5rem)] bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              id={panelId}
              className="absolute inset-x-0 top-full z-30 border-b border-border bg-background px-4 pb-5 pt-2 shadow-xl shadow-black/20"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <ul className="flex flex-col">
                {links.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * i, duration: 0.2 }}
                  >
                    <NavLink
                      {...link}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-3 text-base text-muted hover:bg-surface aria-[current=page]:bg-surface"
                    />
                  </motion.li>
                ))}
              </ul>
              <div className="mt-2 flex gap-2 border-t border-border pt-3 text-muted">{children}</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
