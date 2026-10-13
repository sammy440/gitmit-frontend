# gitmit-frontend

The website for [gitmit](https://github.com/sammy440/gitmit): a landing page, an interactive demo, and the documentation.

- **Demo, offline mode:** runs [`@gitmit/core`](https://www.npmjs.com/package/@gitmit/core) in the visitor's browser. No account, no key, nothing sent anywhere, and no cost to you.
- **Demo, key mode:** visitors paste their own OpenAI or Anthropic key. The request goes to [gitmit-backend](../gitmit-backend), which scans the diff for secrets, uses the key for that one call, and never stores or logs it. The key itself is held in page memory only and is gone on reload.
- **Docs:** generated from the gitmit README into `src/content/docs.ts`, and prerendered as static pages.

Built with Next.js 16 (App Router, Cache Components) and Tailwind CSS 4.

## Running locally

```bash
npm install
cp .env.example .env.local     # points key mode at the local backend
npm run dev                    # http://localhost:3000
```

Offline mode works without the backend. For key mode, start [gitmit-backend](../gitmit-backend) too (`npm run dev` there, port 8787).

```bash
npm run build                  # production build; prerenders every page
npm run lint
```

## Deploying to Vercel

1. Push this folder to its own GitHub repository and import it in Vercel. The Next.js preset is detected automatically.
2. Set the environment variable `NEXT_PUBLIC_GITMIT_API_URL` to your deployed backend URL, e.g. `https://gitmit-backend.vercel.app`.
3. In the backend's settings, add this site's URL to `ALLOWED_ORIGINS`.

## Project layout

```
src/
├── app/
│   ├── page.tsx              landing page with the demo
│   ├── docs/                 docs index and one page per topic (static)
│   └── not-found.tsx
├── components/
│   ├── Demo.tsx              the interactive demo (client component)
│   ├── DiffView.tsx          colored diff rendering
│   └── Markdown.tsx          docs rendering (GitHub-flavored markdown)
├── content/
│   ├── docs.ts               docs pages, generated from the gitmit README
│   └── examples.ts           example diffs from the gitmit test fixtures
└── lib/site.ts               site constants and the backend URL
```

## Updating the docs

The docs pages are generated from the main gitmit README, so the two never disagree. After changing the README, regenerate `src/content/docs.ts` (each `##` section of the README maps to a page) and rebuild.
