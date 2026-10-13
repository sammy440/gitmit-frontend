<p align="center">
  <img src=".github/banner.png" alt="gitmit" width="520" />
</p>

<h3 align="center">The website for gitmit</h3>

<p align="center">
  Landing page, interactive demo and documentation for <a href="https://github.com/sammy440/gitmit">gitmit</a>,<br />
  the commit message tool that follows your team's rules.
</p>

<p align="center">
  <a href="https://github.com/sammy440/gitmit">gitmit</a> ·
  <a href="https://www.npmjs.com/package/@gitmit/cli">@gitmit/cli on npm</a> ·
  <a href="#running-locally">Run locally</a> ·
  <a href="#deploying-to-vercel">Deploy</a>
</p>

---

## What's here

**A landing page** that explains gitmit in one screen: what it does, how to install it, and why it's different from other AI commit tools.

**A live demo.** Visitors paste a diff (or pick one of five real examples) and watch gitmit work:

- **What the rules see.** An animated pipeline (Parse → Classify → Detect type → Infer scope) shows gitmit reading the diff: each file classified, noise struck through, then the commit type and scope landing as their steps finish. The analysis really runs in the visitor's browser, and the panel shows how long it took.
- **Suggest messages or split into commits.** A request flow shows each step of the run with a live clock, then the results slide in.
- **Offline by default.** Offline mode runs [`@gitmit/core`](https://www.npmjs.com/package/@gitmit/core) entirely in the browser. No account, no key, nothing sent anywhere, and it costs nothing to host.
- **Bring your own key.** Visitors can paste an OpenAI or Anthropic key to see AI-written messages. The key stays in page memory (gone on reload) and goes only to [gitmit-backend](#how-it-fits-together), which never stores or logs it.

**Documentation:** twelve pages covering install, AI providers, commands, splitting, the git hook, configuration, commitlint, ticket IDs, privacy, internals, the library API and troubleshooting. They're generated from the gitmit README, so the two never disagree, and prerendered as static pages.

## How it fits together

```
                     ┌──────────────────────────────┐
 visitor's browser   │  gitmit-frontend (this repo) │
                     │                              │
   Offline mode ───▶ │  @gitmit/core runs here.     │   nothing leaves the page
                     │                              │
   Key mode ───────▶ │  POST diff + key ───────────────▶ gitmit-backend
                     └──────────────────────────────┘        │ secret scan first
                                                             │ key used once, never stored
                                                             ▼
                                                    OpenAI / Anthropic
```

| Repository | Role |
|---|---|
| [gitmit](https://github.com/sammy440/gitmit) | The CLI and the engine (`@gitmit/core`, `@gitmit/cli` on npm). The README there is the source of the docs pages. |
| **gitmit-frontend** (this repo) | The website. |
| **gitmit-backend** | A small pass-through API for key mode. Not needed for offline mode. |

## Tech stack

| | |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Cache Components, static prerendering) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) with the typography plugin for the docs |
| Animation | [Motion](https://motion.dev) (formerly Framer Motion); respects the visitor's "reduce motion" setting |
| Fonts | [Syne](https://fonts.google.com/specimen/Syne) for text, Geist Mono for code, self-hosted via `next/font` |
| Engine | [`@gitmit/core`](https://www.npmjs.com/package/@gitmit/core), running client-side |
| Docs | Markdown rendered with `react-markdown` and `remark-gfm` |

## Running locally

Requires **Node.js 20.9 or later**.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Offline mode works on its own. To try key mode locally, run gitmit-backend as well (`npm run dev` in that repo starts it on port 8787, which is where `.env.example` points).

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload. |
| `npm run build` | Production build. Prerenders the landing page and every docs page. |
| `npm start` | Serve the production build. |
| `npm run lint` | ESLint, including the React Compiler rules. |

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_GITMIT_API_URL` | `http://localhost:8787` | Where key-mode requests go (gitmit-backend). Not used in offline mode. |

## Deploying to Vercel

1. Push this repository to GitHub and import it in [Vercel](https://vercel.com/new). The Next.js preset is detected automatically; no build settings need changing.
2. Add the environment variable `NEXT_PUBLIC_GITMIT_API_URL` with your backend's URL, for example `https://gitmit-backend.vercel.app`.
3. Deploy. Then add this site's URL to the backend's `ALLOWED_ORIGINS`, so browsers are allowed to call it.

The site works without the backend; only key mode needs it.

## Project structure

```
src/
├── app/
│   ├── layout.tsx            fonts, header, footer, motion settings
│   ├── page.tsx              landing page: hero, demo, features, how it works
│   ├── docs/
│   │   ├── layout.tsx        docs sidebar
│   │   ├── page.tsx          docs index
│   │   └── [slug]/page.tsx   one static page per topic
│   ├── icon.png              favicon (the cat and mouse from the logo)
│   └── apple-icon.png
├── components/
│   ├── Demo.tsx              the interactive demo: input, modes, running requests
│   ├── AnalysisFlow.tsx      animated "What the rules see" pipeline
│   ├── RunFlow.tsx           animated request steps with a live clock
│   ├── HeroBackdrop.tsx      hero photo with its entrance zoom
│   ├── motion.tsx            Reveal and Stagger helpers for scroll animations
│   ├── DiffView.tsx          colored diff rendering
│   ├── Markdown.tsx          docs rendering with heading anchors
│   ├── Header.tsx, Footer.tsx, InstallCommand.tsx, CopyButton.tsx, icons.tsx
├── content/
│   ├── docs.ts               docs pages (generated, see below)
│   └── examples.ts           demo examples, real diffs from the gitmit test fixtures
└── lib/site.ts               site name, links and the backend URL
public/
├── background.jpg            hero photo
├── logo.webp                 the original logo
└── logo-wordmark.png         transparent logo used in the header, colored per theme
scripts/
└── generate-docs.py          rebuilds src/content/docs.ts from the gitmit README
```

## Updating the docs

The docs pages come from the main gitmit README: each `##` section maps to a page, headings move up a level, and links between sections become links between pages.

After the README changes, regenerate and check the result:

```bash
python3 scripts/generate-docs.py ../gitmit/README.md
npm run build
```

The script prints each page's size and lists any links it couldn't resolve. To add a page or change which sections go where, edit the `PAGES` list at the top of the script.

## Design notes

- **Light and dark themes** follow the visitor's system setting. Colors are CSS variables in `src/app/globals.css`.
- **The hero stays dark in both themes**, because the photo is dark. A gradient keeps the headline readable over the brightest part.
- **The logo in the header** is a transparent version of `logo.webp` used as a CSS mask, so its color comes from the theme: the logo's own green (`#88d982`) in dark mode, a deeper green in light mode for contrast on white.
- **Animations are pacing, not delay.** Offline analysis takes about a millisecond, so the pipeline steps are paced to be readable. In key mode the request steps follow the real request: if the backend stops on a secret, the Secret scan step shows the failure.

## Related

- [gitmit](https://github.com/sammy440/gitmit): the CLI and engine, with full documentation
- [`@gitmit/cli`](https://www.npmjs.com/package/@gitmit/cli) and [`@gitmit/core`](https://www.npmjs.com/package/@gitmit/core) on npm

## License

MIT
