/** Read-only, colored rendering of a unified diff. Long diffs are cut to keep the page fast. */
const MAX_LINES = 1500;

export function DiffView({ diff, className = "" }: { diff: string; className?: string }) {
  const lines = diff.split("\n");
  const shown = lines.slice(0, MAX_LINES);
  return (
    <pre className={`overflow-auto rounded-lg border border-border bg-surface py-2 font-mono text-xs leading-relaxed ${className}`}>
      {shown.map((line, i) => (
        <div key={i} className={`px-3 ${lineStyle(line)}`}>
          {line || " "}
        </div>
      ))}
      {lines.length > MAX_LINES && <div className="px-3 text-muted">... {lines.length - MAX_LINES} more lines</div>}
    </pre>
  );
}

function lineStyle(line: string): string {
  if (line.startsWith("diff --git")) return "mt-2 border-t border-border pt-2 font-semibold first:mt-0 first:border-0 first:pt-0";
  if (line.startsWith("+++") || line.startsWith("---")) return "text-muted";
  if (line.startsWith("@@")) return "text-sky-600 dark:text-sky-300";
  if (line.startsWith("+")) return "bg-add text-add-text";
  if (line.startsWith("-")) return "bg-del text-del-text";
  if (/^(index|new file|deleted file|similarity|rename|old mode|new mode|Binary)/.test(line)) return "text-muted";
  return "";
}
