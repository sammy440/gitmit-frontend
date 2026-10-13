"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copy", className = "" }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard unavailable (e.g. insecure context); the text stays selectable.
        }
      }}
      // A custom className replaces the default colors rather than competing with them.
      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
        className || "border-border text-muted hover:border-accent hover:text-foreground"
      }`}
      aria-label={copied ? "Copied" : label}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
