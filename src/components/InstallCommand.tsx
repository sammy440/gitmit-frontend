import { SITE } from "@/lib/site";
import { CopyButton } from "./CopyButton";

/** `tone="dark"` is for use over the hero photo, which is dark in both color schemes. */
export function InstallCommand({ tone = "default" }: { tone?: "default" | "dark" }) {
  const dark = tone === "dark";
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 font-mono text-sm ${
        dark ? "border-white/15 bg-black/40 text-white backdrop-blur-md" : "border-border bg-surface"
      }`}
    >
      <span className={`select-none ${dark ? "text-white/50" : "text-muted"}`}>$</span>
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap">{SITE.install}</code>
      <CopyButton
        text={SITE.install}
        className={dark ? "border-white/20 text-white/70 hover:border-white/60 hover:text-white" : ""}
      />
    </div>
  );
}
