"""Generate src/content/docs.ts from the gitmit README.

Usage: python3 scripts/generate-docs.py [path/to/gitmit/README.md]
Each "## " section of the README maps to a docs page (see PAGES below).
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
readme_path = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / "gitmit" / "README.md"
readme = readme_path.read_text()
sections = {}
for m in re.finditer(r'^## (.+?)\n(.*?)(?=^## |\Z)', readme, re.S | re.M):
    sections[m.group(1).strip()] = m.group(2).strip().rstrip('-').strip()

PAGES = pages = [
  ("getting-started", "Getting started", "Install gitmit and write your first commit message.", ["Why gitmit", "Install", "Quick start"]),
  ("providers", "AI providers", "OpenAI, Anthropic, Ollama or fully offline: set up your keys.", ["Choosing an AI provider"]),
  ("commands", "Commands", "Every command and option, including scripts and CI.", ["Commands"]),
  ("splitting", "Splitting commits", "Turn one messy set of changes into focused commits, safely.", ["Splitting messy changes"]),
  ("pull-requests", "Pull requests", "Write the title and description for your branch, and open it.", ["Pull requests"]),
  ("git-hook", "The git hook", "Get a suggestion every time you run git commit.", ["The git hook"]),
  ("configuration", "Configuration", "Share settings with your team, and every option explained.", ["Team configuration"]),
  ("commitlint", "commitlint", "Follow the commit rules your repository already enforces.", ["commitlint"]),
  ("tickets", "Ticket IDs", "Add PROJ-123 from your branch name to every message.", ["Ticket IDs from branch names"]),
  ("privacy", "Privacy and secrets", "What is sent to an AI, what never is, and the secret scan.", ["Privacy and secrets"]),
  ("how-it-works", "How it works", "The pipeline, the type rules and how the model is used.", ["How it works"]),
  ("api", "Using the engine", "Use @gitmit/core in your own scripts, apps and extensions.", ["Using the engine in your own tools"]),
  ("troubleshooting", "Troubleshooting", "Every error message, and what to do about it.", ["Troubleshooting"]),
]
anchor_to_page = {}
def slugify(h): return re.sub(r'[^a-z0-9 -]', '', h.lower()).replace(' ', '-')
for slug, _, _, secs in pages:
    for s in secs:
        anchor_to_page[slugify(s)] = slug
        for h in re.findall(r'^### (.+)$', sections[s], re.M):
            anchor_to_page.setdefault(slugify(h), slug)

out = []
for slug, title, desc, secs in pages:
    parts = []
    for s in secs:
        body = sections[s]
        if len(secs) > 1:
            body = f"## {s}\n\n{body}"
        else:
            body = re.sub(r'^### ', '## ', body, flags=re.M)
        parts.append(body)
    body = "\n\n".join(parts)
    body = re.sub(r'^#### ', '### ', body, flags=re.M)
    def link(m):
        text, anchor = m.group(1), m.group(2)
        page = anchor_to_page.get(anchor)
        if not page: return text
        return f"[{text}](/docs/{page}#{anchor})" if anchor not in [slugify(x) for x in [s for p in pages if p[0]==page for s in p[3]]] else f"[{text}](/docs/{page})"
    body = re.sub(r'\[([^\]]+)\]\(#([^)]+)\)', link, body)
    body = body.replace("](LICENSE)", "](https://github.com/sammy440/gitmit/blob/master/LICENSE)")
    out.append({"slug": slug, "title": title, "description": desc, "body": body.strip() + "\n"})

ts = '''// Generated from the gitmit README (github.com/sammy440/gitmit). Regenerate when the README changes.

export interface DocPage {
  slug: string;
  title: string;
  description: string;
  /** Markdown. */
  body: string;
}

export const DOCS: DocPage[] = ''' + json.dumps(out, indent=2, ensure_ascii=False) + ''';

export function findDoc(slug: string): DocPage | undefined {
  return DOCS.find((doc) => doc.slug === slug);
}
'''
(ROOT / 'src' / 'content' / 'docs.ts').write_text(ts)
for p in out: print(p["slug"], len(p["body"]))
leftover = re.findall(r'\]\(#[^)]+\)', "".join(p["body"] for p in out))
print("unresolved anchors:", leftover)
