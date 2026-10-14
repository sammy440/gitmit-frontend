"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import { SITE } from "@/lib/site";
import vscodeIcon from "../../public/editor-vscode.png";
import { CopyButton } from "./CopyButton";
import { CursorIcon, VSCodiumIcon, WindsurfIcon } from "./icons";

interface Editor {
  id: string;
  name: string;
  icon: React.ReactNode;
  /** The editor's command-line tool. */
  cli: string;
  /** `short` labels the card; `name` the button. */
  store: { name: string; short: string; url: string };
  /** A link that opens the extension straight in the editor, where the editor supports one. */
  deepLink?: string;
}

const EDITORS: Editor[] = [
  {
    id: "vscode",
    name: "VS Code",
    icon: <Image src={vscodeIcon} alt="" width={22} height={22} className="h-[22px] w-[22px]" />,
    cli: "code",
    store: { name: "VS Code Marketplace", short: "Marketplace", url: SITE.vscode.marketplace },
    deepLink: SITE.vscode.deepLink,
  },
  { id: "cursor", name: "Cursor", icon: <CursorIcon className="h-5 w-5" />, cli: "cursor", store: { name: "Open VSX", short: "Open VSX", url: SITE.openVsx } },
  { id: "windsurf", name: "Windsurf", icon: <WindsurfIcon className="h-5 w-5" />, cli: "windsurf", store: { name: "Open VSX", short: "Open VSX", url: SITE.openVsx } },
  { id: "vscodium", name: "VSCodium", icon: <VSCodiumIcon className="h-5 w-5" />, cli: "codium", store: { name: "Open VSX", short: "Open VSX", url: SITE.openVsx } },
];

/** Pick your editor: its install command, store link and (for VS Code) a one-click open. */
export function EditorInstall() {
  const [selected, setSelected] = useState(EDITORS[0]!.id);
  const editor = EDITORS.find((e) => e.id === selected)!;
  const command = `${editor.cli} --install-extension gitmit.gitmit`;

  return (
    <div className="rounded-xl border border-border bg-surface/30 p-4 sm:p-5">
      <div role="radiogroup" aria-label="Your editor" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {EDITORS.map((e) => {
          const active = e.id === selected;
          return (
            <button
              key={e.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(e.id)}
              className={`relative flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
                active ? "border-accent/70 bg-background" : "border-border hover:border-accent/40 hover:bg-background/60"
              }`}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-background text-foreground">{e.icon}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{e.name}</span>
                <span className="block truncate text-[11px] text-muted">{e.store.short}</span>
              </span>
              {active && (
                <motion.span
                  layoutId="editor-active"
                  className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-accent/60"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={editor.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center"
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 font-mono text-xs sm:text-sm">
            <span className="select-none text-muted">$</span>
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap">{command}</code>
            <CopyButton text={command} />
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {editor.deepLink && (
              <a href={editor.deepLink} className="rounded-md bg-accent px-4 py-2 font-semibold text-background hover:opacity-90">
                Open in {editor.name}
              </a>
            )}
            <a
              href={editor.store.url}
              target="_blank"
              rel="noreferrer"
              className={`rounded-md px-4 py-2 font-medium ${
                editor.deepLink ? "border border-border hover:border-accent" : "bg-accent font-semibold text-background hover:opacity-90"
              }`}
            >
              View on {editor.store.name}
            </a>
          </div>
        </motion.div>
      </AnimatePresence>
      <p className="mt-3 text-xs text-muted">
        Or search <strong className="font-medium text-foreground">gitmit</strong> in {editor.name}&apos;s Extensions view.
        {editor.deepLink ? "" : " Also available in other editors that use Open VSX, such as Gitpod and Eclipse Theia."}
      </p>
    </div>
  );
}
