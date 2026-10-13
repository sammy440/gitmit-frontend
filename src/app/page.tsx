import Link from "next/link";
import background from "../../public/background.jpg";
import { Demo } from "@/components/Demo";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { InstallCommand } from "@/components/InstallCommand";
import { SITE } from "@/lib/site";

const FEATURES = [
  {
    title: "Rules first, AI second",
    body: "Type and scope come from deterministic rules. When the rules are sure (only docs, only tests, a version bump), the AI can't override them. The model writes what rules can't: what changed and why.",
  },
  {
    title: "Your team's rules, enforced",
    body: "Reads your commitlint config and checks every suggestion against it before you see it. Allowed types, scopes, length limits and ticket IDs from the branch name.",
  },
  {
    title: "Secrets stay on your machine",
    body: "Before anything goes to a remote AI, gitmit scans for API keys, tokens, private keys and .env files. If it finds one, nothing is sent.",
  },
  {
    title: "Works offline",
    body: "No API key? gitmit still writes messages from rules alone. Prefer local models? Use Ollama and nothing leaves your computer.",
  },
  {
    title: "Splits messy changes",
    body: "Staged three unrelated things? gitmit split turns them into focused commits, rehearsed first and fully restored if anything fails.",
  },
  {
    title: "Noise is ignored",
    body: "Lockfiles, build output, minified files, snapshots and binaries are recognized and never sent to a model, so they don't drown out the real change.",
  },
];

const PIPELINE = ["Parse", "Classify", "Detect type", "Infer scope", "Summarize", "Secret scan", "Generate", "Validate"];

export default function Home() {
  return (
    <>
      {/* The photo is dark, so the hero stays dark in light mode too. */}
      <section className="relative isolate overflow-hidden bg-black text-white">
        <HeroBackdrop src={background} />
        {/* Keep the headline readable over the bright droplets, and fade into the page below. */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/60 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-b from-transparent to-background" />

        <Stagger onMount interval={0.12} delay={0.15} className="mx-auto max-w-6xl px-4 pb-28 pt-24 sm:pb-36 sm:pt-32">
          <StaggerItem>
            <p className="font-mono text-sm text-emerald-300">git add -A &amp;&amp; gitmit</p>
          </StaggerItem>
          <StaggerItem>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-7xl">{SITE.tagline}</h1>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-6 max-w-2xl text-lg text-white/75">{SITE.description}</p>
          </StaggerItem>
          <StaggerItem className="mt-10 flex max-w-xl flex-col gap-4">
            <InstallCommand tone="dark" />
            <div className="flex flex-wrap gap-3 text-sm">
              <Link href="#demo" className="rounded-md bg-emerald-400 px-4 py-2 font-semibold text-black hover:bg-emerald-300">
                Try it in your browser
              </Link>
              <Link
                href="/docs/getting-started"
                className="rounded-md border border-white/25 px-4 py-2 font-medium text-white backdrop-blur-sm hover:border-white/60"
              >
                Read the docs
              </Link>
            </div>
          </StaggerItem>
        </Stagger>
      </section>

      <section id="demo" className="scroll-mt-16 border-y border-border bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-tight">Try it</h2>
            <p className="mt-2 max-w-2xl text-muted">
              Paste a diff, or pick an example. Offline mode runs gitmit&apos;s rules right here in your browser, with no
              account and no key. Bring your own OpenAI or Anthropic key to see AI-written messages.
            </p>
          </Reveal>
          <Reveal className="mt-8" delay={0.1}>
            <Demo />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">Why gitmit</h2>
        </Reveal>
        <Stagger className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <StaggerItem
              key={f.title}
              className="rounded-lg border border-border p-5 transition-colors duration-300 hover:border-accent/50 hover:bg-surface/50"
            >
              <h3 className="font-medium">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        </Reveal>
        <Stagger as="ol" interval={0.07} className="mt-6 flex flex-wrap items-center gap-2 font-mono text-sm">
          {PIPELINE.map((step, i) => (
            <StaggerItem as="li" key={step} className="flex items-center gap-2">
              <span className="rounded-md border border-border px-3 py-1.5">{step}</span>
              {i < PIPELINE.length - 1 && <span className="text-accent">→</span>}
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal delay={0.3}>
          <p className="mt-4 max-w-2xl text-sm text-muted">
            The model only sees a bounded, secret-scanned summary, and every suggestion is checked against your rules before
            you see it.{" "}
            <Link href="/docs/how-it-works" className="text-accent underline-offset-4 hover:underline">
              Read the details
            </Link>
            .
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-20">
        <Reveal className="rounded-xl border border-border p-8 sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight">Get started in a minute</h2>
          <div className="mt-6 max-w-xl">
            <InstallCommand />
          </div>
          <pre className="mt-4 max-w-xl overflow-x-auto rounded-lg bg-surface p-4 font-mono text-sm leading-relaxed">
            <span className="text-muted"># stage your changes, then</span>
            {"\n"}gitmit{"            "}
            <span className="text-muted"># pick a message and commit</span>
            {"\n"}gitmit split{"      "}
            <span className="text-muted"># or split into focused commits</span>
            {"\n"}gitmit --push{"     "}
            <span className="text-muted"># commit, then push</span>
          </pre>
          <p className="mt-4 text-sm text-muted">
            Requires Node.js 20.12 or later.{" "}
            <Link href="/docs/providers" className="text-accent underline-offset-4 hover:underline">
              Add an API key
            </Link>{" "}
            for AI-written messages, or keep it fully offline.
          </p>
        </Reveal>
      </section>
    </>
  );
}
